import {
    stubForOkResponseWithBody,
    stubForOkResponseWithReferredBody,
    stubForNotFoundResponse
} from './stub-mapping-builder'
import {forRequestMatchingUrl} from "./request-pattern-builder";

const chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

describe('StubMappingBuilder', () => {

    it('should map stubForOkResponseWithBody properly', () => {
        const expected = {
            "request": {
                "method": "ANY",
                "url": "some/path"
            },
            "response": {
                "body": "My body",
                "status": 200,
                "statusMessage": "Ok"
            }
        };
        const actual = stubForOkResponseWithBody(
            forRequestMatchingUrl("some/path"),
            "My body"
        );
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map stubForOkResponseWithReferredBody properly', () => {
        const expected = {
            "request": {
                "method": "ANY",
                "url": "some/path"
            },
            "response": {
                "bodyFileName": "path/to/file.txt",
                "status": 200,
                "statusMessage": "Ok"
            }
        };
        const actual = stubForOkResponseWithReferredBody(
            forRequestMatchingUrl("some/path"),
            "path/to/file.txt"
            );
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map stubForNotFoundResponse properly', () => {
        const expected = {
            "request": {
                "method": "ANY",
                "url": "some/not/existing"
            },
            "response": {
                "status": 404,
                "statusMessage": "Not Found"
            }
        };
        const actual = stubForNotFoundResponse(
            forRequestMatchingUrl("some/not/existing")
        );
        expect(actual).to.shallowDeepEqual(expected);
    });

});
