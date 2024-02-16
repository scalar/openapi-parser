import { betterAjvErrors } from '../utils/betterAjvErrors'

/**
 * Transforms ajv errors, finds the positions in the schema and returns an enriched format.
 */
export function transformErrors(specification: any, errors: any) {
  if (typeof errors === 'string') {
    return [
      {
        start: {
          line: 1,
          column: 1,
          offset: 0,
        },
        error: errors,
        path: '',
      },
    ]
  }

  return betterAjvErrors(specification, null, errors, {
    format: 'js',
    indent: 2,
    colorize: false,
  }).map((error) => {
    error.error = error.error.trim()

    return error
  })
  //   return errors.map((error: any) => {
  //     return {
  //       error: error.message,
  //       path: error.instancePath,
  //       start: {
  //         column: 1,
  //         line: 1,
  //         offset: 0,
  //       },
  //     }
  //   })
}
