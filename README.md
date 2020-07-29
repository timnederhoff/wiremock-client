# wiremock client
This library can be used if a Wiremock instance is running, to interact like the actions given in the api http://wiremock.org/docs/api/

# Usage
```typescript
import { WiremockHelper, stubForOkResponseWithBody, forGetRequestMatchingUrl} from 'wiremock-client';

const wiremockClient = new WiremockHelper();
/*
Sample mapping to be configured in wiremock server
{
    request: {
        url: '/sample/path',
        method: 'GET'
    },
    response: {
        status: 200,
        jsonBody: {
            "greeting": "Hello world."
        }
    }
}
 */
const sampleMapping = stubForOkResponseWithBody(
    forGetRequestMatchingUrl("/sample/path"), 
    '{"greeting": "Hello world."}'
    )       

wiremockClient.addMapping(sampleMapping);

```
