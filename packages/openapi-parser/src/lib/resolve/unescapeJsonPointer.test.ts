import { describe, expect, it } from 'vitest'

import { unescapeJsonPointer } from './unescapeJsonPointer'

describe('unescapeJsonPointer', async () => {
  it('should unescape a json pointer', () => {
    expect(
      unescapeJsonPointer(
        '#/paths/~1upload/post/responses/401/content/application~1problem+json/schema',
      ),
    ).toBe(
      '#/paths//upload/post/responses/401/content/application/problem+json/schema',
    )
  })
})
