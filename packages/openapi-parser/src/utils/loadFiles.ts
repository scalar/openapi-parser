import fs from 'node:fs'
import path from 'node:path'

import { normalize } from './normalize'
import { traverse } from './traverse'

/**
 * Load a given file from the filesystem, and all its references. (Node-only)
 */
export function loadFiles(file: string, basePath?: string) {
  const files: any[] = []

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
  const specification = normalize(content)

  // Find all references
  const references: string[] = []
  traverse(specification, (value: any) => {
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
    specification,
  })

  // Load all references
  for (const reference of references) {
    const refFile = path.resolve(dir, reference)

    // Recursion FTW
    try {
      files.push(...loadFiles(refFile, basePath || dir))
    } catch {
      // TODO: Should this throw an error? 🤔
      // If something goes wrong here, just don’t add it to the list.
    }
  }

  return files
}
