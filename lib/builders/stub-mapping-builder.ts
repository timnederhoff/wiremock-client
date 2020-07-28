import {forNotFoundResponse, forOkResponse, ResponseDefinitionBuilder} from "./response-definition-builder";
import {RequestPatternBuilder} from "./request-pattern-builder";
import {StubMapping} from "../wiremock-domain";

/**
 * The helper class helps to build the {@link StubMapping} for {@link WiremockClient}
 */
export class StubMappingBuilder {

    private requestBuilder: RequestPatternBuilder;
    private responseBuilder: ResponseDefinitionBuilder;

    constructor(requestBuilder: RequestPatternBuilder, responseBuilder: ResponseDefinitionBuilder) {
        this.requestBuilder = requestBuilder;
        this.responseBuilder = responseBuilder;
    }

    build() {
        const result = new StubMapping();
        result.response = this.responseBuilder.build();
        result.request = this.requestBuilder.build();
        return result;
    }
}

/**
 * Creates the stub mapping for provided request and response
 *
 * @param requestBuilder the builder for requests
 * @param responseBuilder the builder for response
 */
export function stubFor(requestBuilder: RequestPatternBuilder,
                        responseBuilder: ResponseDefinitionBuilder) {
    return new StubMappingBuilder(requestBuilder, responseBuilder).build();
}

/**
 * Creates the stub mapping for provided request with <b>ok</b> response with provided body
 *
 * @param requestBuilder the builder for requests
 * @param body the optional body content
 */
export function stubForOkResponseWithBody(requestBuilder: RequestPatternBuilder, body?: string) {
    return stubFor(requestBuilder, forOkResponse(body));
}

/**
 * Creates the stub mapping for provided request with <b>ok</b> response with provided body as a file reference
 *
 * @param requestBuilder the builder for requests
 * @param referredBodyFile the body content file path
 */
export function stubForOkResponseWithReferredBody(requestBuilder: RequestPatternBuilder,
                                                  referredBodyFile: string) {
    return stubFor(requestBuilder, forOkResponse().withReferredBody(referredBodyFile));
}

/**
 * Creates the stub mapping for provided request with not <b>404 Not found</b> response
 *
 * @param requestBuilder the builder for requests
 */
export function stubForNotFoundResponse(requestBuilder: RequestPatternBuilder) {
    return stubFor(requestBuilder, forNotFoundResponse());
}
