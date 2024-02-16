// import { codeFrameColumns } from '@babel/code-frame';
// import chalk from 'chalk';
import { getDecoratedDataPath, getMetaFromPath } from '../json'

export default class BaseValidationError {
  // eslint-disable-next-line default-param-last
  constructor(
    options = { isIdentifierLocation: false },
    { colorize, data, schema, jsonAst, jsonRaw },
  ) {
    this.options = options
    this.colorize = !!(!!colorize || colorize === undefined)
    this.data = data
    this.schema = schema
    this.jsonAst = jsonAst
    this.jsonRaw = jsonRaw
  }

  getChalk() {
    return this.colorize ? chalk : new chalk.Instance({ level: 0 })
  }

  getLocation(dataPath = this.instancePath) {
    const { isIdentifierLocation, isSkipEndLocation } = this.options

    const { loc } = getMetaFromPath(
      this.jsonAst,
      dataPath,
      isIdentifierLocation,
    )

    return {
      start: loc.start,
      end: isSkipEndLocation ? undefined : loc.end,
    }
  }

  getDecoratedPath(dataPath = this.instancePath) {
    return getDecoratedDataPath(this.jsonAst, dataPath)
  }

  getCodeFrame(message, dataPath = this.instancePath) {
    return codeFrameColumns(this.jsonRaw, this.getLocation(dataPath), {
      /**
       * `@babel/highlight`, by way of `@babel/code-frame`, highlights out entire block of raw JSON
       * instead of just our `location` block -- so if you have a block of raw JSON that's upwards
       * of 2mb+ and have a lot of errors to generate code frames for then we're re-highlighting
       * the same huge chunk of code over and over and over and over again, all just so
       * `@babel/code-frame` will eventually extract a small <10 line chunk out of it to return to
       * us.
       *
       * Disabling `highlightCode` here will only disable highlighting the code we're showing users;
       * if `options.colorize` is supplied to this library then the error message we're adding will
       * still be highlighted.
       */
      highlightCode: false,
      message,
    })
  }

  /**
   * @return {string}
   */
  get instancePath() {
    return typeof this.options.instancePath !== 'undefined'
      ? this.options.instancePath
      : this.options.dataPath
  }

  print() {
    throw new Error(
      `Implement the 'print' method inside ${this.constructor.name}!`,
    )
  }

  getError() {
    throw new Error(
      `Implement the 'getError' method inside ${this.constructor.name}!`,
    )
  }
}
