import fs from 'node:fs'
import GithubSlugger from 'github-slugger'

const slugger = new GithubSlugger()

/**
 * Downloads a list of over 2000 real-world Swagger APIs from apis.guru,
 * and applies some custom filtering logic to it.
 */

console.log('Fetch list of APIs from apis.guru…')
const apis = await fetchApiList()

console.log(`✓ Received a list of ${apis.length} APIs from apis.guru.`)

console.log()
console.log('Start downloading …')

apis.forEach((api) => {
  console.log(`Fetch ${api.swaggerYamlUrl}…`)

  fetch(api.swaggerYamlUrl).then(async (response) => {
    const content = await response.text()

    const filename = `${slugger.slug(api.name)}.yaml`

    fs.writeFile(`./tests/files/${filename}`, content, (err) => {
      if (err) {
        throw err
      }
    })
  })
})

export async function fetchApiList() {
  const response = await fetch('https://api.apis.guru/v2/list.json')

  if (!response.ok) {
    throw new Error('Unable to downlaod real-world APIs from apis.guru')
  }

  const apiMap = await response.json()

  deleteProblematicAPIs(apiMap)
  const apiArray = flatten(apiMap)

  return apiArray
}

/**
 * Removes certain APIs that are known to cause problems
 */
function deleteProblematicAPIs(apis) {
  // TODO:
  // GitHub's CORS policy blocks this request
  delete apis['googleapis.com:adsense']

  // These APIs cause infinite loops in json-schema-ref-parser.  Still investigating.
  // https://github.com/APIDevTools/json-schema-ref-parser/issues/56
  delete apis['bungie.net']
  delete apis['stripe.com']
  delete apis['docusign.net']
  delete apis['kubernetes.io']
  delete apis['microsoft.com:graph']

  // hangs
  delete apis['presalytics.io:ooxml']

  // base security declaration in path/get operation (error message below)
  // "type array but found type null at #/paths//vault/callback/get/security"
  delete apis['apideck.com:vault']
}

/**
 * Flattens the API object structure into an array containing all versions of all APIs.
 */
function flatten(apimap) {
  const apiArray: {
    name: string
    version: string
    swaggerYamlUrl: string
  }[] = []

  for (const [name, api] of Object.entries(apimap)) {
    const latestVersion = api.versions[api.preferred]

    apiArray.push({
      name,
      version: api.preferred,
      swaggerYamlUrl: latestVersion.swaggerYamlUrl,
    })
  }

  return apiArray
}
