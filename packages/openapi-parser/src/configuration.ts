import Ajv04 from 'ajv-draft-04'
import Ajv2020 from 'ajv/dist/2020'

/**
 * A list of the supported OpenAPI versions
 */
export const supportedVersions = ['2.0', '3.0', '3.1'] as const

export type SupportedVersion = (typeof supportedVersions)[number]

/**
 * Configure available JSON Schema versions
 */
export const jsonSchemaVersions = {
  'http://json-schema.org/draft-04/schema#': Ajv04,
  'https://json-schema.org/draft/2020-12/schema': Ajv2020,
}

/**
 * List of error messages used in the Validator
 */
export const ERRORS = {
  EMPTY_OR_INVALID: 'Cannot find JSON, YAML or filename in data',
  // URI_MUST_BE_STRING: 'uri parameter or $id attribute must be a string',
  OPENAPI_VERSION_NOT_SUPPORTED:
    'Cannot find supported Swagger/OpenAPI version in specification, version must be a string.',
  INVALID_REFERENCE: 'Can’t resolve URI: %s',
  EXTERNAL_REFERENCE_NOT_SUPPORTED:
    'External references are not supported yet: %s',
} as const

export type VALIDATOR_ERROR = keyof typeof ERRORS

export const inlinedRefs = 'x-inlined-refs'
