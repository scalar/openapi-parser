import BaseValidationError from './base';

export default class PatternValidationError extends BaseValidationError {
  constructor(...args) {
    super(...args);
    this.name = 'PatternValidationError';
    this.options.isIdentifierLocation = true;
  }

  print() {
    const { message, params, propertyName } = this.options;
    const chalk = this.getChalk();
    const output = [chalk`{red {bold PROPERTY} ${message}}\n`];

    return output.concat(
      this.getCodeFrame(
        chalk`😲  must match pattern {magentaBright ${params.pattern}}`,
        `${this.instancePath}/${propertyName}`
      )
    );
  }

  getError() {
    const { params, propertyName } = this.options;

    return {
      // ...this.getLocation(`${this.instancePath}/${params.propertyName}`),
      ...this.getLocation(),
      error: `${this.getDecoratedPath()} Property "${propertyName}" must match pattern ${params.pattern}`,
      path: this.instancePath,
    };
  }
}
