import { URL } from 'url';
import * as http from 'http';

export class WiremockClient {
    private baseUrl: URL;
    private options: any;

    constructor(baseUrl: string = 'http://localhost:8080') {
        this.baseUrl = new URL(baseUrl);
        this.options = {
            hostname: this.baseUrl.hostname,
            port: this.baseUrl.port,
            protocol: this.baseUrl.protocol
        };
    }

    getScenarios(): Promise<any> {
        this.options.method = 'GET';
        this.options.path = '/__admin/scenarios';
        return this.performRequest();
    }

    resetScenarios(): Promise<void> {
        this.options.method = 'POST';
        this.options.path = '/__admin/scenarios/reset';
        return this.performRequest();
    }

    addMapping(mapping: any): Promise<any> {
        this.options.method = 'POST';
        this.options.path = '/__admin/mappings';
        return this.performRequest(JSON.stringify(mapping));
    }

    getMappings(): Promise<any> {
        this.options.method = 'GET';
        this.options.path = '/__admin/mappings';
        return this.performRequest();
    }

    getMapping(id: string): Promise<any> {
        this.options.method = 'GET';
        this.options.path = `/__admin/mappings/${id}`;
        return this.performRequest();
    }

    deleteMapping(id: string): Promise<void> {
        this.options.method = 'DELETE';
        this.options.path = `/__admin/mappings/${id}`;
        return this.performRequest();
    }

    deleteAllMappings(): Promise<void> {
        return this.deleteMapping('');
    }

    getRequestJournal(): Promise<any> {
        this.options.method = 'GET';
        this.options.path = '/__admin/requests';
        return this.performRequest();
    }

    resetRequestJournal(): Promise<void> {
        this.options.method = 'DELETE';
        this.options.path = '/__admin/requests';
        return this.performRequest();
    }

    getRequestCount(query: any): Promise<any> {
        this.options.method = 'POST';
        this.options.path = '/__admin/requests/count';
        return this.performRequest(JSON.stringify(query));
    }

    findRequest(query: any): Promise<any> {
        this.options.method = 'POST';
        this.options.path = '/__admin/requests/find';
        return this.performRequest(JSON.stringify(query));
    }

    private performRequest(body: string = null): Promise<any> {
        return new Promise((resolve, reject) => {
            let responseBody: string = '';
            const req = http.request(this.options, res => {

                // A chunk of data has been recieved.
                res.on('data', chunk => {
                    responseBody += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode < 200 || res.statusCode > 299) {
                        if (res.statusCode === 422) {
                            reject(JSON.parse(responseBody));
                        }
                        reject(`Wiremock didn't return 2xx code\nStatus: ${res.statusCode} - ${res.statusMessage}`);
                    } else {
                        try {
                            responseBody = JSON.parse(responseBody);
                        } finally {
                            resolve(responseBody);
                        }
                    }
                });
            });

            req.on('error', err => {
                reject('HTTP call to Wiremock failed!\n' + err);
            });

            if (this.options.method === 'POST' && body != null) {
                req.write(body);
            }
            req.end();
        })
    }
}