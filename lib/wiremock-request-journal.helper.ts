import { RequestPattern, WiremockHelper } from './wiremock.helper';

/**
 * Helper for interacting with the request journal of Wiremock (if enabled)
 */
export class WiremockRequestJournalHelper extends WiremockHelper {

  private readonly browserName: string;

  constructor(browserName?: string) {
    super();
    this.browserName = browserName.charAt(0).toUpperCase() + browserName.toLowerCase().slice(1);
  }

  private addBrowserHeader(query: RequestPattern): RequestPattern {
    return {
      ...query,
      headers: {
        'User-Agent': {
          contains: this.browserName
        }
      }
    };
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
  resetRequestJournal(): Promise<void> {
    return this.performRequest({
      method: 'DELETE',
      path: '/__admin/requests'
    });
  }

  /**
   * Get the number of received requests given the specific query parameters
   * @param query   The query as specified in http://wiremock.org/docs/api/
   */
  getRequestCount(query: any): Promise<any> {
    return this.performRequest({
      method: 'POST',
      path: '/__admin/requests/count'
    }, JSON.stringify(query));
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
