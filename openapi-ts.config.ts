import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:9999/doc',
  output: 'frontend/src/sdk/generated',
  client: '@hey-api/client-axios',
});
