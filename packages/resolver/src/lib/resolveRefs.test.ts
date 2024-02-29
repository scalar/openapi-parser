import { describe, expect, it } from 'vitest'

import { resolveRefs } from './resolveRefs'

describe('resolveRefs', () => {
  it('internal reference', () => {
    const specification = {
      type: 'object',
      properties: {
        first_name: { $ref: '#/schemas/name' },
        last_name: { $ref: '#/schemas/name' },
      },
      schemas: {
        name: { type: 'string' },
      },
    }

    const schema = resolveRefs(specification)

    // Original specification should not be mutated
    expect(specification.properties.first_name.$ref).toBeTypeOf('string')

    // Internal reference should be resolved
    expect(schema.properties.first_name.type).toBe('string')
  })

  it('circular reference', () => {
    const specification = {
      type: 'object',
      properties: {
        element: { $ref: '#/schemas/element' },
      },
      schemas: {
        element: {
          type: 'object',
          properties: {
            element: { $ref: '#/schemas/element' },
          },
        },
      },
    }

    const schema = resolveRefs(specification)

    // Original specification should not be mutated
    expect(specification.properties.element.$ref).toBeTypeOf('string')

    // Circular dependency should be resolved
    expect(schema.properties.element.type).toBe('object')
    expect(schema.properties.element.properties.element.type).toBe('object')
    expect(
      schema.properties.element.properties.element.properties.element.type,
    ).toBe('object')
  })
})
