# Scalar OpenAPI Parser

Node.js package to parse OpenAPI files

## Goals

* TypeScript FTW
* No Node.js polyfills required
* Well tested
* Small bundlesize
* Support for OpenAPI 4.0 👀

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
import { validate } from '@scalar/openapi-validater'

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
```