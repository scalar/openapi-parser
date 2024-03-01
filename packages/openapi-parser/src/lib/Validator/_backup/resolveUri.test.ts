import { describe, expect, it } from 'vitest'

import { getListOfReferences, loadFiles, resolve, validate } from '../../..'
import { relativePath } from '../../../../tests/utils'

const EXAMPLE_FILE = relativePath(
  import.meta.url,
  '../../../tests/resolveUri/invalid/openapi.yaml',
)

describe('resolveUri', async () => {
  it('resolves internal references', async () => {
    const specification = {
      openapi: '3.0.3',
      info: {
        title: 'Hello World',
        version: '2.0.0',
      },
      paths: {
        '/upload': {
          post: {
            description:
              'Internal endpoint for iOS app only, to upload a unit from the field.',
            responses: {
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/problem+json': {
                    schema: {
                      $ref: '#/components/schemas/Generic_Problem',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Generic_Problem: {
            title: 'Problem',
            type: 'string',
          },
        },
      },
    }

    const result = await resolve(specification)

    expect(result.valid).toBe(true)
    expect(
      result.schema?.paths?.['/upload']?.post?.responses?.[401]?.content[
        'application/problem+json'
      ]?.schema?.type,
    ).toEqual('string')
  })

  it('throws an error', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
      components: {
        schemas: {
          Generic_Problem: {
            $ref: '#/foo/bar/does_not_exist',
          },
        },
      },
    }

    const result = await resolve(specification)

    expect(result.valid).toBe(false)
    expect(result.errors?.length).toEqual(1)
    expect(result.errors?.[0].error).toEqual(
      'Can’t resolve URI: #/foo/bar/does_not_exist',
    )
  })

  it('returns an error when a reference file can not be found', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await validate(filesystem)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].error).toBe(
      `Can’t resolve URI: schemas/does-not-exist.yaml`,
    )
  })

  it.todo('resolves file references', async () => {
    const baseFile = {
      openapi: '3.0.3',
      info: {
        title: 'Hello World',
        version: '2.0.0',
      },
      paths: {
        '/upload': {
          post: {
            description:
              'Internal endpoint for iOS app only, to upload a unit from the field.',
            responses: {
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/problem+json': {
                    schema: {
                      $ref: 'problem.yaml',
                    },
                  },
                },
              },
            },
          },
        },
      },
    }

    const referencedFile = {
      title: 'Problem',
      type: 'string',
    }

    const result = await resolve([
      {
        isEntrypoint: true,
        specification: baseFile,
        filename: 'openapi.json',
        dir: './',
        references: getListOfReferences(baseFile),
      },
      {
        isEntrypoint: false,
        specification: referencedFile,
        filename: 'problem.yaml',
        dir: './',
        references: getListOfReferences(referencedFile),
      },
    ])

    expect(result.valid).toBe(true)
    expect(
      result.schema?.paths?.['/upload']?.post?.responses?.[401]?.content[
        'application/problem+json'
      ]?.schema?.type,
    ).toEqual('string')
  })

  it.todo('resolves file references with pointers', async () => {
    const baseFile = {
      openapi: '3.0.3',
      info: {
        title: 'Hello World',
        version: '2.0.0',
      },
      paths: {
        '/upload': {
          post: {
            description:
              'Internal endpoint for iOS app only, to upload a unit from the field.',
            responses: {
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/problem+json': {
                    schema: {
                      $ref: 'problem.yaml#/components/schemas/Problem',
                    },
                  },
                },
              },
            },
          },
        },
      },
    }

    const referencedFile = {
      components: {
        schemas: {
          Problem: {
            type: 'string',
          },
        },
      },
    }

    const result = await resolve([
      {
        isEntrypoint: true,
        specification: baseFile,
        filename: 'openapi.json',
        dir: './',
        references: getListOfReferences(baseFile),
      },
      {
        isEntrypoint: false,
        specification: referencedFile,
        filename: 'problem.yaml',
        dir: './',
        references: getListOfReferences(referencedFile),
      },
    ])

    expect(result.valid).toBe(true)
    expect(
      result.schema?.paths?.['/upload']?.post?.responses?.[401]?.content[
        'application/problem+json'
      ]?.schema,
    ).toMatchObject({
      type: 'string',
    })
  })

  // TODO: References in referenced files
})
