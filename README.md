# Scalar OpenAPI Parser

[![CI](https://github.com/scalar/openapi-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/scalar/openapi-parser/actions/workflows/ci.yml)
[![Release](https://github.com/scalar/openapi-parser/actions/workflows/release.yml/badge.svg)](https://github.com/scalar/openapi-parser/actions/workflows/release.yml)
[![Contributors](https://img.shields.io/github/contributors/scalar/openapi-parser)](https://github.com/scalar/openapi-parser/graphs/contributors)
[![GitHub License](https://img.shields.io/github/license/scalar/openapi-parser)](https://github.com/scalar/openapi-parser/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1135330207960678410?style=flat&color=5865F2)](https://discord.gg/scalar)

Modern OpenAPI parser written in TypeScript with support for OpenAPI 3.1, OpenAPI 3.0 and Swagger 2.0.

## Goals

- [x] Written in TypeScript
- [x] Runs in Node.js and in the browser (without any polyfills or configuration)
- [x] Tested with hundreds of real world examples
- [ ] Amazing error output
- [ ] Support for OpenAPI 4.0 👀

## Limitations

References are hard and the following features aren’t implemented yet (but will be in the future):

- URLs

## Installation

```
npm add @scalar/openapi-parser
```

## Usage

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

const { valid, errors } = await validate(file)

console.log(valid)

if (!valid) {
  console.log(errors)
}
```

### Resolve references

```ts
import { dereference } from '@scalar/openapi-parser'

const specification = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {}
}`

const { schema, errors } = await dereference(specification)
```

### Modify an OpenAPI specification

```ts
import { filter } from '@scalar/openapi-parser'

const specification = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Hello World",
    "version": "1.0.0"
  },
  "paths": {}
}`

const { specification } = filter(specification, (schema) => !schema?.['x-internal'])
```

### Upgrade your OpenAPI specification

There’s an `upgrade` command to upgrade all your OpenAPI specifications to the latest OpenAPI version.

> ⚠️ Currently, only an upgrade from OpenAPI 3.0 to OpenAPI 3.1 is supported. Swagger 2.0 is not supported (yet).

```ts
import { upgrade } from '@scalar/openapi-parser'

const { specification } = upgrade({
  openapi: '3.0.0',
  info: {
    title: 'Hello World',
    version: '1.0.0',
  },
  paths: {},
})

console.log(specification.openapi)
// Output: 3.1.0
```

### Pipeline syntax

```ts
import { openapi } from '@scalar/openapi-parser'

const specification = …

// New pipeline …
const result = openapi()
  // loads the specification …
  .load(specification)
  // upgrades to OpenAPI 3.1 …
  .upgrade()
  // removes all internal operations …
  .filter((schema) => !schema?.['x-internal'])
  // done!
  .get()
```

### Then/Catch syntax

If you’re more the then/catch type of guy, that’s fine:

```ts
import { validate } from '@scalar/openapi-parser'

const specification = …

validate(specification, {
  throwOnError: true,
})
.then(result => {
  // Success
})
.catch(error => {
  // Failure
})
```

### Advanced: URL and file references

You can reference other files, too. To do that, the parser needs to know what files are available.

```ts
import { dereference, load } from '@scalar/openapi-parser'
import { fetchUrls } from '@scalar/openapi-parser/plugins/fetch-urls'
import { readFiles } from '@scalar/openapi-parser/plugins/read-files'

// Load a file and all referenced files
const { filesystem } = await load('./openapi.yaml', {
  plugins: [
    readFiles(),
    fetchUrls({
      limit: 5,
    }),
  ],
})

// Instead of just passing a single specification, pass the whole “filesystem”
const result = await dereference(filesystem)
```

As you see, `load()` supports plugins. You can write your own plugin, if you’d like to fetch API defintions from another data source, for example your database. Look at the source code of the `readFiles` to learn how this could look like.

#### Directly load URLs

Once the `fetchUrls` plugin is loaded, you can also just pass an URL:

```ts
import { dereference, load } from '@scalar/openapi-parser'
import { fetchUrls } from '@scalar/openapi-parser/plugins/fetch-urls'

// Load a file and all referenced files
const { filesystem } = await load(
  'https://cdn.jsdelivr.net/npm/@scalar/galaxy/dist/latest.yaml',
  {
    plugins: [fetchUrls()],
  },
)
```

#### Intercept HTTP requests

If you’re using the package in a browser environment, you may run into CORS issues when fetching from URLs. You can intercept the requests, for example to use a proxy, though:

```ts
import { dereference, load } from '@scalar/openapi-parser'
import { fetchUrls } from '@scalar/openapi-parser/plugins/fetch-urls'

// Load a file and all referenced files
const { filesystem } = await load(
  'https://cdn.jsdelivr.net/npm/@scalar/galaxy/dist/latest.yaml',
  {
    plugins: [
      fetchUrls({
        fetch: (url) => fetch(url.replace('BANANA.net', 'jsdelivr.net')),
      }).get('https://cdn.BANANA.net/npm/@scalar/galaxy/dist/latest.yaml'),
    ],
  },
)
```

## Community

We are API nerds. You too? Let’s chat on Discord: <https://discord.gg/scalar>

## Thank you!

Thanks a ton for all the help and inspiration:

- [@philsturgeon](https://github.com/philsturgeon) to make sure we build something we won’t hate.
- We took a lot of inspiration from [@seriousme](https://github.com/seriousme) and his package [openapi-schema-validator](https://github.com/seriousme/openapi-schema-validator) early-on.
- You could consider this package the modern successor of [@apidevtools/swagger-parser](https://github.com/APIDevTools/swagger-parser), we even test against it to make sure we’re getting the same results (where intended).
- We stole a lot of example specification from [@mermade](https://github.com/mermade) to test against.

## Contributors

<!-- readme: collaborators,contributors -start -->
<table>
	<tbody>
		<tr>
            <td align="center">
                <a href="https://github.com/hanspagel">
                    <img src="https://avatars.githubusercontent.com/u/1577992?v=4" width="100;" alt="hanspagel"/>
                    <br />
                    <sub><b>hanspagel</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/marclave">
                    <img src="https://avatars.githubusercontent.com/u/6176314?v=4" width="100;" alt="marclave"/>
                    <br />
                    <sub><b>marclave</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/amritk">
                    <img src="https://avatars.githubusercontent.com/u/2039539?v=4" width="100;" alt="amritk"/>
                    <br />
                    <sub><b>amritk</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/Drew-Kimberly">
                    <img src="https://avatars.githubusercontent.com/u/11247544?v=4" width="100;" alt="Drew-Kimberly"/>
                    <br />
                    <sub><b>Drew-Kimberly</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/x-delfino">
                    <img src="https://avatars.githubusercontent.com/u/67192579?v=4" width="100;" alt="x-delfino"/>
                    <br />
                    <sub><b>x-delfino</b></sub>
                </a>
            </td>
		</tr>
	<tbody>
</table>
<!-- readme: collaborators,contributors -end -->

Contributions are welcome! Read [`CONTRIBUTING`](https://github.com/scalar/openapi-parser/blob/main/CONTRIBUTING).

## License

The source code in this repository is licensed under [MIT](https://github.com/scalar/openapi-parser/blob/main/LICENSE).
