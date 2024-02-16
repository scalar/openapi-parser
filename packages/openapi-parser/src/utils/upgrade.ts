/**
 * Upgrade from OpenAPI 3.0.x to 3.1.0
 *
 * https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0
 */
export function upgrade(specification: Record<string, any>) {
  // Version
  if (specification.openapi.startsWith('3.0')) {
    specification.openapi = '3.1.0'
  }

  // Nullable types
  specification = recursivelyWalkThroughObject(specification, (schema) => {
    if (schema.type !== 'undefined' && schema.nullable === true) {
      schema.type = ['null', schema.type]
      delete schema.nullable
    }

    return schema
  })

  // exclusiveMinimum and exclusiveMaximum
  specification = recursivelyWalkThroughObject(specification, (schema) => {
    if (schema.exclusiveMinimum === true) {
      schema.exclusiveMinimum = schema.minimum
      delete schema.minimum
    } else if (schema.exclusiveMinimum === false) {
      delete schema.exclusiveMinimum
    }

    if (schema.exclusiveMaximum === true) {
      schema.exclusiveMaximum = schema.maximum
      delete schema.maximum
    } else if (schema.exclusiveMaximum === false) {
      delete schema.exclusiveMaximum
    }

    return schema
  })

  // Use examples not example
  specification = recursivelyWalkThroughObject(specification, (schema) => {
    if (schema.example !== undefined) {
      schema.examples = [schema.example]
      delete schema.example
    }

    return schema
  })

  // Multipart file uploads with a binary file
  specification = recursivelyWalkThroughObject(specification, (schema) => {
    if (schema.type === 'object' && schema.properties !== undefined) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (
          value !== undefined &&
          value.type === 'string' &&
          value.format === 'binary'
        ) {
          value.contentEncoding = 'application/octet-stream'
          delete value.format
        }
      }
    }

    return schema
  })

  // Uploading a binary file in a POST request
  specification = recursivelyWalkThroughObject(specification, (schema) => {
    if (schema.type === 'string' && schema.format === 'binary') {
      return undefined
    }

    return schema
  })

  // Uploading an image with base64 encoding
  specification = recursivelyWalkThroughObject(specification, (schema) => {
    if (schema.type === 'string' && schema.format === 'base64') {
      return {
        type: 'string',
        contentEncoding: 'base64',
      }
    }

    return schema
  })

  // Declaring $schema Dialects to protect against change
  // if (typeof specification.$schema === 'undefined') {
  //   specification.$schema = 'http://json-schema.org/draft-07/schema#'
  // }

  return specification
}

// Type
// Go through all the schemas and change where `type: * is used with nullable: true, change it to `type: ['null', *]`
function recursivelyWalkThroughObject(
  specification: Record<string, any>,
  transform: (specification: Record<string, any>) => Record<string, any>,
) {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(specification)) {
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return recursivelyWalkThroughObject(item, transform)
        }

        return item
      })
    } else if (typeof value === 'object' && value !== null) {
      result[key] = recursivelyWalkThroughObject(value, transform)
    } else {
      result[key] = value
    }
  }

  return transform(result)
}
