import { describe, expect, it } from 'vitest'

import { normalize, resolveRefs } from '../../../src'
import specification from './specification.json'

describe.todo('Single-file schema with internal $refs', () => {
  it('relative path', async () => {
    const schema = resolveRefs(normalize(specification))

    expect(schema).not.toBe(undefined)
  })

  it('absolute path', async () => {
    //
  })

  it('URL', async () => {
    //
  })
})
