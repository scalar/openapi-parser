# Scalar OpenAPI Parser

[![CI](https://github.com/scalar/openapi-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/scalar/openapi-parser/actions/workflows/ci.yml)
[![Release](https://github.com/scalar/openapi-parser/actions/workflows/release.yml/badge.svg)](https://github.com/scalar/openapi-parser/actions/workflows/release.yml)
[![Contributors](https://img.shields.io/github/contributors/scalar/openapi-parser)](https://github.com/scalar/openapi-parser/graphs/contributors)
[![GitHub License](https://img.shields.io/github/license/scalar/openapi-parser)](https://github.com/scalar/openapi-parser/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1135330207960678410?style=flat&color=5865F2)](https://discord.gg/8HeZcRGPFS)

Modern OpenAPI parser written in TypeScript, with support for Swagger 2.0, OpenAPI 3.0 and OpenAPI 3.1

## Installation

```
npm add @scalar/openapi-parser
```

## Usage

### Parse

```ts
import { resolve } from '@scalar/openapi-parser'

const file = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {}
}`

const result = await resolve(file)
```

### Validate

```ts
import { validate } from '@scalar/openapi-parser'

const file = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {}
}`

const result = await validate(file)

console.log(result.valid)

if (!result.valid) {
  console.log(result.errors)
}
```

### Version

```ts
import { resolve } from '@scalar/openapi-parser'

const file = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {}
}`

const result = await resolve(file)

console.log(result.version)
```
