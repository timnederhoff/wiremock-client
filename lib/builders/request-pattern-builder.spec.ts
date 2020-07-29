
import {
    forGetRequestMatchingUrl,
    forDeleteRequestMatchingUrl,
    forPostRequestMatchingUrl,
    forRequestMatchingUrl,
    requestFor,
    RequestMethod,
    equalToIgnoreCases,
    contains,
    matches,
    doesNotMatch,
    absent,
    notAbsent,
    bodyEqualToJson,
    bodyEqualToJsonString,
    bodyMatchesJsonPath,
    bodyMatchesJsonPathExpression,
    bodyEqualToXmlString,
    urlEqualTo,
    urlMatchingTo,
    urlPathEqualTo
} from './request-pattern-builder'



const chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

describe('RequestPatternBuilder', () => {

    it('should map forGetRequestMatchingUrl properly', () => {
        const expected = {
                url: '/sample/path',
                method: 'GET'
        };
        const actual = forGetRequestMatchingUrl("/sample/path").build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forDeleteRequestMatchingUrl properly', () => {
        const expected = {
            url: '/sample/path',
            method: 'DELETE'
        };
        const actual = forDeleteRequestMatchingUrl("/sample/path").build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forPostRequestMatchingUrl properly', () => {
        const expected = {
            url: '/sample/path',
            method: 'POST'
        };
        const actual = forPostRequestMatchingUrl("/sample/path").build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forRequestMatchingUrl properly', () => {
        const expected = {
            url: '/sample/path',
            method: 'ANY'
        };
        const actual = forRequestMatchingUrl("/sample/path").build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map forRequestMatchingUrl properly', () => {
        const expected = {
            url: '/sample/path',
            method: 'ANY'
        };
        const actual = forRequestMatchingUrl("/sample/path").build();
        expect(actual).to.shallowDeepEqual(expected);
    });


    it('should map requestFor with urlPathEqualTo properly', () => {
        const expected = {
            urlPath: '/sample/path',
            method: 'TRACE'
        };
        const actual = requestFor(RequestMethod.TRACE, urlPathEqualTo("/sample/path")).build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map requestFor with urlMatchingTo properly', () => {
        const expected = {
            urlPattern: '/your/([a-z]*)\\\\?and=query',
            method: 'TRACE'
        };
        const actual = requestFor(RequestMethod.TRACE, urlMatchingTo('/your/([a-z]*)\\\\?and=query')).build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map requestFor with urlPathEqualTo properly', () => {
        const expected = {
            url: '/sample/path',
            method: 'TRACE'
        };
        const actual = requestFor(RequestMethod.TRACE, urlEqualTo("/sample/path")).build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map custom request properly', () => {
        const expected = {
            "cookies": {
                "absent-cookie": {
                    "absent": true
                },
                "contains-cookie": {
                    "contains": "something"
                },
                "doesNotMatch-cookie": {
                    "doesNotMatch": "something"
                },
                "equalToIgnoreCases-cookie": {
                    "equalTo": "sOmEtHiNg",
                    "false": "caseInsensitive"
                },
                "matches-cookie": {
                    "matches": "[a-z]*_something"
                },
                "notAbsent-cookie": {
                    "absent": false
                }
            },
            "headers": {
                "absent-header": {
                    "absent": true
                },
                "contains-header": {
                    "contains": "something"
                },
                "doesNotMatch-header": {
                    "doesNotMatch": "something"
                },
                "equalToIgnoreCases-header": {
                    "equalTo": "sOmEtHiNg",
                    "false": "caseInsensitive"
                },
                "matches-header": {
                    "matches": "[a-z]*_something"
                },
                "notAbsent-header": {
                    "absent": false
                }
            },
            "method": "ANY",
            "queryParameters": {
                "absent-param": {
                    "absent": true
                },
                "contains-param": {
                    "contains": "something"
                },
                "doesNotMatch-param": {
                    "doesNotMatch": "something"
                },
                "equalToIgnoreCases-param": {
                    "equalTo": "sOmEtHiNg",
                    "false": "caseInsensitive"
                },
                "matches-param": {
                    "matches": "[a-z]*_something"
                },
                "notAbsent-param": {
                    "absent": false
                }
            },
            "url": "/sample/path"
        };
        const actual = requestFor(RequestMethod.ANY, urlEqualTo("/sample/path"))
            .withQueryParam('equalToIgnoreCases-param', equalToIgnoreCases('sOmEtHiNg'))
            .withQueryParam('matches-param', matches('[a-z]*_something'))
            .withQueryParam('contains-param', contains('something'))
            .withQueryParam('doesNotMatch-param', doesNotMatch('something'))
            .withQueryParam('absent-param', absent())
            .withQueryParam('notAbsent-param', notAbsent())


            .withHeader('equalToIgnoreCases-header', equalToIgnoreCases('sOmEtHiNg'))
            .withHeader('matches-header', matches('[a-z]*_something'))
            .withHeader('contains-header', contains('something'))
            .withHeader('doesNotMatch-header', doesNotMatch('something'))
            .withHeader('absent-header', absent())
            .withHeader('notAbsent-header', notAbsent())

            .withCookie('equalToIgnoreCases-cookie', equalToIgnoreCases('sOmEtHiNg'))
            .withCookie('matches-cookie', matches('[a-z]*_something'))
            .withCookie('contains-cookie', contains('something'))
            .withCookie('doesNotMatch-cookie', doesNotMatch('something'))
            .withCookie('absent-cookie', absent())
            .withCookie('notAbsent-cookie', notAbsent())
            .build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map bodyEqualToJson properly', () => {
        const expected = {
            "bodyPatterns": [
                {
                    "equalToJson": {
                        "grating": "helloWorld"
                    },
                    "true": "ignoreArrayOrder"
                }
            ],
            "method": "ANY",
            "url": "/sample/path"
        };

        expect(requestFor(RequestMethod.ANY, urlEqualTo("/sample/path"))
            .withRequestBody(bodyEqualToJson({grating: "helloWorld"}))
            .build()
        ).to.shallowDeepEqual(expected);

        expect(requestFor(RequestMethod.ANY, urlEqualTo("/sample/path"))
            .withRequestBody(bodyEqualToJsonString('{"grating": "helloWorld"}'))
            .build()
        ).to.shallowDeepEqual(expected);
    });

    it('should map bodyMatchesJsonPath properly', () => {
        const expected = {
            "bodyPatterns": [
                {
                    "matchesJsonPath": "$.name"
                }
            ],
            "method": "ANY",
            "url": "/sample/path"
        };
        const actual = requestFor(RequestMethod.ANY, urlEqualTo("/sample/path"))
            .withRequestBody(bodyMatchesJsonPath("$.name"))
            .build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map bodyMatchesJsonPathExpression properly', () => {
        const expected = {
            "bodyPatterns": [
                {
                    "matchesJsonPath": {
                        "contains": "someValue",
                        "expression": "$.name"
                    }
                }
            ],
            "method": "ANY",
            "url": "/sample/path"
        };
        const actual = requestFor(RequestMethod.ANY, urlEqualTo("/sample/path"))
            .withRequestBody(bodyMatchesJsonPathExpression("$.name", contains("someValue")))
            .build();
        expect(actual).to.shallowDeepEqual(expected);
    });

    it('should map bodyEqualToXmlString properly', () => {
        const expected = {
            "bodyPatterns": [
                {
                    "equalToXml": "<xml attribute='dddd'></xml>",
                    "false": "enablePlaceholders"
                }
            ],
            "method": "ANY",
            "url": "/sample/path"
        };

        const actual = requestFor(RequestMethod.ANY, urlEqualTo("/sample/path"))
            .withRequestBody(bodyEqualToXmlString("<xml attribute='dddd'></xml>"))
            .build();
        expect(actual).to.shallowDeepEqual(expected);
    });

});
