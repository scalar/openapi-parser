import { getListOfReferences } from '../getListOfReferences'
import { makeFilesystem } from '../makeFilesystem'
import { normalize } from '../normalize'

export type LoadPlugin = {
  check: (value?: any) => boolean
  get: (value: any) => any
}

export async function load(
  value: any,
  options?: {
    plugins?: LoadPlugin[]
  },
) {
  for (const plugin of options?.plugins ?? []) {
    if (plugin.check(value)) {
      const content = await plugin.get(value)

      const listOfReferences = getListOfReferences(normalize(content))

      let filesystem = makeFilesystem(content, {
        dir: value,
        filename: value,
      })

      // No other references
      if (listOfReferences.length === 0) {
        return filesystem
      }

      // Load other external references
      for (const reference of listOfReferences) {
        const otherFiles = await load(reference, options)

        filesystem = [
          ...filesystem,
          ...otherFiles.map((entry) => ({
            isEntrypoint: false,
            dir: reference,
            filename: reference,
            ...entry,
          })),
        ]

        return filesystem
      }
    }
  }

  return makeFilesystem(value)
}
