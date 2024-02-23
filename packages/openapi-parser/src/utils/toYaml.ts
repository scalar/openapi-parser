import YAML from 'yaml'

import { AnyObject } from '../types'

export const toYaml = (value: AnyObject) => YAML.stringify(value)
