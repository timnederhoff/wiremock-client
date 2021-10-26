import {Fault, ResponseDefinition} from "../wiremock-domain";

/**
 * The helper class for building the Wiremock response definitions.
 *
 * @see ResponseDefinition
 */
export class ResponseDefinitionBuilder {

    private responseDefinition: ResponseDefinition;

    private headers = new Map<string, string>();
    private additionalProxyRequestHeaders = new Map<string, string>();

    constructor(status: number, statusMessage?: string) {
        this.responseDefinition = new ResponseDefinition();
        this.responseDefinition.status = status
        this.responseDefinition.statusMessage = statusMessage;

    }

    withBody(body: string) {
        this.clearBody();
        if (ResponseDefinitionBuilder.isJson(body)) {
            this.responseDefinition.jsonBody = JSON.parse(body);
        } else {
            this.responseDefinition.body = body;
        }
        return this;
    }

    withJsonBody(body: any) {
        this.clearBody();
        this.responseDefinition.jsonBody = body;
        return this;
    }

    withTextBody(body: string) {
        this.clearBody();
        this.responseDefinition.body = body;
        return this;
    }

    /**
     * The transformers to be set
     *
     * @param transformer
     */
    withTransformers(transformer: string[]) {
        this.responseDefinition.transformers = transformer;
        return this;
    }

    /**
     * Configure the response template transformer
     * The wiremock has to be executed with <code>-local-response-templating</code> option to activate the transformer
     *
     * @see http://wiremock.org/docs/response-templating/
     */
    withResponseTemplateTransformer() {
        this.responseDefinition.transformers = ["response-template"];
        return this;
    }

    withReferredBody(referredBodyFile: string) {
        this.clearBody();
        this.responseDefinition.bodyFileName = referredBodyFile;
        return this;
    }

    withBase64Body(base64Body: string) {
        this.clearBody();
        this.responseDefinition.base64Body = base64Body;
        return this;
    }

    withHeader(key: string, value: string) {
        this.headers.set(key, value);
        return this;
    }

    withDelay(fixedDelayMilliseconds: number) {
        this.responseDefinition.fixedDelayMilliseconds = fixedDelayMilliseconds;
        return this;
    }

    withProxy(proxyBaseUrl: string) {
        this.responseDefinition.proxyBaseUrl = proxyBaseUrl;
        return this;
    }

    withProxyHeader(key: string, value: string | null) {
        this.additionalProxyRequestHeaders.set(key, value);
        return this;
    }


    withFault(fault: Fault) {
        this.responseDefinition.fault = fault;
        return this;
    }

    private clearBody() {
        this.responseDefinition.jsonBody = undefined;
        this.responseDefinition.body = undefined;
        this.responseDefinition.bodyFileName = undefined;
        this.responseDefinition.base64Body = undefined;
    }

    private static isJson(str: string): boolean {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    build() {
        if (this.headers.size > 0) {
            this.responseDefinition.headers = ResponseDefinitionBuilder.mapToObj(this.headers);
        }
        if (this.additionalProxyRequestHeaders.size > 0) {
            this.responseDefinition.additionalProxyRequestHeaders = ResponseDefinitionBuilder.mapToObj(this.additionalProxyRequestHeaders);
        }
        return this.responseDefinition;
    }

    private static mapToObj(map: Map<string, string>) {
        const obj: any = {}
        for (let [k, v] of map)
            obj[k] = v
        return obj
    }
}

/**
 * Creates the response builder for <b>ok</b> response
 *
 * @param body the optional body content
 */
export function forOkResponse(body?: string): ResponseDefinitionBuilder {
    return responseFor(200, "Ok", body);
}

/**
 * Creates the response builder for <b>404 Not Found</b> response with no body
 */
export function forNotFoundResponse(): ResponseDefinitionBuilder {
    return responseFor(404, "Not Found");
}

/**
 * Creates the response builder for <b>500 Server Error</b> response
 *
 * @param body the optional body content
 */
export function forErrorResponse(body?: string): ResponseDefinitionBuilder {
    return responseFor(500, "Internal Server Error", body);
}

/**
 * Creates the response builder for provided parameters
 *
 * @param status the HTTP status code
 * @param statusMessage the HTTP status message
 * @param body the optional body content
 */
export function responseFor(status: number, statusMessage: string, body?: string): ResponseDefinitionBuilder {
    return new ResponseDefinitionBuilder(status, statusMessage)
        .withBody(body);
}

/**
 * Creates the response definition for connection fault
 */
export function forConnectionResetByPeerFault() {
    return forServerFault(Fault.CONNECTION_RESET_BY_PEER);
}
/**
 * Creates the response definition for connection fault
 */
export function forEmptyResponseFault() {
    return forServerFault(Fault.EMPTY_RESPONSE);
}

/**
 * Creates the response definition for connection fault
 */
export function forMalformedResponseChunkFault() {
    return forServerFault(Fault.MALFORMED_RESPONSE_CHUNK);
}

/**
 * Creates the response definition for connection fault
 */
export function forGenerateRandomDateAndCloseFault() {
    return forServerFault(Fault.RANDOM_DATA_THEN_CLOSE);
}

function forServerFault(fault: Fault) {
    return new ResponseDefinitionBuilder(undefined, undefined)
        .withFault(fault)
        .build();
}
