import BaseValidationError from './base'

export default class DefaultValidationError extends BaseValidationError {
  constructor(...args) {
    super(...args)
    this.name = 'DefaultValidationError'
    this.options.isSkipEndLocation = true
  }

  print() {
    const { keyword, message } = this.options
    const chalk = this.getChalk()
    const output = [chalk`{red {bold ${keyword.toUpperCase()}} ${message}}\n`]

    return output.concat(
      this.getCodeFrame(chalk`👈🏽  {magentaBright ${keyword}} ${message}`),
    )
  }

  getError() {
    const { keyword, message } = this.options

    return {
      ...this.getLocation(),
      message: `${keyword} ${message}`,
      path: this.instancePath,
    }
  }
}
