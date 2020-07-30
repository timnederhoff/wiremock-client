import { expect } from 'chai';
import { WiremockHelper } from './wiremock.helper';
import { stubForOkResponseWithReferredBody, stubForOkResponseWithBody } from './builders/stub-mapping-builder'
import { forGetRequestMatchingUrl } from './builders/request-pattern-builder'

const subject = new WiremockHelper();
const nock = require('nock');
const LOCALHOST_URL = 'http://localhost:8080'
const allMappings = {
  mappings:
    [
      {
        request: {
          url: '/api/sample'
        },
        response: {
          status: 200,
          body: 'sample body'
        }
      }
    ],
  meta: {
    total:
      1
  }
};
const allScenarios = {
  scenarios: [
    {
      name: 'CertainSituation',
      requiredScenarioState: 'Started',
      request: {
        method: 'GET',
        url: '/api/pathname'
      },
      response: {
        status: 200
      }
    }
  ]
};

describe('WiremockClient', () => {

    it('should add mapping with file reference', () => {
        const filesScope = nock(LOCALHOST_URL)
            .put('/__admin/files/README.md')
            .reply(200);
        const mappingsScope = nock(LOCALHOST_URL)
            .post('/__admin/mappings')
            .reply(200);

        const mapping = stubForOkResponseWithReferredBody(forGetRequestMatchingUrl("/sample/path"), "README.md");
        return subject.addMapping(mapping).then(() => {
            expect(filesScope.isDone()).to.be.true;
            expect(mappingsScope.isDone()).to.be.true;
        });
    });

    it('should delete all mapings with reset journal', () => {

        const files = [ "/home/wiremock/./__files/README.md" ];
        nock(LOCALHOST_URL)
            .get('/__admin/files')
            .reply(200, JSON.stringify(files));

        const deleteFilesScope = nock(LOCALHOST_URL)
            .delete('/__admin/files/README.md')
            .reply(200);
        const mappings = [
            stubForOkResponseWithBody(forGetRequestMatchingUrl("/sample/path"), '{"greeting": "Hello world."}')
        ];
        nock(LOCALHOST_URL)
            .get('/__admin/mappings/')
            .reply(200, JSON.stringify(mappings));

        const deleteMappings = nock(LOCALHOST_URL)
            .delete('/__admin/mappings/')
            .reply(200);

        const deleteJournal = nock(LOCALHOST_URL)
            .delete('/__admin/requests')
            .reply(200);

        return subject.deleteAllMappings().then(() => {
            expect(deleteFilesScope.isDone()).to.be.true;
            expect(deleteMappings.isDone()).to.be.true;
            expect(deleteJournal.isDone()).to.be.true;
        });
    });



  it('should get all mappings', () => {
    nock(LOCALHOST_URL)
      .get('/__admin/mappings')
      .reply(200, JSON.stringify(allMappings));
    return subject.getMappings().then(mappings => {
      expect(mappings.mappings.length).to.equal(1);
    });
  });

  it('should show all scenarios', () => {
    nock(LOCALHOST_URL)
      .get('/__admin/scenarios')
      .reply(200, JSON.stringify(allScenarios));
    return subject.getScenarios().then(scenarios => {
      expect(scenarios.scenarios.length).to.equal(1);
      expect(scenarios.scenarios[0].name).equals(allScenarios.scenarios[0].name);
    })
  });

  it('should handle Wiremock unhandled field error correctly', () => {
    const unhandledFieldError = JSON.stringify({
      errors: [
        {
          code: 10,
          source: {
            pointer: '/incorrectpointer'
          },
          title: 'Error parsing JSON',
          detail: 'Unrecognized field \"incorrectpointer\" (class com.github.tomakehurst.wiremock.stubbing.StubMapping), not marked as ignorable'
        }
      ]
    });
    nock(LOCALHOST_URL)
      .get('/__admin/mappings')
      .reply(422, unhandledFieldError);
    try {
      subject.getMappings().then(mappings => {
        console.log('mapping:', mappings);
      });
    } catch(e) {
      expect(e).contains('Unrecognized');
    }

  })
});
