# wiremock client
This library can be used if a Wiremock instance is running, to interact like the actions given in the api http://wiremock.org/docs/api/

# Usage
```typescript
import { WiremockHelper } from 'wiremock-client';

const wiremockClient = new WiremockHelper();

const sampleMapping = {
    request: {
        url: '/sample/path',
        method: 'GET'
    },
    response: {
        status: 200
    }
};

wiremockClient.addMapping(sampleMapping);

```
