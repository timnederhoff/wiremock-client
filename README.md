# wiremock client

# Usage
```typescript
import {WiremockClient} from 'wiremock-client';

const wiremockClient = new WiremockClient();

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

# TODO's