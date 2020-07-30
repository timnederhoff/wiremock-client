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
