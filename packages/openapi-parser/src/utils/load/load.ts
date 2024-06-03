// import { relative } from '../../polyfills/path'
import { Filesystem } from '../../types'
import { getListOfReferences } from '../getListOfReferences'
import { makeFilesystem } from '../makeFilesystem'
import { normalize } from '../normalize'

export type LoadPlugin = {
  check: (value?: any) => boolean
  get: (value: any) => any
  resolvePath?: (value: any, reference: string) => string
  getDir?: (value: any) => string
  getFilename?: (value: any) => string
}

export async function load(
  value: any,
  options?: {
    plugins?: LoadPlugin[]
    filename?: string
    filesystem?: Filesystem
  },
) {
  // Don’t load a reference twice, check the filesystem before fetching something
  if (
    options?.filesystem &&
    options?.filesystem.find((entry) => entry.filename === value)
  ) {
    return options.filesystem
  }

  // Check whether the value is an URL or file path
  const plugin = options?.plugins?.find((plugin) => plugin.check(value))
  const content = normalize(plugin ? await plugin.get(value) : value)

  // No content
  if (content === undefined) {
    return []
  }

  let filesystem = makeFilesystem(content, {
    filename: options?.filename ?? null,
  })

  // External references
  const listOfReferences = getListOfReferences(content)

  // No other references
  if (listOfReferences.length === 0) {
    return filesystem
  }

  // Load other external references
  for (const reference of listOfReferences) {
    // Find a matching plugin
    const plugin = options?.plugins?.find((plugin) => plugin.check(reference))

    // Skip if no plugin is found (internal references don’t need a plugin for example)
    if (!plugin) {
      continue
    }

    const target =
      plugin.check(reference) && plugin.resolvePath
        ? plugin.resolvePath(value, reference)
        : reference

    // Don’t load a reference twice, check the filesystem before fetching something
    if (filesystem.find((entry) => entry.filename === reference)) {
      continue
    }

    const referencedFiles = await load(target, {
      ...options,
      // Make the filename the exact same value as the $ref
      // TODO: This leads to problems, if there are multiple references with the same file name but in different folders
      filename: reference,
    })

    filesystem = [
      ...filesystem,
      ...referencedFiles.map((file) => {
        return {
          ...file,
          isEntrypoint: false,
        }
      }),
    ]
  }

  return filesystem
}
