type Specification = {
  [key: string]: any
}

// Working on 3/4 test cases in foobar test file but I think it needs escapeJsonPointer, unescapeJsonPointer, and resolveUri to be used
// needs to handle definitions also, currently only handles paths and components
export function resolve2(spec: Specification, replace): Specification {
  const resolvedSpec: Specification = { ...spec }

  function resolveRef(obj: Specification, refPath: string): any {
    const parts = refPath.split('/').slice(1)
    let current = obj

    for (const part of parts) {
      current = current[part]
    }

    return current
  }

  function resolveObject(obj: Specification): Specification {
    const resolvedObj: Specification = { ...obj }

    for (const key in resolvedObj) {
      if (typeof resolvedObj[key] === 'object' && resolvedObj[key] !== null) {
        if ('$ref' in resolvedObj[key]) {
          const refPath = resolvedObj[key].$ref
          const resolvedRef = resolveRef(resolvedSpec, refPath)
          delete resolvedObj[key].$ref
          resolvedObj[key] = { ...resolvedRef, ...resolvedObj[key] }
        } else {
          resolvedObj[key] = resolveObject(resolvedObj[key])
        }
      }
    }

    return resolvedObj
  }

  resolvedSpec.components = resolveObject(resolvedSpec.components)
  resolvedSpec.paths = resolveObject(resolvedSpec.paths)

  return resolvedSpec
}
