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
  // Check whether the value is an URL or file path
  const plugin = options?.plugins?.find((plugin) => plugin.check(value))
  const content = normalize(plugin ? await plugin.get(value) : value)
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
    // find first plugin
    const plugin = options?.plugins?.find((plugin) => plugin.check(reference))

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
      ...referencedFiles
        .filter(
          (entry) =>
            !filesystem.find((file) => file.filename === entry.filename),
        )
        .map((file) => {
          return {
            ...file,
            isEntrypoint: false,
          }
        }),
    ]
  }

  return filesystem

  //   // Create a temporary filesystem
  //   const rootDir = plugin.getDir ? plugin.getDir(value) : value

  //   const rootFilename = plugin.getFilename ? plugin.getFilename(value) : value

  //   filesystem = makeFilesystem(content, {
  //     filename: options.filename ?? rootFilename,
  //     dir: rootDir,
  //   })

  //   // No other references
  //   if (listOfReferences.length === 0) {
  //     return filesystem
  //   }

  //   // Load other external references
  //   for (const reference of listOfReferences) {
  //     const target =
  //       plugin.check(reference) && plugin.resolvePath
  //         ? plugin.resolvePath(value, reference)
  //         : reference

  //     const referencedFiles = await load(target, {
  //       ...options,
  //       // Make the filename the exact same value as the $ref
  //       // TODO: This leads to problems, if there are multiple references with the same file name but in different folders
  //       filename: reference,
  //     })

  //     filesystem = [
  //       ...filesystem,
  //       ...referencedFiles.map((file) => {
  //         return {
  //           ...file,
  //           isEntrypoint: false,
  //         }
  //       }),
  //     ]
  //   }
  // }

  // return filesystem
}
