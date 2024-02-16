import addFormats from 'ajv-formats'
import { load } from 'js-yaml'

import {
  ERRORS,
  inlinedRefs,
  jsonSchemaVersions,
  supportedVersions,
  yamlOptions,
} from '../configuration'
import type {
  AjvOptions,
  Filesystem,
  Specification,
  ValidateOptions,
  ValidateResult,
} from '../types'
import { details as getOpenApiVersion } from '../utils'
import { isFilesystem } from '../utils/isFilesystem'
import { checkRefs, replaceRefs } from './resolve'
import { transformErrors } from './transformErrors'

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

  public specification: Specification

  public version: string

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

  resolveRefs(
    filesystem?: Filesystem,
    opts: { specification?: Specification } = {},
  ) {
    return replaceRefs(this.specification || opts.specification, filesystem)
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
    data: string | Record<string, any> | Filesystem,
    options?: ValidateOptions,
  ): Promise<ValidateResult> {
    const value = isFilesystem(data)
      ? (data as Filesystem).find((value) => value.entrypoint).content
      : data

    try {
      const specification = await getSpecFromData(value)

      // TODO: How does this work with a filesystem?
      this.specification = specification

      if (specification === undefined || specification === null) {
        return {
          valid: false,
          errors: transformErrors(null, ERRORS.EMPTY_OR_INVALID),
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
          errors: transformErrors(
            specification,
            ERRORS.OPENAPI_VERSION_NOT_SUPPORTED,
          ),
        }
      }

      const validateSchema = await this.getAjvValidator(version)

      // Check if the specification matches the JSON schema
      const schemaResult = validateSchema(specification)

      // Check if the references are valid as those can’t be validated bu JSON schema
      if (schemaResult) {
        return checkRefs(
          specification,
          isFilesystem(data) ? (data as Filesystem) : undefined,
        )
      }

      const result: ValidateResult = {
        valid: schemaResult,
      }

      if (validateSchema.errors) {
        let errors = []

        if (typeof validateSchema.errors === 'string') {
          errors = transformErrors(specification, validateSchema.errors)
        } else {
          errors = validateSchema.errors
        }

        if (errors.length > 0) {
          result.errors = transformErrors(specification, errors)
        }
      }

      return result
    } catch (error) {
      return {
        valid: false,
        errors: transformErrors(this.specification, error.message ?? error),
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
