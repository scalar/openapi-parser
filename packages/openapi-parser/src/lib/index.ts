import Ajv04 from 'ajv-draft-04'
import addFormats from 'ajv-formats'
import Ajv2020 from 'ajv/dist/2020'
import { JSON_SCHEMA, load } from 'js-yaml'
import type {
  AjvOptions,
  Specification,
  ValidateResult,
  ValidateOptions,
} from '../types'
import { checkRefs, replaceRefs } from './resolve'
import betterAjvErrors from '../utils/betterAjvErrors'

const supportedVersions = new Set(['2.0', '3.0', '3.1'])

const jsonSchemaVersions = {
  'http://json-schema.org/draft-04/schema#': Ajv04,
  'https://json-schema.org/draft/2020-12/schema': Ajv2020,
}

const yamlOptions = {
  schema: JSON_SCHEMA,
}

const ERRORS = {
  EMPTY_OR_INVALID: 'Cannot find JSON, YAML or filename in data',
  URI_MUST_BE_STRING: 'uri parameter or $id attribute must be a string',
  OPENAPI_VERSION_NOT_SUPPORTED:
    'Cannot find supported Swagger/OpenAPI version in specification, version must be a string.',
}

const inlinedRefs = 'x-inlined-refs'

function makeErrorArray(error: string) {
  return [
    {
      start: {
        line: 1,
        column: 1,
        offset: 0,
      },
      error,
      path: '',
    },
  ]
}

function getOpenApiVersion(specification: Specification) {
  for (const version of supportedVersions) {
    const specificationType = version === '2.0' ? 'swagger' : 'openapi'
    const value = specification[specificationType]

    if (typeof value === 'string' && value.startsWith(version)) {
      return {
        version,
        specificationType,
        specificationVersion: value,
      }
    }
  }

  return {
    version: undefined,
    specificationType: undefined,
    specificationVersion: undefined,
  }
}

async function getSpecFromData(
  data: string | object,
): Promise<Specification | undefined> {
  if (typeof data === 'object') {
    return data
  }

  if (typeof data === 'string') {
    if (data.match(/\n/)) {
      try {
        // YAML
        return load(data, yamlOptions)
      } catch {
        return undefined
      }
    }

    try {
      // Browser
      if (typeof window !== 'undefined') {
        return undefined
      }

      // Node.js
      const { readFile } = await import('fs/promises')
      const fileData = await readFile(data, 'utf-8')

      return load(fileData, yamlOptions)
    } catch {
      return undefined
    }
  }

  return undefined
}

export class Validator {
  protected ajvOptions: AjvOptions

  // Object with function or object { errors: string }
  protected ajvValidators: Record<
    string,
    ((specification: Specification) => boolean) & {
      errors: string
    }
  >

  protected externalRefs: Record<string, Specification>

  protected specification: Specification

  protected version: string

  protected errors: string

  protected specificationVersion: string

  protected specificationType: string

  constructor(ajvOptions: AjvOptions = {}) {
    // AJV is a bit too strict in its strict validation of OpenAPI schemas
    // so switch strict mode and validateFormats off
    if (ajvOptions.strict !== 'log') {
      ajvOptions.strict = false
    }

    this.ajvOptions = ajvOptions
    this.ajvValidators = {}
    this.externalRefs = {}
  }

  static supportedVersions = supportedVersions

  resolveRefs(opts: { specification?: Specification } = {}) {
    return replaceRefs(this.specification || opts.specification)
  }

  async addSpecRef(data: string | object, uri: string) {
    const spec = await getSpecFromData(data)

    if (spec === undefined) {
      throw new Error(ERRORS.EMPTY_OR_INVALID)
    }

    const newUri = uri || spec.$id

    if (typeof newUri !== 'string') {
      throw new Error(ERRORS.URI_MUST_BE_STRING)
    }

    spec.$id = newUri

    this.externalRefs[newUri] = spec
  }

  async validate(
    data: string | object,
    options?: ValidateOptions,
  ): Promise<ValidateResult> {
    try {
      const specification = await getSpecFromData(data)

      this.specification = specification

      if (specification === undefined || specification === null) {
        return {
          valid: false,
          errors: makeErrorArray(ERRORS.EMPTY_OR_INVALID),
        }
      }

      if (Object.keys(this.externalRefs).length > 0) {
        specification[inlinedRefs] = this.externalRefs
      }

      const { version, specificationType, specificationVersion } =
        getOpenApiVersion(specification)

      this.version = version
      this.specificationVersion = specificationVersion
      this.specificationType = specificationType

      if (!version) {
        return {
          valid: false,
          errors: makeErrorArray(ERRORS.OPENAPI_VERSION_NOT_SUPPORTED),
        }
      }

      const validateSchema = await this.getAjvValidator(version)

      // Check if the specification matches the JSON schema
      const schemaResult = validateSchema(specification)

      // Check if the references are valid as those can’t be validated bu JSON schema
      if (schemaResult) {
        return checkRefs(specification)
      }

      const result: ValidateResult = {
        valid: schemaResult,
      }

      if (validateSchema.errors) {
        let errors = []

        if (typeof validateSchema.errors === 'string') {
          errors = makeErrorArray(validateSchema.errors)
        } else {
          errors = validateSchema.errors
        }

        if (errors.length > 0) {
          result.errors = betterAjvErrors(schemaResult, {}, errors, {
            format: options?.format ?? 'js',
            indent: options?.indent ?? 2,
            colorize: false,
          })
        }
      }

      return result
    } catch (error) {
      return {
        valid: false,
        errors: makeErrorArray(error.message ?? error),
      }
    }
  }

  async getAjvValidator(version: string) {
    // Schema loaded already
    if (this.ajvValidators[version]) {
      return this.ajvValidators[version]
    }

    // Load Schema
    const schema = await import(`../../schemas/v${version}/schema.json`)
    const schemaVersion = schema.$schema
    const AjvClass = jsonSchemaVersions[schemaVersion]
    const ajv = new AjvClass(this.ajvOptions)

    addFormats(ajv)

    // OpenAPI 3.1 uses media-range format
    ajv.addFormat('media-range', true)

    this.ajvValidators[version] = ajv.compile(schema)

    return this.ajvValidators[version]
  }
}
