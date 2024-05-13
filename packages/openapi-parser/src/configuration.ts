import Ajv04 from 'ajv-draft-04'
import Ajv2020 from 'ajv/dist/2020'

import Swagger20 from '../schemas/v2.0/schema.json'
import OpenApi30 from '../schemas/v3.0/schema.json'
import OpenApi31 from '../schemas/v3.1/schema.json'

/**
 * A list of the supported OpenAPI specifications
 */
export const OpenApiSpecifications = {
  '2.0': Swagger20,
  '3.0': OpenApi30,
  '3.1': OpenApi31,
}

export type OpenApiVersion = keyof typeof OpenApiSpecifications

export const OpenApiVersions = Object.keys(
  OpenApiSpecifications,
) as OpenApiVersion[]

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
  INVALID_REFERENCE: 'Can’t resolve reference: %s',
  EXTERNAL_REFERENCE_NOT_FOUND: 'Can’t resolve external reference: %s',
  FILE_DOES_NOT_EXIST: 'File does not exist: %s',
} as const

export type VALIDATOR_ERROR = keyof typeof ERRORS
