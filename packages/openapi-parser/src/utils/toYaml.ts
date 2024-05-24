import { stringify } from 'yaml'

import { AnyObject } from '../types'

export const toYaml = (value: AnyObject) => stringify(value)
