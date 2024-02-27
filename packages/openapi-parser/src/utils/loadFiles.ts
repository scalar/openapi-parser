import fs from 'node:fs'
import path from 'node:path'

import { getListOfReferences } from './getListOfReferences'
import { normalize } from './normalize'

/**
 * Load a given file from the filesystem, and all its references. (Node-only)
 */
export function loadFiles(file: string, basePath?: string) {
  const isEntrypoint = !basePath

  const files: any[] = []

  // Check if file exists
  if (!fs.existsSync(file)) {
    throw new Error(`File not found: ${file}`)
  }

  // Read file content
  const content = fs.readFileSync(file, 'utf-8')

  // Get file directory and filename
  const dir = path.dirname(file)
  const filename = isEntrypoint
    ? path.basename(file)
    : path.relative(basePath, file)

  // Normalize content
  const specification = normalize(content)

  // Find all references
  const references = getListOfReferences(specification)

  // Add file
  files.push({
    dir,
    isEntrypoint,
    references: getListOfReferences(specification),
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
      // If something goes wrong here, just don’t add it to the list.
      // TODO: Or should this throw an error? 🤔
    }
  }

  return files
}
