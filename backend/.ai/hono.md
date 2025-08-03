========================
CODE SNIPPETS
========================
TITLE: Hono HTTP Method Examples (POST, DELETE)
DESCRIPTION: Illustrates handling POST requests to create resources and DELETE requests with path parameters to remove resources.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_6

LANGUAGE: ts
CODE:

```
app.post('/posts', (c) => c.text('Created!', 201))
app.delete('/posts/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
)
```

---

TITLE: Install Project Dependencies
DESCRIPTION: Installs project dependencies after creating a Hono application, using npm, yarn, pnpm, or bun.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_1

LANGUAGE: sh
CODE:

```
cd my-app
npm i
```

LANGUAGE: sh
CODE:

```
cd my-app
yarn
```

LANGUAGE: sh
CODE:

```
cd my-app
pnpm i
```

LANGUAGE: sh
CODE:

```
cd my-app
bun i
```

---

TITLE: Hono Basic App Setup
DESCRIPTION: Demonstrates the basic setup for a Hono web application. This snippet shows how to create a new Hono app instance and define a simple GET route that responds with 'Hello Hono!'. It's a foundational example for getting started with Hono.

SOURCE: https://github.com/honojs/website/blob/main/index.md#_snippet_0

LANGUAGE: javascript
CODE:

```
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

export default app
```

---

TITLE: Start Local Development Server
DESCRIPTION: Starts a local development server for a Hono application using common package managers.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_2

LANGUAGE: sh
CODE:

```
npm run dev
```

LANGUAGE: sh
CODE:

```
yarn dev
```

LANGUAGE: sh
CODE:

```
pnpm dev
```

LANGUAGE: sh
CODE:

```
bun run dev
```

---

TITLE: Hono JSON Response Example
DESCRIPTION: An example of handling a GET request to '/api/hello' and returning a JSON response with status 'ok' and a message.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_4

LANGUAGE: ts
CODE:

```
app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  })
})
```

---

TITLE: Hono JSX Rendering Example
DESCRIPTION: Shows how to render HTML content using JSX syntax within a Hono application. Requires renaming the file to .tsx and configuring JSX support.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_7

LANGUAGE: tsx
CODE:

```
import { Hono } from 'hono'

const app = new Hono()

const View = () => {
  return (
    <html>
      <body>
        <h1>Hello Hono!</h1>
      </body>
    </html>
  )
}

app.get('/page', (c) => {
  return c.html(<View />)
})
```

---

TITLE: Hono Request Parameter and Header Example
DESCRIPTION: Demonstrates how to extract URL path parameters (e.g., ':id') and query parameters (e.g., '?page') and set custom response headers.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_5

LANGUAGE: ts
CODE:

```
app.get('/posts/:id', (c) => {
  const page = c.req.query('page')
  const id = c.req.param('id')
  c.header('X-Message', 'Hi!')
  return c.text(`You want to see ${page} of ${id}`)
})
```

---

TITLE: Hono Raw Response Example
DESCRIPTION: Demonstrates returning a raw MDN Response object directly from a Hono route handler.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_8

LANGUAGE: ts
CODE:

```
app.get('/', () => {
  return new Response('Good morning!')
})
```

---

TITLE: Setup Project with bun
DESCRIPTION: Initializes a new project directory, installs Hono and the Alibaba Cloud Function Compute adapter using bun, and sets up source files.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/ali-function-compute.md#_snippet_3

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
bun add hono hono-alibaba-cloud-fc3-adapter
bun add -D esbuild @serverless-devs/s
mkdir src
touch src/index.ts
```

---

TITLE: Basic Hono Hello World App
DESCRIPTION: A fundamental Hono application that sets up a GET route to return 'Hello Hono!' as plain text.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_3

LANGUAGE: ts
CODE:

```
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
```

---

TITLE: Create Hono Project with Package Managers
DESCRIPTION: Demonstrates how to create a new Hono project using the 'create-hono' command with various package managers like npm, yarn, pnpm, bun, and deno.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_0

LANGUAGE: sh
CODE:

```
npm create hono@latest my-app
```

LANGUAGE: sh
CODE:

```
yarn create hono my-app
```

LANGUAGE: sh
CODE:

```
pnpm create hono@latest my-app
```

LANGUAGE: sh
CODE:

```
bun create hono@latest my-app
```

LANGUAGE: sh
CODE:

```
deno init --npm hono@latest my-app
```

---

TITLE: Setup Project with pnpm
DESCRIPTION: Initializes a new project directory, installs Hono and the Alibaba Cloud Function Compute adapter using pnpm, and sets up source files.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/ali-function-compute.md#_snippet_2

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
pnpm add hono hono-alibaba-cloud-fc3-adapter
pnpm add -D @serverless-devs/s esbuild
mkdir src
touch src/index.ts
```

---

TITLE: Setup Project with npm
DESCRIPTION: Initializes a new project directory, installs Hono and the Alibaba Cloud Function Compute adapter using npm, and sets up source files.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/ali-function-compute.md#_snippet_0

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
npm i hono hono-alibaba-cloud-fc3-adapter
npm i -D @serverless-devs/s esbuild
mkdir src
touch src/index.ts
```

---

TITLE: Setup Project with yarn
DESCRIPTION: Initializes a new project directory, installs Hono and the Alibaba Cloud Function Compute adapter using yarn, and sets up source files.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/ali-function-compute.md#_snippet_1

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
yarn add hono hono-alibaba-cloud-fc3-adapter
yarn add -D @serverless-devs/s esbuild
mkdir src
touch src/index.ts
```

---

TITLE: Setup Project with Hono and CDK
DESCRIPTION: Initializes a new project using AWS CDK and installs Hono and esbuild. This setup is common across different package managers like npm, yarn, pnpm, and bun.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/aws-lambda.md#_snippet_0

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
npm i hono
npm i -D esbuild
mkdir lambda
touch lambda/index.ts
```

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
yarn add hono
yarn add -D esbuild
mkdir lambda
touch lambda/index.ts
```

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
pnpm add hono
pnpm add -D esbuild
mkdir lambda
touch lambda/index.ts
```

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
bun add hono
bun add -D esbuild
mkdir lambda
touch lambda/index.ts
```

---

TITLE: Hono Basic Example
DESCRIPTION: A fundamental example demonstrating how to create a Hono application instance and define a basic GET route. This snippet showcases the core structure for building web applications with Hono.

SOURCE: https://github.com/honojs/website/blob/main/docs/index.md#_snippet_0

LANGUAGE: ts
CODE:

```
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hono!'))

export default app
```

---

TITLE: Install Dependencies with Bun
DESCRIPTION: Navigates into the project directory and installs all necessary dependencies using 'bun install'.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/bun.md#_snippet_1

LANGUAGE: sh
CODE:

```
cd my-app
bun install
```

---

TITLE: Setup OpenAPIHono Application
DESCRIPTION: Initialize an OpenAPIHono application and register routes. This example shows how to handle requests using validated parameters and return JSON responses.

SOURCE: https://github.com/honojs/website/blob/main/examples/zod-openapi.md#_snippet_2

LANGUAGE: ts
CODE:

```
import { OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(route, (c) => {
  const { id } = c.req.valid('param')
  return c.json({
    id,
    age: 20,
    name: 'Ultra-man',
  })
})
```

---

TITLE: Hono Basic Authentication Middleware
DESCRIPTION: Applies basic authentication middleware to routes starting with '/admin/\*', protecting them with a username and password.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_9

LANGUAGE: ts
CODE:

```
import { basicAuth } from 'hono/basic-auth'

// ... assuming app is initialized

app.use(
  '/admin/*',
  basicAuth({
    username: 'admin',
    password: 'secret',
  })
)

app.get('/admin', (c) => {
  return c.text('You are authorized!')
})
```

---

TITLE: Hono Hello World for Netlify Edge Functions
DESCRIPTION: A basic 'Hello Hono!' example for Netlify Edge Functions. It imports Hono and the Netlify handler, defines a simple GET route for the root path, and exports the Hono app wrapped by the Netlify handler.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/netlify.md#_snippet_1

LANGUAGE: ts
CODE:

```
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default handle(app)
```

---

TITLE: Install Cloudflare Workers Types
DESCRIPTION: Commands to install the `@cloudflare/workers-types` package as a development dependency, providing TypeScript typings for Cloudflare Workers.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/cloudflare-workers.md#_snippet_8

LANGUAGE: sh
CODE:

```
npm i --save-dev @cloudflare/workers-types
```

LANGUAGE: sh
CODE:

```
yarn add -D @cloudflare/workers-types
```

LANGUAGE: sh
CODE:

```
pnpm add -D @cloudflare/workers-types
```

LANGUAGE: sh
CODE:

```
bun add --dev @cloudflare/workers-types
```

---

TITLE: Create Hono Project with Bun
DESCRIPTION: Starts a new Hono project using the 'bun create' command. This sets up a basic Hono application structure.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/bun.md#_snippet_0

LANGUAGE: sh
CODE:

```
bun create hono@latest my-app
```

---

TITLE: Hono Application Testing Example
DESCRIPTION: Example TypeScript code for testing a Hono application using a testing framework, verifying the response status.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/cloudflare-workers.md#_snippet_9

LANGUAGE: ts
CODE:

```
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Please test me!'))

describe('Test the application', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('http://localhost/')
    expect(res.status).toBe(200)
  })
})
```

---

TITLE: Install Project Dependencies
DESCRIPTION: Commands to install project dependencies after creating a new Hono project. Supports npm, yarn, pnpm, and bun.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/cloudflare-workers.md#_snippet_1

LANGUAGE: sh
CODE:

```
cd my-app
npm i
```

LANGUAGE: sh
CODE:

```
cd my-app
yarn
```

LANGUAGE: sh
CODE:

```
cd my-app
pnpm i
```

LANGUAGE: sh
CODE:

```
cd my-app
bun i
```

---

TITLE: Install Dependencies and Run HonoJS App
DESCRIPTION: Navigates into the HonoJS project directory, installs dependencies, and starts the development server. The port is updated to 8080 for Cloud Run compatibility.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/google-cloud-run.md#_snippet_9

LANGUAGE: sh
CODE:

```
cd my-app
npm i
npm run dev
```

---

TITLE: Renovate Configuration Example
DESCRIPTION: This snippet shows how to extend your `renovate.json` to use the `shinGangan/renovate-config-hono` configuration. It helps in setting up automated dependency updates for Hono projects.

SOURCE: https://github.com/honojs/website/blob/main/docs/guides/faq.md#_snippet_0

LANGUAGE: json
CODE:

```
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>shinGangan/renovate-config-hono"
  ]
}
```

---

TITLE: Hello World Example
DESCRIPTION: A basic Hono application written in TypeScript that responds with 'Hello Fastly!' to root requests. It demonstrates the core structure for a Fastly Compute service.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/fastly.md#_snippet_2

LANGUAGE: ts
CODE:

```
// src/index.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Fastly!'))

app.fire()
```

---

TITLE: Hono WebSocket Upgrade for Cloudflare Workers
DESCRIPTION: Shows how to use the 'upgradeWebSocket' adapter for Cloudflare Workers to handle WebSocket connections within a Hono application.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/basic.md#_snippet_10

LANGUAGE: ts
CODE:

```
import { upgradeWebSocket } from 'hono/cloudflare-workers'

// ... assuming app is initialized

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    // WebSocket logic here
    return {
      onMessage(message, next) { console.log(message); next() },
      onClose() { console.log('closed') },
      onError(err) { console.error('err', err) },
    }
  })
)
```

---

TITLE: Hono Hello World for Cloudflare Workers
DESCRIPTION: Example TypeScript code for a basic 'Hello World' Hono application designed to run on Cloudflare Workers.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/cloudflare-workers.md#_snippet_2

LANGUAGE: ts
CODE:

```
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Cloudflare Workers!'))

export default app
```

---

TITLE: Initialize Hono Project for Deno
DESCRIPTION: Command to create a new Hono project specifically for Deno using npm specifiers.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/deno.md#_snippet_0

LANGUAGE: bash
CODE:

```
deno init --npm hono my-app
```

---

TITLE: Environment Variables Setup
DESCRIPTION: Configuration for environment variables required by Better Auth and Neon. Includes examples for local development (.dev.vars, .env) and notes on production secrets.

SOURCE: https://github.com/honojs/website/blob/main/examples/better-auth-on-cloudflare.md#_snippet_1

LANGUAGE: plaintext
CODE:

```
# Used by Wrangler in local development
# In production, these should be set as Cloudflare Worker Secrets.

BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
DATABASE_URL=
```

LANGUAGE: plaintext
CODE:

```
# Used for local development and CLI tools such as:
#
# - Drizzle CLI
# - Better Auth CLI

BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
DATABASE_URL=
```

---

TITLE: Serve Static Files with Hono/Bun
DESCRIPTION: Demonstrates serving static files using `serveStatic` from `hono/bun`. It includes examples for serving files from a root directory, specific paths, and fallback files.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/bun.md#_snippet_5

LANGUAGE: ts
CODE:

```
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))
```

---

TITLE: Run Hono Development Server Locally
DESCRIPTION: Commands to start the local development server for a Hono Cloudflare Workers project. Supports npm, yarn, pnpm, and bun.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/cloudflare-workers.md#_snippet_3

LANGUAGE: sh
CODE:

```
npm run dev
```

LANGUAGE: sh
CODE:

```
yarn dev
```

LANGUAGE: sh
CODE:

```
pnpm dev
```

LANGUAGE: sh
CODE:

```
bun run dev
```

---

TITLE: Create Hono Project for Netlify
DESCRIPTION: Demonstrates how to start a new Hono project for Netlify using various package managers like npm, yarn, pnpm, bun, and deno. This command sets up the basic project structure for Netlify Edge Functions.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/netlify.md#_snippet_0

LANGUAGE: npm
CODE:

```
npm create hono@latest my-app
```

LANGUAGE: yarn
CODE:

```
yarn create hono my-app
```

LANGUAGE: pnpm
CODE:

```
pnpm create hono my-app
```

LANGUAGE: bun
CODE:

```
bun create hono@latest my-app
```

LANGUAGE: deno
CODE:

```
deno init --npm hono my-app
```

---

TITLE: Run Development Server
DESCRIPTION: Commands to start the Hono development server using different package managers.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/nodejs.md#_snippet_4

LANGUAGE: sh
CODE:

```
npm run dev
```

LANGUAGE: sh
CODE:

```
yarn dev
```

LANGUAGE: sh
CODE:

```
pnpm dev
```

---

TITLE: Test Local Edge Function via cURL
DESCRIPTION: Makes a GET request to a locally served Supabase Edge Function. This example targets the 'hello-world' function's '/hello' endpoint.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/supabase-functions.md#_snippet_4

LANGUAGE: bash
CODE:

```
curl  --location  'http://127.0.0.1:54321/functions/v1/hello-world/hello'
```

---

TITLE: Create New Pylon Project (Bash)
DESCRIPTION: This command initiates the creation of a new Pylon project, setting up a basic structure and configuration. It allows selection of preferred runtimes like Bun, Node.js, or Cloudflare Workers.

SOURCE: https://github.com/honojs/website/blob/main/examples/pylon.md#_snippet_0

LANGUAGE: bash
CODE:

```
npm create pylon my-pylon@latest
```

---

TITLE: Integrate Hono with Other Cloudflare Worker Event Handlers
DESCRIPTION: Example of exporting Hono's fetch handler alongside other event handlers like 'scheduled' in Module Worker mode.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/cloudflare-workers.md#_snippet_6

LANGUAGE: ts
CODE:

```
const app = new Hono()

export default {
  fetch: app.fetch,
  scheduled: async (batch, env) => {},
}
```

---

TITLE: Project Setup Commands
DESCRIPTION: Commands to create a new project directory and navigate into it, preparing for the Vite and Hono setup.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/service-worker.md#_snippet_0

LANGUAGE: shell
CODE:

```
mkdir my-app
cd my-app
```

---

TITLE: Hono Application Example
DESCRIPTION: A simple Hono application that defines a GET route for the root path, returning a 'Hello Azure Functions!' text response. This serves as the core logic for the serverless function.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/azure-functions.md#_snippet_4

LANGUAGE: ts
CODE:

```
// src/app.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Azure Functions!'))

export default app
```

---

TITLE: Import Hono Adapter Functions
DESCRIPTION: Demonstrates how to import the necessary functions, `env` and `getRuntimeKey`, from the `hono/adapter` module. These imports are the first step to utilizing the adapter's capabilities.

SOURCE: https://github.com/honojs/website/blob/main/docs/helpers/adapter.md#_snippet_0

LANGUAGE: ts
CODE:

```
import { Hono } from 'hono'
import { env, getRuntimeKey } from 'hono/adapter'
```

---

TITLE: Initialize Project and Install Hono (Multiple Package Managers)
DESCRIPTION: Commands to set up a new project using AWS CDK, install Hono, and create a lambda directory. Supports initialization with npm, yarn, pnpm, and bun.

SOURCE: https://github.com/honojs/website/blob/main/docs/getting-started/lambda-edge.md#_snippet_0

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
npm i hono
mkdir lambda
```

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
yarn add hono
mkdir lambda
```

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
pnpm add hono
mkdir lambda
```

LANGUAGE: sh
CODE:

```
mkdir my-app
cd my-app
cdk init app -l typescript
bun add hono
mkdir lambda
```
