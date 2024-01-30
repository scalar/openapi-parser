import fs from 'node:fs'
import { glob } from 'glob'
import { describe, expect, it } from 'vitest'
import { parse, validate } from '../src/'

describe('files', async () => {
  const files = await glob('./tests/files/*.yaml')

  for (const file in files) {
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
  }
})
