import type { z } from 'zod'

// declare module "zod" {
//   interface ZodType {
//     openapi?: OpenAPIMetadata;
//   }
// }

const OPENAPI_METADATA = Symbol('openapi')

interface OpenAPIMetadata {
    description?: string;
    example?: unknown;
    format?: string;
}

export function withOpenAPIMetadata<T extends z.ZodTypeAny>(
    schema: T,
    metadata: OpenAPIMetadata,
): T {
    if (metadata.description) {
        schema = schema.describe(metadata.description)
    }
    const enhancedSchema = Object.defineProperty(schema, OPENAPI_METADATA, {
        value: metadata,
        enumerable: false,
    }) as T & { openapi?: OpenAPIMetadata }
    return enhancedSchema
}

export function getOpenAPIMetadata(
    schema: z.ZodTypeAny,
): OpenAPIMetadata | undefined {
    return (schema as any)[OPENAPI_METADATA]
}

export function transformSchemaForOpenAPI<T extends z.ZodTypeAny>(
    schema: T,
    config: OpenAPIMetadata = {},
): T & { openapi?: OpenAPIMetadata } {
    return withOpenAPIMetadata(schema, {
        description: config.description || schema.description,
        example: config.example,
        format: config.format,
    })
}
