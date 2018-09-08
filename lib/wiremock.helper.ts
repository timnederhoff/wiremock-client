import * as fs from 'fs';
import { request, RequestOptions } from 'http';
import * as path from 'path';
import { parse } from 'url';

export class WiremockHelper {

  private readonly defaultOptions: RequestOptions;

  constructor(baseUrl: string = 'http://localhost') {
    const thisBaseUrl = parse(baseUrl);
    this.defaultOptions = {
      hostname: thisBaseUrl.hostname,
      port: '8080',
      protocol: thisBaseUrl.protocol
    };
  }

  getScenarios(): Promise<ScenarioList> {
    return this.performRequest({
      method: 'GET',
      path: '/__admin/scenarios'
    });
  }

  resetScenarios(): Promise<StubMapping[]> {
    return this.performRequest({
      method: 'POST',
      path: '/__admin/scenarios/reset'
    });
  }

  addMapping(mapping: StubMapping): Promise<StubMapping> {
    return this.performRequest({
      method: 'POST',
      path: '/__admin/mappings'
    }, JSON.stringify(mapping));
  }

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

  getMappings(): Promise<ListStubMappingResults> {
    return this.performRequest({
      method: 'GET',
      path: '/__admin/mappings'
    });
  }

  getMapping(id: string): Promise<StubMapping> {
    return this.performRequest({
      method: 'GET',
      path: `/__admin/mappings/${id}`
    });
  }

  deleteMapping(id: string): Promise<void> {
    return this.performRequest({
      method: 'DELETE',
      path: `/__admin/mappings/${id}`
    });
  }

  deleteAllMappings(): Promise<void> {
    return this.deleteMapping('');
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
            } finally {
              resolve(responseBody);
            }
          }
        });
      });

      req.on('error', err => {
        reject('[WiremockHelper] HTTP call to Wiremock failed!\n' + err);
      });

      if (allOptions.method === 'POST' && body != null) {
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
