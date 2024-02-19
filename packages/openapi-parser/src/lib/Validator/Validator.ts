import addFormats from 'ajv-formats'

import {
  ERRORS,
  type SupportedVersion,
  inlinedRefs,
  jsonSchemaVersions,
  supportedVersions,
} from '../../configuration'
import type {
  Filesystem,
  Specification,
  ValidateOptions,
  ValidateResult,
} from '../../types'
import { details as getOpenApiVersion } from '../../utils'
import { checkReferences, replaceRefs } from './resolve'
import { transformErrors } from './transformErrors'

export class Validator {
  public version: string

  public static supportedVersions = supportedVersions

  // Object with function *or* object { errors: string }
  protected ajvValidators: Record<
    string,
    ((specification: Specification) => boolean) & {
      errors: string
    }
  > = {}

  protected externalRefs: Record<string, Specification> = {}

  protected errors: string

  protected specificationVersion: string

  protected specificationType: string

  public specification: Specification

  resolveRefs(filesystem?: Filesystem) {
    return replaceRefs(
      filesystem.find((file) => file.entrypoint),
      filesystem,
    )
  }

  // async addSpecRef(data: string | object, uri: string) {
  //   const spec = await getSpecFromData(data)

  //   if (spec === undefined) {
  //     throw new Error(ERRORS.EMPTY_OR_INVALID)
  //   }

  //   const newUri = uri || spec.$id

  //   if (typeof newUri !== 'string') {
  //     throw new Error(ERRORS.URI_MUST_BE_STRING)
  //   }

  //   spec.$id = newUri

  //   this.externalRefs[newUri] = spec
  // }

  async validate(
    filesystem: Filesystem,
    options?: ValidateOptions,
  ): Promise<ValidateResult> {
    const entrypoint = filesystem.find((file) => file.entrypoint)
    const specification = entrypoint?.specification

    // TODO: How does this work with a filesystem?
    this.specification = specification

    try {
      // Specification is empty or invalid
      if (specification === undefined || specification === null) {
        return {
          valid: false,
          errors: transformErrors(specification, ERRORS.EMPTY_OR_INVALID),
        }
      }

      // TODO: Do we want to keep external references in the spec?
      if (Object.keys(this.externalRefs).length > 0) {
        specification[inlinedRefs] = this.externalRefs
      }

      // Meta data about the specification
      const { version, specificationType, specificationVersion } =
        getOpenApiVersion(specification)

      this.version = version
      this.specificationVersion = specificationVersion
      this.specificationType = specificationType

      // Specification is not supported
      if (!version) {
        return {
          valid: false,
          errors: transformErrors(
            specification,
            ERRORS.OPENAPI_VERSION_NOT_SUPPORTED,
          ),
        }
      }

      // Get the correct OpenAPI validator
      const validateSchema = await this.getAjvValidator(version)
      const schemaResult = validateSchema(specification)

      // Check if the references are valid, as invalid references can’t be validated bu JSON schema
      if (schemaResult) {
        return checkReferences(filesystem)
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
        errors: transformErrors(specification, error.message ?? error),
      }
    }
  }

  /**
   * Ajv JSON schema validator
   */
  async getAjvValidator(version: SupportedVersion) {
    // Schema loaded already
    if (this.ajvValidators[version]) {
      return this.ajvValidators[version]
    }

    // Load Schema
    const schema = await import(`../../../schemas/v${version}/schema.json`)
    const AjvClass = jsonSchemaVersions[schema.$schema]
    const ajv = new AjvClass({
      // AJV is a bit too strict in its strict validation of OpenAPI schemas.
      // Switch strict mode off.
      strict: false,
    })

    addFormats(ajv)

    // OpenAPI 3.1 uses media-range format
    ajv.addFormat('media-range', true)

    this.ajvValidators[version] = ajv.compile(schema)

    return this.ajvValidators[version]
  }
}
