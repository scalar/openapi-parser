import { describe, expect, it } from 'vitest'

import { normalize, resolveReferences } from '../../../src'
import specification from './specification.json'

describe.todo('Circular $refs to ancestor', () => {
  it('relative path', async () => {
    const schema = resolveReferences(normalize(specification))

    expect(schema).not.toBe(undefined)
  })

  it('absolute path', async () => {
    //
  })

  it('URL', async () => {
    //
  })
})
