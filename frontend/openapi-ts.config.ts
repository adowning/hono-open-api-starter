import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    input: 'http://localhost:9999/doc',
    output: {
        lint: 'eslint',
        format: 'prettier',
        path: 'src/sdk/generated',
    },
    plugins: [
        {
            name: '@hey-api/client-axios',
            throwOnError: true,
            runtimeConfigPath: './src/sdk/runtime.client.ts',
        },
        {
            name: '@hey-api/sdk',
        },
    ],
})
