import { describe, it, expect } from 'vitest'
import { glob } from 'glob'
import { validate } from '../src/'
import fs from 'node:fs'

describe(
    'files'
, async () => {
    const files = await glob('./tests/files/*.yaml')

    files.forEach(file => {
        it(`validate ${file}`, () => {
            const content = fs.readFileSync(file, 'utf-8')
            const result = validate(content)

            expect(result.valid).toBe(true)
        })
    })
})