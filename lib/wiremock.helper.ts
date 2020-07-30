import * as fs from 'fs';
import {request, RequestOptions} from 'http';
import * as path from 'path';
import {parse} from 'url';
import {StubMapping, ScenarioList, ListStubMappingResults} from './wiremock-domain';

/**
 * Helper to interact with Wiremock. Specifications of actions can be found at http://wiremock.org/docs/api/
 *
 * @see StubMappingBuilder
 * @see RequestPatternBuilder
 *
 */
export class WiremockHelper {

    private readonly defaultOptions: RequestOptions;

    /**
     * Construct the Wiremock client
     *
     * @param baseUrl the url the Wiremock runs on (ex: http://localhost:8400/)
     *
     * @see http://wiremock.org/docs/
     */
    constructor(baseUrl: string = 'http://localhost:8080') {
        const thisBaseUrl = parse(baseUrl);
        this.defaultOptions = {
            hostname: thisBaseUrl.hostname,
            port: thisBaseUrl.port,
            protocol: thisBaseUrl.protocol
        };
    }

    /**
     * Obtain all scenarios from the stub
     */
    getScenarios(): Promise<ScenarioList> {
        return this.performRequest({
            method: 'GET',
            path: '/__admin/scenarios'
        });
    }

    /**
     * Reset all scenarios to the start state
     */
    resetScenarios(): Promise<StubMapping[]> {
        return this.performRequest({
            method: 'POST',
            path: '/__admin/scenarios/reset'
        });
    }

    /**
     * Configures {@link StubMapping mapping} to the Wiremock server stub
     *
     * Note: <i> The added mappings should be saved in order to persist them even after  resetting the stub </i>
     *
     * @param stubMapping the mapping to add
     * @param bodyFilesDir the base dir to look for the files referred in {@link ResponseDefinition.bodyFileName}
     *
     * @see StubMappingBuilder
     * @see ResponseDefinitionBuilder.withReferredFileBody()
     */
    addMapping(stubMapping: StubMapping, bodyFilesDir = "") {
        if (this.doesMappingContainFileNameBody(stubMapping)) {
            const bodyFileName = stubMapping.response.bodyFileName;
            return this.addFile(bodyFilesDir, bodyFileName)
                .then(file => {
                    return this.addMappingToStub(stubMapping);
                });
        } else {
            return this.addMappingToStub(stubMapping);
        }
    }

    /**
     * Add a mapping to the stub.
     * @param mapping  The mapping in the StubMapping type
     */
    private addMappingToStub(mapping: StubMapping): Promise<StubMapping> {
        return this.performRequest({
            method: 'POST',
            path: '/__admin/mappings'
        }, JSON.stringify(mapping));
    }

    /**
     * Add all json files as mappings in provided directory
     *
     * @param dir the path to dir take the json mappings from
     * @param bodyFilesDir the base dir to look for the files referred in {@link ResponseDefinition.bodyFileName}
     *
     * @see StubMappingBuilder
     * @see RequestPattern
     * @see ResponseDefinition
     * @see ResponseDefinitionBuilder.withReferredFileBody()
     */
    addMappingsFromDir(dir: string, bodyFilesDir = "") {
        const promises: Promise<StubMapping>[] = [];
        fs.readdirSync(dir).forEach((file, index) => {
            if (file.endsWith('.json')) {
                try {
                    const mapping = JSON.parse(fs.readFileSync(dir + "/" + file, 'utf8'));
                    promises.push(this.addMapping(mapping, bodyFilesDir));
                } catch (e) {
                    console.warn('Unable to mapping %s, %s', file, e);
                }
            }
        });

        return Promise.all(promises);
    }

    /**
     * Obtain all mappings from the stub
     */
    getMappings(): Promise<ListStubMappingResults> {
        return this.performRequest({
            method: 'GET',
            path: '/__admin/mappings'
        });
    }

    /**
     * Get a specific mapping based on the id. The id is returned in the response of addMapping()
     * @param id  The id in string format
     */
    getMapping(id: string): Promise<StubMapping> {
        return this.performRequest({
            method: 'GET',
            path: `/__admin/mappings/${id}`
        });
    }

    /**
     * Get all mappings that match the metadata parameter
     */
    findByMetadata(metadata: any): Promise<ListStubMappingResults> {
        return this.performRequest({
            method: 'POST',
            path: '/__admin/mappings/find-by-metadata'
        }, JSON.stringify(metadata));
    }

    /**
     * Updates a specific mapping found by id
     * @param id
     * @param updatedStubMapping
     */
    updateMapping(id: string, updatedStubMapping: StubMapping) {
        return this.performRequest({
            method: 'PUT',
            path: `/__admin/mappings/${id}`
        }, JSON.stringify(updatedStubMapping));
    }

    /**
     * Updates the mapping that matches the metadata given as parameter. note that the metadata must be set again in the
     * updated version of the stub in order to find it again. If multiple mappings match the metadata query, the first
     * will be used and a warning will be put out.
     * @param metadata            The metadata given to find the specific mapping(s)
     * @param updatedStubMapping  The new value of the mapping. Only the id will not be changed.
     */
    updateMappingByMetadata(metadata: any, updatedStubMapping: StubMapping): Promise<void> {
        return this.findByMetadata(metadata).then(foundMappings => {
            if (foundMappings.meta.total === 0) {
                console.error('[WiremockHelper] no stub mappngs found to update based on metadata:\n' + metadata);
                throw Error('[WiremockHelper] no stub mappngs found to update based on metadata:\n' + metadata);
            } else if (foundMappings.meta.total > 1) {
                console.warn('[WiremockHelper] more that 1 mappings found based on metadata:\n' + metadata + '\nUsing the first mapping to update');
            }
            return this.updateMapping(foundMappings.mappings[0].id, updatedStubMapping);
        });
    }

    /**
     * Delete mapping by its id
     *
     * @param id the id of mapping
     *
     * @see StubMapping.id
     */
    deleteMapping(id:string) {
        return this.getMapping(id)
            .then(mapping => {
                if (this.doesMappingContainFileNameBody(mapping)) {
                    return this.deleteFile(mapping.response.bodyFileName)
                        .then(file => {
                            return this.deleteMappingFromStub(id)
                        });
                } else {
                    return this.deleteMappingFromStub(id)
                }
            });
    }

    /**
     * Deletes all mappings and files configured in the Wiremock server
     */
    deleteAllMappings() {
        return this.deleteAllFiles()
            .then(() => {
                return this.deleteMapping('')
                    .then(() => {
                        return this.resetRequestJournal().then(() => {
                        });
                    });
            });
    }

    /**
     * Deletes all requests from request journal
     */
    protected resetRequestJournal(): Promise<void> {
        return this.performRequest({
            method: 'DELETE',
            path: '/__admin/requests'
        });
    }

    /**
     * Delete a mapping based on the id
     * @param id  The id in string format
     */
    private deleteMappingFromStub(id: string): Promise<void> {
        return this.performRequest({
            method: 'DELETE',
            path: `/__admin/mappings/${id}`
        });
    }

    /**
     * Remove the mappings matching the metadata given.
     * @param metadata  The metadata query to find the mappings
     */
    removeByMetadata(metadata: any) {
        return this.performRequest({
            method: 'POST',
            path: '/__admin/mappings/remove-by-metadata'
        }, JSON.stringify(metadata));
    }

    protected addFile(dir: string, file: string) {
        let fileContent;
        try {
            fileContent = fs.readFileSync(file, {encoding: 'utf8'})
        } catch (e) {
            fileContent = fs.readFileSync(path.join(dir, file), {encoding: 'utf8'})
        }

        return this.performRequest({
                method: 'PUT',
                path: '/__admin/files/' + file
            },
            fileContent
        );
    }

    protected getFiles(): Promise<string[]> {
        return this.performRequest({
            method: 'GET',
            path: '/__admin/files'
        });
    }

    protected deleteFile(file: string) {
        return this.performRequest({
            method: 'DELETE',
            path: '/__admin/files/' + file
        });
    }

    protected deleteAllFiles() {
        return new Promise((resolve, reject) => {
            this.getFiles()
                .then(files => {
                    try {
                        const promises = files.map(file => {
                            const fileName = path.basename(file);
                            return this.deleteFile(fileName)
                                .catch(e => {
                                    console.log(e);
                                });
                        });
                        Promise.all(promises).then(resolve);
                    } catch (e) {
                        reject(e)
                    }
                });
        });
    }

    private doesMappingContainFileNameBody(stubMapping: StubMapping) {
        return stubMapping.response !== undefined && stubMapping.response.bodyFileName !== undefined
    }

    protected performRequest(specificOptions: RequestOptions, body: string = null): Promise<any> {
        return new Promise((resolve, reject) => {
            let responseBody = '';
            const allOptions = {
                ...this.defaultOptions,
                ...specificOptions
            };
            const req = request(allOptions, res => {
                // A chunk of data has been recieved.
                res.on('data', chunk => {
                    responseBody += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode < 200 || res.statusCode > 299) {
                        reject(`[WiremockHelper] Wiremock didn't return 2xx code\nStatus: ${res.statusCode} - ${res.statusMessage}`);
                    } else {
                        try {
                            resolve(JSON.parse(responseBody));
                        } catch (e) {
                            resolve(responseBody);
                        }
                    }
                });
            });

            req.on('error', err => {
                reject('[WiremockHelper] HTTP call to Wiremock failed!\n' + err);
            });

            if ((allOptions.method === 'POST' || allOptions.method === 'PUT' || allOptions.method === 'PATCH') && body != null) {
                req.write(body);
            }
            req.end();
        });
    }
}
