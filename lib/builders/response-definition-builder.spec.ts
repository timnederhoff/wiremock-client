
import {
    forOkResponse,
    forNotFoundResponse,
    forErrorResponse,
    forConnectionResetByPeerFault,
    forEmptyResponseFault,
    forGenerateRandomDateAndCloseFault,
    forMalformedResponseChunkFault,
    responseFor
} from './response-definition-builder'



const chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

describe('ResponseDefinitionBuilder', () => {

    it('should map forOkResponse properly', () => {
        const expected = {
            "body": "this is body",
            "status": 200,
            "statusMessage": "Ok"
        };
        const actual = forOkResponse("this is body").build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forNotFoundResponse properly', () => {
        const expected = {
            "status": 404,
            "statusMessage": "Not Found"
        };
        const actual = forNotFoundResponse().build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forErrorResponse properly', () => {
        const expected = {
            "body": "Nasty Server Error",
            "status": 500,
            "statusMessage": "Internal Server Error"
        };
        const actual = forErrorResponse("Nasty Server Error").build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forConnectionResetByPeerFault properly', () => {
        const expected = {
            "fault": 0
        };
        const actual = forConnectionResetByPeerFault();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forEmptyResponseFault properly', () => {
        const expected = {
            "fault": 1
        };
        const actual = forEmptyResponseFault();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forMalformedResponseChunkFault properly', () => {
        const expected = {
            "fault": 2
        };
        const actual = forMalformedResponseChunkFault();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forGenerateRandomDateAndCloseFault properly', () => {
        const expected = {
            "fault": 3
        };
        const actual = forGenerateRandomDateAndCloseFault();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map custom request properly', () => {
        const expected = {
            "additionalProxyRequestHeaders": {
                "someProxyHeader": "someProxyHeader-xxx"
            },
            "bodyFileName": "path/to/file.txt",
            "fixedDelayMilliseconds": 100,
            "headers": {
                "someHeader": "header-xxx"
            },
            "proxyBaseUrl": "http://someProxyUrl.path",
            "status": 500,
            "statusMessage": "Custom status"
        };
        const actual = responseFor(500, "Custom status", "Custom Body")
            .withReferredBody("path/to/file.txt")
            .withHeader("someHeader", "header-xxx")
            .withProxy("http://someProxyUrl.path")
            .withDelay(100)
            .withProxyHeader("someProxyHeader", "someProxyHeader-xxx")
            .build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map custom request with jsonBody properly', () => {
        const expected = {
            "jsonBody": {
                "greeting": "Hello world."
            },
            "status": 200,
            "statusMessage": "OK"
        };
        const actual = responseFor(200, "OK")
            .withBody('{"greeting": "Hello world."}')
            .build();
        expect(actual).to.shallowDeepEqual(expected);
    });


});
