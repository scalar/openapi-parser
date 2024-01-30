import { describe, it, expect } from 'vitest'
import { glob } from 'glob'
import { validate, parse } from '../src/'
import fs from 'node:fs'

describe(
    'files'
, async () => {
    const files = await glob('./tests/files/*.yaml')

    files.forEach(file => {
        const filename = file.split('/').pop()

        it(`[${filename}] validate`, async () => {
            const content = fs.readFileSync(file, 'utf-8')
            const result = await validate(content)

            expect(result.valid).toBe(true)
        })

        it(`[${filename}] parse`, async () => {
            const content = fs.readFileSync(file, 'utf-8')
            const result = await parse(content)

            expect(result.info.title).not.toBe(undefined)
        })
    })
})