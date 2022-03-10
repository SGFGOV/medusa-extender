# Integration within your medusa project

To benefit from all the features that the extender offers you, the usage of typescript is recommended.
If you have already an existing project scaffold with the command `medusa new ...` here is how are the following steps to integrate
the extender in your project.

follow the next steps yo be ready to launch :rocket:

```bash
npm i -D typescript
echo '{
  "compilerOptions": {
    "module": "CommonJS",
    "declaration": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "target": "es2017",
    "sourceMap": true,
    "skipLibCheck": true,
    "allowJs": true,
    "outDir": "dist",
    "rootDir": ".",
    "esModuleInterop": true
  },
  "include": ["src", "medusa-config.js"],
  "exclude": ["dist", "node_modules", "**/*.spec.ts"]
}' > tsconfig.json
```

update the scripts in your `package.json`

```json
{
  "scripts": {
    "build": "rm -rf dist && tsc",
    "start": "npm run build && node dist/src/main.js"
  } 
}
```

add a main file in the `src` directory

```typescript
// src/main.ts

import express = require('express');
import { Medusa } from 'medusa-extender';
import { resolve } from 'path';

async function bootstrap() {
    const expressInstance = express();
    
    const rootDir = resolve(__dirname) + '/../';
    await new Medusa(rootDir, expressInstance).load([]);
    
    expressInstance.listen(9000, () => {
        console.info('Server successfully started on port 9000');
    });
}

bootstrap();
```

And finally update the `develop.sh` script with the following

```bash
#!/bin/bash

#Run migrations to ensure the database is updated
medusa migrations run

#Start development environment
npm run start
```