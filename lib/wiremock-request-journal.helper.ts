import {RequestPattern} from './wiremock-domain';
import {WiremockHelper} from './wiremock.helper';

/**
 * Helper for interacting with the request journal of Wiremock (if enabled)
 */
export class WiremockRequestJournalHelper extends WiremockHelper {

    private readonly browserName: string;

    constructor(baseUrl?: string, browserName:string = "") {
        super(baseUrl);
        this.browserName = browserName.charAt(0).toUpperCase() + browserName.toLowerCase().slice(1);
    }

    private addBrowserHeader(query: RequestPattern): RequestPattern {
        if (this.browserName !== "") {
            query.headers['User-Agent'] = {
                contains: this.browserName
            };
        }
        return query;
    }

    /**
     * Get all the received requests
     */
    getRequestJournal(): Promise<any> {
        return this.performRequest({
            method: 'GET',
            path: '/__admin/requests'
        });
    }

    /**
     * Remove all the received requests (log) from Wiremock
     */
    resetRequestJournal() {
        return super.resetRequestJournal();
    }

    /**
     * Retrieves the count the provided {@link RequestPattern requestPattern} was called since the mapping was
     * configured to Wiremock server or request journal has been reset
     *
     * @param requestPattern the match pattern to be verified
     *
     * @see RequestPatternBuilder
     * @see resetRequestJournal
     */
    getRequestCount(query: RequestPattern): Promise<number> {
        return super.performRequest({
            method: 'POST',
            path: '/__admin/requests/count'
        }, JSON.stringify(this.addBrowserHeader(query)))
            .catch(e => {
                console.warn("Verification fallback to 0. %s", e);
                return {count: 0};
            })
            .then(result => {
                return result.count;
            });
    }

    /**
     * Obtains the requests matching the query parameters values
     * @param query   The RequestPattern object defining the matching rules for the requests
     * @returns the response from the stub: containing an array with the requests
     */
    findRequests(query: RequestPattern): Promise<any> {
        return this.performRequest({
            method: 'POST',
            path: '/__admin/requests/find'
        }, JSON.stringify(this.addBrowserHeader(query)));
    }

}
