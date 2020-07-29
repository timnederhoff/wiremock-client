import * as fs from 'fs';
import { request, RequestOptions } from 'http';
import * as path from 'path';
import { parse } from 'url';

/**
 * Helper to interact with Wiremock. Specifications of actions can be found at http://wiremock.org/docs/api/
 */
export class WiremockHelper {

  private readonly defaultOptions: RequestOptions;

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
   * Add a mapping to the stub. Note that the added mappings should be saved in order to persist them even after
   * resetting the stub
   * @param mapping   The mapping in the StubMapping type
   */
  addMapping(mapping: StubMapping): Promise<StubMapping> {
    return this.performRequest({
      method: 'POST',
      path: '/__admin/mappings'
    }, JSON.stringify(mapping));
  }

  /**
   * Method loops over a given dir and picks the *.json files to add them to the stub
   * @param dir   The directory of the mappings,
   */
  addMappingsFromDir(dir: string): void {
    fs.readdir(dir, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach((file, index) => {
        if (file.endsWith('.json')) {
          try {
            this.addMapping(require(path.join(dir, file))).then(() => {
            });
          } catch (e) {
            console.warn('Unable to add file to mappings, %s', e);
          }
        }
      });
    });
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
   * Delete a mapping based on the id
   * @param id  The id in string format
   */
  deleteMapping(id: string): Promise<void> {
    return this.performRequest({
      method: 'DELETE',
      path: `/__admin/mappings/${id}`
    });
  }

  /**
   * Delete all mappings from the stub
   */
  deleteAllMappings(): Promise<void> {
    return this.deleteMapping('');
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
            } catch(e) {
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

export class Scenario {
  id: string;
  name: string;
  state: string;
  possibleStates: string[];
}

export class ScenarioList {
  scenarios: Scenario[];
}

export class ListStubMappingResults {
  mappings: StubMapping[];
  meta: {
    total: number;
  }
}

export class StubMapping {
  id?: string;
  uuid?: string;
  priority?: number;
  persistent?: boolean;
  scenarioName?: string;
  requiredScenarioState?: string;
  newScenarioState?: string;
  postServeActions?: any;
  metadata?: any;
  request: RequestPattern;
  response: ResponseDefinition;
}

export class ResponseDefinition {
  status: number;
  statusMessage?: string;
  body?: string;
  headers?: any;
  jsonBody?: any;
  bodyFileName?: string;
  base64Body?: string;
  additionalProxyRequestHeaders?: any;
  fixedDelayMilliseconds?: number;
  delayDistribution?: DelayDistribution;
  fault?: Fault;
  proxyBaseUrl?: string;
  transformers?: string[];
  transformerParameters?: any;
  fromConfiguredStub?: any;
}

export enum Fault {
  CONNECTION_RESET_BY_PEER,
  EMPTY_RESPONSE,
  MALFORMED_RESPONSE_CHUNK,
  RANDOM_DATA_THEN_CLOSE
}

export class RequestPattern {
  url?: string;
  urlPattern?: string;
  urlPath?: string;
  urlPathPattern?: string;
  method?: string;
  headers?: any;
  queryParameters?: any;
  cookies?: any;
  bodyPatterns?: any[];
  basicAuthCredentials?: {
    username: string,
    password: string
  };
}

export class DelayDistribution {
  type: string;
  median: number;
  sigma: number;
  upper: number;
  lower: number;
}
