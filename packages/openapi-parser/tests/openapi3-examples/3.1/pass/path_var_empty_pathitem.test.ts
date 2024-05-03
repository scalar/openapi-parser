import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import path_var_empty_pathitem from './path_var_empty_pathitem.yaml'

describe('path_var_empty_pathitem', () => {
  it('passes', async () => {
    const result = await resolve(path_var_empty_pathitem)
    expect(result.valid).toBe(true)
    expect(result.errors).toStrictEqual([])
    expect(result.version).toBe('3.1')
  })
})
