import { describe, expect, it } from 'vitest'

import { loadFiles, resolve, validate } from '../src'
import { relativePath } from './utils'

const EXAMPLE_FILE = relativePath(
  import.meta.url,
  './tests/filesystem/api/openapi.yaml',
)

describe.todo('filesystem', async () => {
  it('loads all files', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    expect(filesystem.length).toBe(4)
    expect(filesystem[0].entrypoint).toBe(true)
    expect(filesystem[0].filename).toBe('openapi.yaml')
    expect(filesystem[0].references.length).toBe(2)
    expect(filesystem[0].references[0]).toBe('schemas/problem.yaml')
    expect(filesystem[0].references[1]).toBe('schemas/upload.yaml')

    expect(filesystem[1].entrypoint).toBe(false)
    expect(filesystem[1].filename).toBe('schemas/problem.yaml')
  })

  it('validates filesytem', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await validate(filesystem)

    expect(result.errors).toBe(undefined)
    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })

  it('resolves filesytem', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await resolve(filesystem)

    expect(result.valid).toBe(true)

    expect(result.errors).toBe(undefined)
    expect(result.version).toBe('3.0')
    // TODO: Resolve the *path* from the given file
    // console.log('RESULT', result.schema.components.schemas.Upload)
    // @ts-ignore
    expect(result.schema.components.schemas.Upload.allOf[0].title).toBe(
      'Coordinates',
    )
  })
})
