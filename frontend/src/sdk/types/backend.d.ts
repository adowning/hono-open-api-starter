// This file provides type definitions for the backend API
declare module '../../../backend/src/app' {
  import type { OpenAPIHono } from '@hono/zod-openapi';
  import type { AppBindings } from '../../../backend/src/lib/types';
  
  // Define the AppType based on the backend's app type
  export type AppType = OpenAPIHono<AppBindings>;
  
  // Export the app instance type
  export const app: AppType;
}
