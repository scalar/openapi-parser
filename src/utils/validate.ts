import { Validator } from '@seriousme/openapi-schema-validator'


export async function validate(value: string): Promise<{
    valid: boolean,
}> {
    const validator = new Validator()
    const result = await validator.validate(value)

  return result
}