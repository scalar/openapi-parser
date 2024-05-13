import addFormats from 'ajv-formats'

import {
  ERRORS,
  OpenApiSpecifications,
  type OpenApiVersion,
  OpenApiVersions,
  jsonSchemaVersions,
} from '../../configuration'
import type { AnyObject, Filesystem, ValidateResult } from '../../types'
import { details as getOpenApiVersion } from '../../utils'
import { resolveReferences } from '../../utils/resolveReferences'
import { transformErrors } from '../../utils/transformErrors'

export class Validator {
  public version: string

  public static supportedVersions = OpenApiVersions

  // Object with function *or* object { errors: string }
  protected ajvValidators: Record<
    string,
    ((specification: AnyObject) => boolean) & {
      errors: string
    }
  > = {}

  protected errors: string

  protected specificationVersion: string

  protected specificationType: string

  public specification: AnyObject

  /**
   * Checks whether a specification is valid and all references can be resolved.
   */
  async validate(filesystem: Filesystem): Promise<ValidateResult> {
    const entrypoint = filesystem.find((file) => file.isEntrypoint)
    const specification = entrypoint?.specification

    // TODO: How does this work with a filesystem?
    this.specification = specification

    // TODO: defaulting info.version to keep parser compatible with the previous one
    // we should bubble this error up and not throw on it
    if (this.specification?.info && !this.specification.info.version) {
      this.specification.info.version = '0.0.1'
    }

    try {
      // AnyObject is empty or invalid
      if (specification === undefined || specification === null) {
        return {
          valid: false,
          errors: transformErrors(entrypoint, ERRORS.EMPTY_OR_INVALID),
        }
      }

      // Meta data about the specification
      const { version, specificationType, specificationVersion } =
        getOpenApiVersion(specification)

      this.version = version
      this.specificationVersion = specificationVersion
      this.specificationType = specificationType

      // AnyObject is not supported
      if (!version) {
        return {
          valid: false,
          errors: transformErrors(
            entrypoint,
            ERRORS.OPENAPI_VERSION_NOT_SUPPORTED,
          ),
        }
      }

      // Get the correct OpenAPI validator
      const validateSchema = await this.getAjvValidator(version)
      const schemaResult = validateSchema(specification)

      // Error handling
      if (validateSchema.errors) {
        if (validateSchema.errors.length > 0) {
          return {
            valid: false,
            errors: transformErrors(entrypoint, validateSchema.errors),
          }
        }
      }

      // Check if the references are valid
      const resolvedReferences = resolveReferences(filesystem)

      return {
        valid: schemaResult && resolvedReferences.valid,
        errors: [...(schemaResult.errors ?? []), ...resolvedReferences.errors],
        schema: resolvedReferences.schema,
      }
    } catch (error) {
      // Something went horribly wrong!
      return {
        valid: false,
        errors: transformErrors(entrypoint, error.message ?? error),
      }
    }
  }

  /**
   * Ajv JSON schema validator
   */
  async getAjvValidator(version: OpenApiVersion) {
    // Schema loaded already
    if (this.ajvValidators[version]) {
      return this.ajvValidators[version]
    }

    // Load OpenAPI Schema
    const schema = OpenApiSpecifications[version]

    // Load JSON Schema
    const AjvClass = jsonSchemaVersions[schema.$schema]

    // Get the correct Ajv validator
    const ajv = new AjvClass({
      // Ajv is a bit too strict in its strict validation of OpenAPI schemas.
      // Switch strict mode off.
      strict: false,
    })

    // Register formats
    // https://ajv.js.org/packages/ajv-formats.html#formats
    addFormats(ajv)

    // OpenAPI 3.1 uses media-range format
    if (version === '3.1') {
      ajv.addFormat('media-range', true)
    }

    return (this.ajvValidators[version] = ajv.compile(schema))
  }
}
