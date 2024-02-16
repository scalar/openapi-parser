import Ajv04 from 'ajv-draft-04'
import Ajv2020 from 'ajv/dist/2020'
import { JSON_SCHEMA } from 'js-yaml'

export const supportedVersions = new Set(['2.0', '3.0', '3.1'])

export const jsonSchemaVersions = {
  'http://json-schema.org/draft-04/schema#': Ajv04,
  'https://json-schema.org/draft/2020-12/schema': Ajv2020,
}

export const yamlOptions = {
  schema: JSON_SCHEMA,
}

export const ERRORS = {
  EMPTY_OR_INVALID: 'Cannot find JSON, YAML or filename in data',
  // URI_MUST_BE_STRING: 'uri parameter or $id attribute must be a string',
  OPENAPI_VERSION_NOT_SUPPORTED:
    'Cannot find supported Swagger/OpenAPI version in specification, version must be a string.',
}

export const inlinedRefs = 'x-inlined-refs'
