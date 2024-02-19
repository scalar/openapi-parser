import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../../src'
import apiWithExamples from './api-with-examples.yaml'

// TODO: The example is in the `fail` folder, but I don’t know why it’s supposed to fail.
// I think the YAML is just wrong ("YAMLException: deficient indentation"), but we can’t test this with an import.
describe.todo('OAI', () => {
  it('apiWithExamples', async () => {
    const result = await resolve(apiWithExamples)

    expect(result.errors?.[0]?.error).toBe(`something went wrong`)
    expect(result.valid).toBe(false)
  })
})
