import { parse } from '@humanwhocodes/momoa'

import prettify from './helpers'

type BetterAjvErrorsOptions = {
  colorize?: boolean
  format?: 'cli' | 'js'
  indent?: number
  json?: string
}

// TODO: Check if this is the correct type
type AjvError = {
  keyword: string
  dataPath: string
  schemaPath: string
  params: any
  message: string
  schema: any
  parentSchema: any
  data: any
}

export function betterAjvErrors(
  schema: any,
  data: any,
  errors: AjvError[],
  options: BetterAjvErrorsOptions = {},
) {
  const {
    colorize = true,
    format = 'cli',
    indent = null,
    json = null,
  } = options

  const jsonRaw = json || JSON.stringify(data, null, indent)
  const jsonAst = parse(jsonRaw)

  const customErrorToText = (error) => error.print().join('\n')
  const customErrorToStructure = (error) => error.getError()
  const customErrors = prettify(errors, {
    colorize,
    data,
    schema,
    jsonAst,
    jsonRaw,
  })

  if (format === 'cli') {
    return customErrors.map(customErrorToText).join('\n\n')
  }

  return customErrors.map(customErrorToStructure)
}
