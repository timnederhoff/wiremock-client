import { expect } from 'chai';
import { WiremockHelper } from './wiremock.helper';

const subject = new WiremockHelper();
const nock = require('nock');
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

  it('should get all mappings', () => {
    nock('http://localhost:8080')
      .get('/__admin/mappings')
      .reply(200, JSON.stringify(allMappings));
    return subject.getMappings().then(mappings => {
      expect(mappings.mappings.length).to.equal(1);
    });
  });

  it('should show all scenarios', () => {
    nock('http://localhost:8080')
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
    nock('http://localhost:8080')
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