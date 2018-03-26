import { WiremockClient } from './index';
import { expect } from 'chai';

const subject = new WiremockClient();
const nock = require('nock');

describe('WiremockClient', () => {

    const givenMappings = [
        {
            request: 'this'
        },
        {
            request: 'sdf'
        }
    ];
    
    it('should show mappings', () => {
        nock('http://localhost:8080')
            .get('/__admin/mappings')
            .reply(200, givenMappings);
        return subject.getMappings().then(mappings => {
            expect(mappings).to.equals(givenMappings);
        });
    });
});