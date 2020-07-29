import {RequestPattern} from "../wiremock-domain";

/**
 * The helper class which helps to build {@link RequestPattern request pattern matchers} which match the particular
 * requests to Wiremock server
 *
 * @see RequestPattern
 */
export class RequestPatternBuilder {

    private urlPattern: UrlMatchExpression;
    private requestMethod: RequestMethod;
    private queryParameters: Map<string, MatchExpression>;
    private headers: Map<string, MatchExpression>;
    private cookies: Map<string, MatchExpression>;
    private bodyPatterns: MatchExpression[];

    constructor(requestMethod: RequestMethod, urlMatchExpression: UrlMatchExpression) {
        this.requestMethod = requestMethod
        this.urlPattern = urlMatchExpression;
        this.queryParameters = new Map();
        this.headers = new Map();
        this.cookies = new Map();
        this.bodyPatterns = [];
    }

    public withHeader(name: string, matchExpression: MatchExpression) {
        this.headers.set(name, matchExpression);
        return this;
    }

    public withCookie(name: string, matchExpression: MatchExpression) {
        this.cookies.set(name, matchExpression);
        return this;
    }

    public withQueryParam(name: string, matchExpression: MatchExpression) {
        this.queryParameters.set(name, matchExpression);
        return this;
    }

    public withRequestBody(matchExpression: MatchExpression) {
        this.bodyPatterns.push(matchExpression);
        return this;
    }


    build() {
        const jsonData = new RequestPattern();
        jsonData.method = this.requestMethod;
        jsonData[this.urlPattern.urlMatchCondition] = this.urlPattern.url;

        jsonData.queryParameters = RequestPatternBuilder.mapConditions(this.queryParameters);
        jsonData.cookies = RequestPatternBuilder.mapConditions(this.cookies);
        jsonData.headers = RequestPatternBuilder.mapConditions(this.headers);

        if (this.bodyPatterns.length > 0) {
            const expressions:any = [];
            this.bodyPatterns.forEach((bodyExpression: MatchExpression) => {
                let expression:any = {};
                expression[bodyExpression.condition] = bodyExpression.value;
                bodyExpression.properties.forEach((key: string, value: Object) => {
                    expression[key] = value;
                });
                expressions.push(expression);

            });
            jsonData.bodyPatterns = expressions;
        }

        return jsonData;
    }

    private static mapConditions(values: Map<string, MatchExpression>) {
        if (values.size > 0) {
            const expressions:any = {};
            values.forEach((expression: MatchExpression, name: string) => {
                let expressionField:any = {};
                expressionField[expression.condition] = expression.value;
                expression.properties.forEach((key: string, value: Object) => {
                    expressionField[key] = value;
                });
                expressions[name] = expressionField

            });
            return  expressions;
        }
    }
}

/**
 * Creates the request pattern builder for any http request equals to provided url
 * @param url
 */
export function forRequestMatchingUrl(url: string): RequestPatternBuilder {
    return requestFor(RequestMethod.ANY, urlEqualTo(url));
}

/**
 * Creates the request pattern builder for http <b>GET</b> request equals to provided url
 * @param url
 */
export function forGetRequestMatchingUrl(url: string) {
    return requestFor(RequestMethod.GET, urlEqualTo(url));
}

/**
 * Creates the request pattern builder for http <b>POST</b> request equals to provided url
 * @param url
 */
export function forPostRequestMatchingUrl(url: string) {
    return requestFor(RequestMethod.POST, urlEqualTo(url));
}

/**
 * Creates the request pattern builder for http <b>DELETE</b> request equals to provided url
 * @param url
 */
export function forDeleteRequestMatchingUrl(url: string) {
    return requestFor(RequestMethod.DELETE, urlEqualTo(url));
}

/**
 * Creates the request pattern builder for provided {@RequestMethod} equals to provided {@link UrlMatchExpression}
 *
 * @param requestMethod
 * @param urlMatchExpression
 */
export function requestFor(requestMethod: RequestMethod, urlMatchExpression: UrlMatchExpression) {
    return new RequestPatternBuilder(requestMethod, urlMatchExpression);
}

/**
 * Creates the url match expression which equal exactly to provided url
 * @param url
 */
export function urlEqualTo(url: string) {
    return new UrlMatchExpression(url, URLMatchCondition.urlEqualTo);
}

/**
 * Creates the url match expression which match to provided regexp
 * @param regexp
 */
export function urlMatchingTo(regexp: string) {
    return new UrlMatchExpression(regexp, URLMatchCondition.urlMatching);
}

/**
 * Creates the url match expression which is equals to provided path
 * @param path
 */
export function urlPathEqualTo(path: string) {
    return new UrlMatchExpression(path, URLMatchCondition.urlPathEqualTo);
}

/**
 * Creates the url match expression which match to provided path
 * @param regexp
 */
export function urlPathMatchingTo(regexp: string) {
    return new UrlMatchExpression(regexp, URLMatchCondition.urlPathMatching);
}

export function equalTo(expected: string, caseSensitive = true) {
    let properties = new Map<string, Object>();
    properties.set("caseInsensitive", caseSensitive);
    return new MatchExpression(MatchCondition.equalTo, expected, properties);
}

export function equalToIgnoreCases(expected: string) {
    return equalTo(expected, false);
}

export function contains(expected: string) {
    return new MatchExpression(MatchCondition.contains, expected);
}

export function matches(matches: string) {
    return new MatchExpression(MatchCondition.matches, matches);
}

export function doesNotMatch(notMatches: string) {
    return new MatchExpression(MatchCondition.doesNotMatch, notMatches);
}

export function absent() {
    return new MatchExpression(MatchCondition.absent, true,);
}

export function notAbsent() {
    return new MatchExpression(MatchCondition.absent, false);
}

export function bodyEqualToJsonString(jsonString: string,
                                      ignoreArrayOrder = true,
                                      ignoreExtraElements = true): MatchExpression {
    return bodyEqualToJson(JSON.parse(jsonString), ignoreArrayOrder, ignoreExtraElements);
}

export function bodyEqualToJson(json: Object,
                                ignoreArrayOrder = true,
                                ignoreExtraElements = true) {
    let properties = new Map<string, Object>();
    properties.set("ignoreExtraElements", ignoreExtraElements);
    properties.set("ignoreArrayOrder", ignoreArrayOrder);
    return new MatchExpression(MatchCondition.equalToJson, json, properties);
}

export function bodyMatchesJsonPath(jsonPath: string,
                                    ignoreArrayOrder = true,
                                    ignoreExtraElements = true) {
    return new MatchExpression(MatchCondition.matchesJsonPath, jsonPath);
}

export function bodyMatchesJsonPathExpression(jsonPath: string, matchExpression: MatchExpression) {
    return prepareMatchExpression(jsonPath, MatchCondition.matchesJsonPath, matchExpression);
}

export function bodyEqualToXmlString(xml: string,
                               enablePlaceholders = false,
                               placeholderOpeningDelimiterRegex: string = null,
                               placeholderClosingDelimiterRegex: string = null,
                               exemptedComparisons: string[] = null) {
    let properties = new Map<string, Object>();
    properties.set("enablePlaceholders", enablePlaceholders);
    if (placeholderOpeningDelimiterRegex !== null) {
        properties.set("placeholderOpeningDelimiterRegex", placeholderOpeningDelimiterRegex);
    }
    if (placeholderClosingDelimiterRegex !== null) {
        properties.set("placeholderClosingDelimiterRegex", placeholderClosingDelimiterRegex);
    }
    if (exemptedComparisons != null) {
        properties.set("exemptedComparisons", exemptedComparisons);
    }
    return new MatchExpression(MatchCondition.equalToXml, xml, properties);
}

export function bodyMatchesXPath(xPath: string,
                                 ignoreArrayOrder = true,
                                 ignoreExtraElements = true) {
    return new MatchExpression(MatchCondition.matchesXPath, xPath);
}

export function bodyMatchesXPathExpression(xPath: string, matchExpression: MatchExpression) {
    return prepareMatchExpression(xPath, MatchCondition.matchesXPath, matchExpression);
}

function prepareMatchExpression(expression: string, matchCondition: MatchCondition, matchExpression: MatchExpression) {
    const value:any = {};
    value["expression"] = expression;
    value[matchExpression.condition + ""] = matchExpression.value;
    matchExpression.properties.forEach((key: string, val: Object) => {
        value[key] = val;
    });
    return new MatchExpression(matchCondition, value);
}

export class UrlMatchExpression {
    url: string;
    urlMatchCondition: URLMatchCondition;

    constructor(url: string, urlMatchCondition: URLMatchCondition) {
        this.url = url
        this.urlMatchCondition = urlMatchCondition
    }
}

enum URLMatchCondition {
    urlEqualTo = "url",
    urlMatching = "urlPattern",
    urlPathEqualTo = "urlPath",
    urlPathMatching = "urlPathPattern"
}

export enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD",
    TRACE = "TRACE",
    ANY = "ANY"
}

enum MatchCondition {
    equalTo = "equalTo",
    contains = "contains",
    matches = "matches",
    absent = "absent",
    doesNotMatch = "doesNotMatch",
    equalToJson = "equalToJson",
    matchesJsonPath = "matchesJsonPath",
    equalToXml = "equalToXml",
    matchesXPath = "matchesXPath"
}

class MatchExpression {

    condition: MatchCondition;
    value: Object;
    properties: Map<string, Object>;

    constructor(condition: MatchCondition, value: Object, properties = new Map<string, Object>()) {
        this.condition = condition;
        this.value = value;
        this.properties = properties;
    }
}

