# Scalar OpenAPI Parser

[![CI](https://github.com/scalar/openapi-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/scalar/openapi-parser/actions/workflows/ci.yml)
[![Release](https://github.com/scalar/openapi-parser/actions/workflows/release.yml/badge.svg)](https://github.com/scalar/openapi-parser/actions/workflows/release.yml)
[![Contributors](https://img.shields.io/github/contributors/scalar/openapi-parser)](https://github.com/scalar/openapi-parser/graphs/contributors)
[![GitHub License](https://img.shields.io/github/license/scalar/openapi-parser)](https://github.com/scalar/openapi-parser/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1135330207960678410?style=flat&color=5865F2)](https://discord.gg/8HeZcRGPFS)

Modern OpenAPI parser written in TypeScript with support for OpenAPI 3.1, OpenAPI 3.0 and Swagger 2.0.

## Goals

- [x] Written in TypeScript
- [x] Runs in Node.js and in the browser (without any polyfills or configuration)
- [x] Tested with thousands of real world examples
- [x] Amazing error output
- [ ] Support for OpenAPI 4.0 👀

## Installation

```
npm add @scalar/openapi-parser
```

## Usage

### Parse

```ts
import { parse } from '@scalar/openapi-parser'

const file = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {}
}`

const result = await parse(file)
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

## Community

We are API nerds. You too? Let’s chat on Discord: <https://discord.gg/8HeZcRGPFS>

## Contributors

<!-- readme: collaborators,contributors -start -->
<!-- readme: collaborators,contributors -end -->

Contributions are welcome! Read [`CONTRIBUTING`](https://github.com/scalar/openapi-parser/blob/main/CONTRIBUTING).

## License

The source code in this repository is licensed under [MIT](https://github.com/scalar/openapi-parser/blob/main/LICENSE).
