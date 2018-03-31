import { WiremockClient } from './index';
import { expect } from 'chai';

const subject = new WiremockClient();
const nock = require('nock');
const allMappings = [
    {
        request: {
            url: '/api/sample'
        },
        response: {
            status: 200,
            body: 'sample body'
        }
    }
];
const allScenarios = [
    {
        scenarioName: 'CertainSituation',
        requiredScenarioState: 'Started',
        request: {
            method: 'GET',
            url: '/api/pathname'
        },
        response: {
            status: 200
        }
    }
];

describe('WiremockClient', () => {

    before(() => {

    });
    
    it('should get all mappings', () => {
        nock('http://localhost:8080')
            .get('/__admin/mappings')
            .reply(200, JSON.stringify(allMappings));
        return subject.getMappings().then(mappings => {
            expect(mappings.length).to.equal(1);
        });
    });

    it('should show all scenarios', () => {
        nock('http://localhost:8080')
            .get('/__admin/scenarios')
            .reply(200, JSON.stringify(allScenarios));
        return subject.getScenarios().then(scenarios => {
            expect(scenarios.length).to.equal(1);
            expect(scenarios[0].scenarioName).equals(allScenarios[0].scenarioName);
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
        return subject.getMappings().then(mappings => {
            console.log('mapping:', mappings);
        })
    })
});