import YAML from 'yaml'

export const toYaml = (value: Record<string, any>) => YAML.stringify(value)
