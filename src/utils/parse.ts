import { Validator } from '@seriousme/openapi-schema-validator'
import {OpenAPI } from 'openapi-types'

export async function parse(value: string): Promise<OpenAPI.Document> {
    const validator = new Validator()
    const result = await validator.validate(value)

    if (result.valid) {
    const schema = validator.resolveRefs() as OpenAPI.Document
    return schema
} else {
    throw new Error(`Invalid schema: ${result.errors}`)
}
}