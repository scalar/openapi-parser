import { path } from '../../polyfills'
import type { Filesystem, FilesystemEntry } from '../../types'
import { resolveReferences } from './resolveReferences'

export function resolveFromFilesystem(
  file: FilesystemEntry,
  uri: string,
  filesystem: Filesystem,
) {
  // TODO: We should check all references recursively
  const sourceFile = file.filename
  const sourcePath = path.dirname(sourceFile)
  const reference = path.join(sourcePath, uri)
  const transformedUri = reference.split('#')[0]
  const pointer = reference.split('#')[1]

  const referencedFile = filesystem.find(
    (file) => file.filename === transformedUri,
  )

  // Couldn’t find the referenced file
  if (!referencedFile) {
    return undefined
  }

  // TODO: Needs to be cleaned up
  // If there is no pointer, prefix it with a #
  const formattedUri = pointer ? '#' + pointer : undefined

  return resolveReferences(filesystem, true, referencedFile, formattedUri)
}
