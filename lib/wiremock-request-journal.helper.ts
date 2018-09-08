import { RequestPattern, WiremockHelper } from './wiremock.helper';

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

  getRequestJournal(): Promise<any> {
    return this.performRequest({
      method: 'GET',
      path: '/__admin/requests'
    });
  }

  resetRequestJournal(): Promise<void> {
    return this.performRequest({
      method: 'DELETE',
      path: '/__admin/requests'
    });
  }

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
