import { describe, expect, it } from 'vitest'

import { makeFilesystem } from '../../utils/makeFilesystem'
import { transformErrors } from './transformErrors'

describe('transformErrors', () => {
  it('transforms a string to a proper error object', () => {
    const result = transformErrors(
      makeFilesystem('').find((entrypoint) => entrypoint.entrypoint),
      'example error message',
    )

    expect(result).toEqual([
      {
        error: 'example error message',
        path: '',
        start: {
          column: 1,
          line: 1,
          offset: 0,
        },
      },
    ])
  })
})
