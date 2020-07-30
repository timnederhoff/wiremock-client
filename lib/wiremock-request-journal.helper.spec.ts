import { expect } from 'chai';
import { WiremockRequestJournalHelper } from './wiremock-request-journal.helper';
import { stubForOkResponseWithReferredBody, stubForOkResponseWithBody } from './builders/stub-mapping-builder'
import { forGetRequestMatchingUrl , matches} from './builders/request-pattern-builder'
const nock = require('nock');
const LOCALHOST_URL = 'http://localhost:8080';

describe('WiremockRequestJournalHelper', () => {

    it('should add "User-Agent" mapping to header when request journal is called', () => {
        const subject = new WiremockRequestJournalHelper(LOCALHOST_URL, "myCustomBrowser");
        const journalScope = nock(LOCALHOST_URL)
            .post('/__admin/requests/count',JSON.stringify(
                {
                    method: 'GET',
                    url: '/sample/path',
                    queryParameters: undefined,
                    cookies: undefined,
                    headers: {
                        myCustomHeader: { matches: 'someValue.*' },
                        'User-Agent': { contains: 'Mycustombrowser' }
                    }
                }
            ))
            .reply(200, JSON.stringify({count: 100}));

        const mappingBuilder = forGetRequestMatchingUrl("/sample/path")
            .withHeader("myCustomHeader", matches("someValue.*"));

        return subject.getRequestCount(mappingBuilder.build()).then((count: number) => {
            expect(count).to.be.eql(100);
            expect(journalScope.isDone()).to.be.true;
        });
    });

});
