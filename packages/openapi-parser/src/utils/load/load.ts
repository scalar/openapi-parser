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
  },
) {
  // TODO: Don’t load a reference twice, check the filesystem before fetching something
  let filesystem = makeFilesystem(value)

  for (const plugin of options?.plugins ?? []) {
    if (!plugin.check(value)) {
      continue
    }

    const content = await plugin.get(value)

    const listOfReferences = getListOfReferences(normalize(content))

    // Create a temporary filesystem
    const rootDir = plugin.getDir ? plugin.getDir(value) : value

    const rootFilename = plugin.getFilename ? plugin.getFilename(value) : value

    filesystem = makeFilesystem(content, {
      filename: options.filename ?? rootFilename,
      dir: rootDir,
    })

    // No other references
    if (listOfReferences.length === 0) {
      return filesystem
    }

    // Load other external references
    for (const reference of listOfReferences) {
      const target =
        plugin.check(reference) && plugin.resolvePath
          ? plugin.resolvePath(value, reference)
          : reference

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
  }

  return filesystem
}
