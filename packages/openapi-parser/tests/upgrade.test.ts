import { describe, expect, it } from 'vitest'

import { openapi } from '../src'

describe('upgrade version', () => {
  it('changes the version to from 3.0.0 to 3.1.0', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })

    expect(result.openapi).toBe('3.1.0')
  })

  it('changes the version to 3.0.3 to 3.1.0', async () => {
    const result = upgrade({
      openapi: '3.0.3',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })

    expect(result.openapi).toBe('3.1.0')
  })
})

describe('upgrade nullable types', () => {
  it('migrates nullable types', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'foobar',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(
      result.paths['/test'].get.responses['200'].content['application/json']
        .schema,
    ).toEqual({
      type: ['null', 'string'],
    })
  })
})

describe('exclusiveMinimum and exclusiveMaximum', () => {
  it('migrate exclusiveMinimum and exclusiveMaximum', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'foobar',
                content: {
                  'application/json': {
                    schema: {
                      type: 'integer',
                      minimum: 1,
                      exclusiveMinimum: true,
                      maximum: 100,
                      exclusiveMaximum: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(
      result.paths['/test'].get.responses['200'].content['application/json']
        .schema,
    ).toEqual({
      type: 'integer',
      exclusiveMinimum: 1,
      exclusiveMaximum: 100,
    })
  })
})

describe('use examples not example', () => {
  it('make example an array', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'foobar',
                content: {
                  'application/json': {
                    schema: {
                      type: 'integer',
                      example: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(
      result.paths['/test'].get.responses['200'].content['application/json']
        .schema,
    ).toEqual({
      type: 'integer',
      examples: [1],
    })
  })
})

describe('describing File Upload Payloads ', () => {
  it('remove schema for file uploads', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            requestBody: {
              content: {
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(
      result.paths['/test'].get.requestBody.content['application/octet-stream'],
    ).toEqual({})
  })

  it('migrates base64 format to contentEncoding', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            requestBody: {
              content: {
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'base64',
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(
      result.paths['/test'].get.requestBody.content['application/octet-stream'],
    ).toEqual({
      schema: {
        type: 'string',
        contentEncoding: 'base64',
      },
    })
  })

  it('migrates binary format for multipart file uploads', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                        format: 'binary',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(
      result.paths['/test'].get.requestBody.content['multipart/form-data'],
    ).toEqual({
      schema: {
        type: 'object',
        properties: {
          fileName: {
            type: 'string',
            contentEncoding: 'application/octet-stream',
          },
        },
      },
    })
  })
})

describe('declaring $schema', () => {
  it('adds a $schema', async () => {
    const result = upgrade({
      openapi: '3.0.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })

    expect(result.$schema).toBe('http://json-schema.org/draft-07/schema#')
  })
})

/**
 * Upgrade from OpenAPI 3.0.x to 3.1.0
 *
 * https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0
 */
function upgrade(specification: Record<string, any>) {
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
  if (specification.$schema === undefined) {
    specification.$schema = 'http://json-schema.org/draft-07/schema#'
  }

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
