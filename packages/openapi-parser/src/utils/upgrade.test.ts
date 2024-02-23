import { describe, expect, it } from 'vitest'

import { upgrade } from './upgrade'

describe('version', () => {
  it('doesn’t modify Swagger 2.0 files', async () => {
    const result = upgrade({
      swagger: '2.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })

    expect(result.swagger).toBe('2.0')
  })

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
