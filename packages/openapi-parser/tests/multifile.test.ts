import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { normalize, traverse } from '../src'
import { resolve } from '../src'

describe('multifile', async () => {
  it('loads all files', async () => {
    const files = loadAllFiles(
      './packages/openapi-parser/tests/multifile/api/openapi.yaml',
    )

    expect(files.length).toBe(4)
    expect(files[0].entrypoint).toBe(true)
    expect(files[0].filename).toBe('openapi.yaml')
    expect(files[0].references.length).toBe(2)

    expect(files[1].entrypoint).toBe(false)
    expect(files[1].filename).toBe('schemas/problem.yaml')

    console.log(files)
  })

  it.skip('loads file', async () => {
    const result = await resolve(
      path.resolve(
        './packages/openapi-parser/tests/multifile/api/openapi.yaml',
      ),
    )

    expect(result.errors).toBe(undefined)
    expect(result.valid).toBe(true)
    expect(result.schema.info.title).toBe('Hello World')
  })
})

function loadAllFiles(file: string, basePath?: string) {
  const files: any[] = []

  file = path.resolve(file)

  // Check if file exists
  if (!fs.existsSync(file)) {
    throw new Error(`File not found: ${file}`)
  }

  // Read file content
  const content = fs.readFileSync(file, 'utf-8')

  // Get file directory and filename
  const dir = path.dirname(file)
  const filename = !basePath
    ? path.basename(file)
    : path.relative(basePath, file)

  // Normalize content
  const normalized = normalize(content)

  // Find all references
  const references: string[] = []
  traverse(normalized, (value: any) => {
    if (
      value.$ref &&
      typeof value.$ref === 'string' &&
      !value.$ref.startsWith('#')
    ) {
      references.push(value.$ref)
    }

    return value
  })

  // Add file
  files.push({
    dir,
    entrypoint: !basePath,
    references,
    filename,
    content,
  })

  // Load all references
  for (const reference of references) {
    const refFile = path.resolve(dir, reference)

    // Recursion FTW
    files.push(...loadAllFiles(refFile, basePath || dir))
  }

  return files
}
