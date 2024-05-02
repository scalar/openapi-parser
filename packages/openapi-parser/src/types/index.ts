import type { OpenAPI } from 'openapi-types'

import type { ResolvedOpenAPI } from './openapi'

export type {
  ResolvedOpenAPI,
  ResolvedOpenAPIV2,
  ResolvedOpenAPIV3,
  ResolvedOpenAPIV3_1,
} from './openapi'

export type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

export type AnyObject = Record<string, any>

export type ValidateResult = {
  valid: boolean
  specification?: OpenAPI.Document
  version?: string
  errors?: ErrorObject[]
}

export type ErrorObject = {
  start: {
    line: number
    column: number
    offset: number
  }
  error: string
  path: string
}

export type ResolveResult = {
  valid: boolean
  version: string | undefined
  specification?: OpenAPI.Document
  schema?: AnyObject | ResolvedOpenAPI.Document
  errors?: ErrorObject[]
}

export type AjvOptions = {
  strict?: boolean | 'log'
}

/**
 * Not literally a filesystem, but a list of files with their content.
 * This is an abstraction layer to handle multiple files in the browser (without access to the hard disk).
 */
export type Filesystem = FilesystemEntry[]

/**
 * Holds all information about a single file (doesn’t have to be a literal file, see Filesystem).
 */
export type FilesystemEntry = {
  dir: string
  isEntrypoint: boolean
  references: string[]
  filename: string
  specification: AnyObject
}
