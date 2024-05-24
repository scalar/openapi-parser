import { parse } from 'yaml'

export function isYaml(value: string) {
  // Line breaks
  if (!value.includes('\n')) {
    return false
  }

  try {
    parse(value)
    return true
  } catch (error) {
    console.log('ADSAS', error)
    return false
  }
}
