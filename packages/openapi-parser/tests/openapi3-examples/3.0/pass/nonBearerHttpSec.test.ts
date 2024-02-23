import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import nonBearerHttpSec from './nonBearerHttpSec.yaml'

describe('nonBearerHttpSec', () => {
  it('passes', async () => {
    const result = await resolve(nonBearerHttpSec)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
