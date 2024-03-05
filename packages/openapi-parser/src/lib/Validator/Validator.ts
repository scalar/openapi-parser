import addFormats from 'ajv-formats'

import {
  ERRORS,
  type SupportedVersion,
  inlinedRefs,
  jsonSchemaVersions,
  supportedVersions,
} from '../../configuration'
import type { AnyObject, Filesystem, ValidateResult } from '../../types'
import { details as getOpenApiVersion } from '../../utils'
import { resolveRefs } from '../resolve'
import { checkReferences } from '../resolve/checkReferences'
import { transformErrors } from './transformErrors'

export class Validator {
  public version: string

  public static supportedVersions = supportedVersions

  // Object with function *or* object { errors: string }
  protected ajvValidators: Record<
    string,
    ((specification: AnyObject) => boolean) & {
      errors: string
    }
  > = {}

  protected externalRefs: Record<string, AnyObject> = {}

  protected errors: string

  protected specificationVersion: string

  protected specificationType: string

  public specification: AnyObject

  resolveReferences(filesystem?: Filesystem) {
    return resolveRefs(
      filesystem.find((file) => file.isEntrypoint === true).specification,
    )
  }

  /**
   * Checks whether a specification is valid and all references can be resolved.
   */
  async validate(filesystem: Filesystem): Promise<ValidateResult> {
    const entrypoint = filesystem.find((file) => file.isEntrypoint)
    const specification = entrypoint?.specification

    // TODO: How does this work with a filesystem?
    this.specification = specification

    try {
      // AnyObject is empty or invalid
      if (specification === undefined || specification === null) {
        return {
          valid: false,
          errors: transformErrors(entrypoint, ERRORS.EMPTY_OR_INVALID),
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

      // Check if the references are valid
      if (schemaResult) {
        return checkReferences(entrypoint.specification)
      }

      // Error handling
      if (validateSchema.errors) {
        if (validateSchema.errors.length > 0) {
          return {
            valid: false,
            errors: transformErrors(entrypoint, validateSchema.errors),
          }
        }
      }

      // Whoops … no errors? Actually, that should never happen.
      return {
        valid: false,
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
  async getAjvValidator(version: SupportedVersion) {
    // Schema loaded already
    if (this.ajvValidators[version]) {
      return this.ajvValidators[version]
    }

    // Load OpenAPI Schema
    const schema = await import(`../../../schemas/v${version}/schema.json`)

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
