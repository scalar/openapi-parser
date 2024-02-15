export type ValidateResult = {
  valid: boolean
  version?: string
  errors?: ErrorObject[]
}

export type ErrorObject = {
  start: {
    line: number
    column: number
    offset: number
  }
  error: string
  path: string
}

export type ValidateOptions = {
  format?: 'js' | 'cli'
  indent?: number
}

export type ParseResult = {
  valid: boolean
  version: string | undefined
  // TODO: Contains references
  specification?: OpenAPI.Document
  schema?: OpenAPI.Document
  errors?: ErrorObject[]
}

export type EmptyObject = Record<string, never>

export type AjvOptions = {
  strict?: boolean | 'log'
}

export type Specification = {
  $id?: string
}

/**
 * These types are copied from 'openapi-types', but the `ReferenceObject` type is removed.
 * After an OpenAPI schema is parsed, all references are resolved and replaced with the actual object.
 */
export declare namespace OpenAPI {
  type Document<T extends {} = EmptyObject> =
    | OpenAPIV2.Document<T>
    | OpenAPIV3.Document<T>
    | OpenAPIV3_1.Document<T>
  type Operation<T extends {} = EmptyObject> =
    | OpenAPIV2.OperationObject<T>
    | OpenAPIV3.OperationObject<T>
    | OpenAPIV3_1.OperationObject<T>
  type Parameter =
    | OpenAPIV3_1.ParameterObject
    | OpenAPIV3.ParameterObject
    | OpenAPIV2.Parameter
  type Parameters =
    | OpenAPIV3_1.ParameterObject[]
    | OpenAPIV3.ParameterObject[]
    | OpenAPIV2.Parameter[]
  interface Request {
    body?: any
    headers?: object
    params?: object
    query?: object
  }
}

export declare namespace OpenAPIV3_1 {
  type Modify<T, R> = Omit<T, keyof R> & R
  type PathsWebhooksComponents<T extends {} = EmptyObject> = {
    paths: PathsObject<T>
    webhooks: Record<string, PathItemObject>
    components: ComponentsObject
  }
  export type Document<T extends {} = EmptyObject> = Modify<
    Omit<OpenAPIV3.Document<T>, 'paths' | 'components'>,
    {
      info: InfoObject
      jsonSchemaDialect?: string
      servers?: ServerObject[]
    } & (
      | (Pick<PathsWebhooksComponents<T>, 'paths'> &
          Omit<Partial<PathsWebhooksComponents<T>>, 'paths'>)
      | (Pick<PathsWebhooksComponents<T>, 'webhooks'> &
          Omit<Partial<PathsWebhooksComponents<T>>, 'webhooks'>)
      | (Pick<PathsWebhooksComponents<T>, 'components'> &
          Omit<Partial<PathsWebhooksComponents<T>>, 'components'>)
    )
  >
  export type InfoObject = Modify<
    OpenAPIV3.InfoObject,
    {
      summary?: string
      license?: LicenseObject
    }
  >
  export type ContactObject = OpenAPIV3.ContactObject
  export type LicenseObject = Modify<
    OpenAPIV3.LicenseObject,
    {
      identifier?: string
    }
  >
  export type ServerObject = Modify<
    OpenAPIV3.ServerObject,
    {
      url: string
      description?: string
      variables?: Record<string, ServerVariableObject>
    }
  >
  export type ServerVariableObject = Modify<
    OpenAPIV3.ServerVariableObject,
    {
      enum?: [string, ...string[]]
    }
  >
  export type PathsObject<
    T extends {} = EmptyObject,
    P extends {} = EmptyObject,
  > = Record<string, (PathItemObject<T> & P) | undefined>
  export type HttpMethods = OpenAPIV3.HttpMethods
  export type PathItemObject<T extends {} = EmptyObject> = Modify<
    OpenAPIV3.PathItemObject<T>,
    {
      servers?: ServerObject[]
      parameters?: ParameterObject[]
    }
  > & {
    [method in HttpMethods]?: OperationObject<T>
  }
  export type OperationObject<T extends {} = EmptyObject> = Modify<
    OpenAPIV3.OperationObject<T>,
    {
      parameters?: ParameterObject[]
      requestBody?: RequestBodyObject
      responses?: ResponsesObject
      callbacks?: Record<string, CallbackObject>
      servers?: ServerObject[]
    }
  > &
    T
  export type ExternalDocumentationObject =
    OpenAPIV3.ExternalDocumentationObject
  export type ParameterObject = OpenAPIV3.ParameterObject
  export type HeaderObject = OpenAPIV3.HeaderObject
  export type ParameterBaseObject = OpenAPIV3.ParameterBaseObject
  export type NonArraySchemaObjectType =
    | OpenAPIV3.NonArraySchemaObjectType
    | 'null'
  export type ArraySchemaObjectType = OpenAPIV3.ArraySchemaObjectType
  /**
   * There is no way to tell typescript to require items when type is either 'array' or array containing 'array' type
   * 'items' will be always visible as optional
   * Casting schema object to ArraySchemaObject or NonArraySchemaObject will work fine
   */
  export type SchemaObject =
    | ArraySchemaObject
    | NonArraySchemaObject
    | MixedSchemaObject
  export interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType
    items: SchemaObject
  }
  export interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType
  }
  interface MixedSchemaObject extends BaseSchemaObject {
    type?: (ArraySchemaObjectType | NonArraySchemaObjectType)[]
    items?: SchemaObject
  }
  export type BaseSchemaObject = Modify<
    Omit<OpenAPIV3.BaseSchemaObject, 'nullable'>,
    {
      examples?: OpenAPIV3.BaseSchemaObject['example'][]
      exclusiveMinimum?: boolean | number
      exclusiveMaximum?: boolean | number
      contentMediaType?: string
      $schema?: string
      additionalProperties?: boolean | SchemaObject
      properties?: {
        [name: string]: SchemaObject
      }
      allOf?: SchemaObject[]
      oneOf?: SchemaObject[]
      anyOf?: SchemaObject[]
      not?: SchemaObject
      discriminator?: DiscriminatorObject
      externalDocs?: ExternalDocumentationObject
      xml?: XMLObject
      const?: any
    }
  >
  export type DiscriminatorObject = OpenAPIV3.DiscriminatorObject
  export type XMLObject = OpenAPIV3.XMLObject
  export type ExampleObject = OpenAPIV3.ExampleObject
  export type MediaTypeObject = Modify<
    OpenAPIV3.MediaTypeObject,
    {
      schema?: SchemaObject
      examples?: Record<string, ExampleObject>
    }
  >
  export type EncodingObject = OpenAPIV3.EncodingObject
  export type RequestBodyObject = Modify<
    OpenAPIV3.RequestBodyObject,
    {
      content: {
        [media: string]: MediaTypeObject
      }
    }
  >
  export type ResponsesObject = Record<string, ResponseObject>
  export type ResponseObject = Modify<
    OpenAPIV3.ResponseObject,
    {
      headers?: {
        [header: string]: HeaderObject
      }
      content?: {
        [media: string]: MediaTypeObject
      }
      links?: {
        [link: string]: LinkObject
      }
    }
  >
  export type LinkObject = Modify<
    OpenAPIV3.LinkObject,
    {
      server?: ServerObject
    }
  >
  export type CallbackObject = Record<string, PathItemObject>
  export type SecurityRequirementObject = OpenAPIV3.SecurityRequirementObject
  export type ComponentsObject = Modify<
    OpenAPIV3.ComponentsObject,
    {
      schemas?: Record<string, SchemaObject>
      responses?: Record<string, ResponseObject>
      parameters?: Record<string, ParameterObject>
      examples?: Record<string, ExampleObject>
      requestBodies?: Record<string, RequestBodyObject>
      headers?: Record<string, HeaderObject>
      securitySchemes?: Record<string, SecuritySchemeObject>
      links?: Record<string, LinkObject>
      callbacks?: Record<string, CallbackObject>
      pathItems?: Record<string, PathItemObject>
    }
  >
  export type SecuritySchemeObject = OpenAPIV3.SecuritySchemeObject
  export type HttpSecurityScheme = OpenAPIV3.HttpSecurityScheme
  export type ApiKeySecurityScheme = OpenAPIV3.ApiKeySecurityScheme
  export type OAuth2SecurityScheme = OpenAPIV3.OAuth2SecurityScheme
  export type OpenIdSecurityScheme = OpenAPIV3.OpenIdSecurityScheme
  export type TagObject = OpenAPIV3.TagObject
}

export declare namespace OpenAPIV3 {
  interface Document<T extends {} = EmptyObject> {
    'openapi': string
    'info': InfoObject
    'servers'?: ServerObject[]
    'paths': PathsObject<T>
    'components'?: ComponentsObject
    'security'?: SecurityRequirementObject[]
    'tags'?: TagObject[]
    'externalDocs'?: ExternalDocumentationObject
    'x-express-openapi-additional-middleware'?: (
      | ((request: any, response: any, next: any) => Promise<void>)
      | ((request: any, response: any, next: any) => void)
    )[]
    'x-express-openapi-validation-strict'?: boolean
  }
  interface InfoObject {
    title: string
    description?: string
    termsOfService?: string
    contact?: ContactObject
    license?: LicenseObject
    version: string
  }
  interface ContactObject {
    name?: string
    url?: string
    email?: string
  }
  interface LicenseObject {
    name: string
    url?: string
  }
  interface ServerObject {
    url: string
    description?: string
    variables?: {
      [variable: string]: ServerVariableObject
    }
  }
  interface ServerVariableObject {
    enum?: string[]
    default: string
    description?: string
  }
  interface PathsObject<
    T extends {} = EmptyObject,
    P extends {} = EmptyObject,
  > {
    [pattern: string]: (PathItemObject<T> & P) | undefined
  }
  enum HttpMethods {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    DELETE = 'delete',
    OPTIONS = 'options',
    HEAD = 'head',
    PATCH = 'patch',
    TRACE = 'trace',
  }
  type PathItemObject<T extends {} = EmptyObject> = {
    $ref?: string
    summary?: string
    description?: string
    servers?: ServerObject[]
    parameters?: ParameterObject[]
  } & {
    [method in HttpMethods]?: OperationObject<T>
  }
  type OperationObject<T extends {} = EmptyObject> = {
    tags?: string[]
    summary?: string
    description?: string
    externalDocs?: ExternalDocumentationObject
    operationId?: string
    parameters?: ParameterObject[]
    requestBody?: RequestBodyObject
    responses: ResponsesObject
    callbacks?: {
      [callback: string]: CallbackObject
    }
    deprecated?: boolean
    security?: SecurityRequirementObject[]
    servers?: ServerObject[]
  } & T
  interface ExternalDocumentationObject {
    description?: string
    url: string
  }
  interface ParameterObject extends ParameterBaseObject {
    name: string
    in: string
  }
  interface HeaderObject extends ParameterBaseObject {}
  interface ParameterBaseObject {
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: string
    explode?: boolean
    allowReserved?: boolean
    schema?: SchemaObject
    example?: any
    examples?: {
      [media: string]: ExampleObject
    }
    content?: {
      [media: string]: MediaTypeObject
    }
  }
  type NonArraySchemaObjectType =
    | 'boolean'
    | 'object'
    | 'number'
    | 'string'
    | 'integer'
  type ArraySchemaObjectType = 'array'
  type SchemaObject = ArraySchemaObject | NonArraySchemaObject
  interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType
    items: SchemaObject
  }
  interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType
  }
  interface BaseSchemaObject {
    title?: string
    description?: string
    format?: string
    default?: any
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: boolean
    minimum?: number
    exclusiveMinimum?: boolean
    maxLength?: number
    minLength?: number
    pattern?: string
    additionalProperties?: boolean | SchemaObject
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    maxProperties?: number
    minProperties?: number
    required?: string[]
    enum?: any[]
    properties?: {
      [name: string]: SchemaObject
    }
    allOf?: SchemaObject[]
    oneOf?: SchemaObject[]
    anyOf?: SchemaObject[]
    not?: SchemaObject
    nullable?: boolean
    discriminator?: DiscriminatorObject
    readOnly?: boolean
    writeOnly?: boolean
    xml?: XMLObject
    externalDocs?: ExternalDocumentationObject
    example?: any
    deprecated?: boolean
  }
  interface DiscriminatorObject {
    propertyName: string
    mapping?: {
      [value: string]: string
    }
  }
  interface XMLObject {
    name?: string
    namespace?: string
    prefix?: string
    attribute?: boolean
    wrapped?: boolean
  }
  interface ExampleObject {
    summary?: string
    description?: string
    value?: any
    externalValue?: string
  }
  interface MediaTypeObject {
    schema?: SchemaObject
    example?: any
    examples?: {
      [media: string]: ExampleObject
    }
    encoding?: {
      [media: string]: EncodingObject
    }
  }
  interface EncodingObject {
    contentType?: string
    headers?: {
      [header: string]: HeaderObject
    }
    style?: string
    explode?: boolean
    allowReserved?: boolean
  }
  interface RequestBodyObject {
    description?: string
    content: {
      [media: string]: MediaTypeObject
    }
    required?: boolean
  }
  interface ResponsesObject {
    [code: string]: ResponseObject
  }
  interface ResponseObject {
    description: string
    headers?: {
      [header: string]: HeaderObject
    }
    content?: {
      [media: string]: MediaTypeObject
    }
    links?: {
      [link: string]: LinkObject
    }
  }
  interface LinkObject {
    operationRef?: string
    operationId?: string
    parameters?: {
      [parameter: string]: any
    }
    requestBody?: any
    description?: string
    server?: ServerObject
  }
  interface CallbackObject {
    [url: string]: PathItemObject
  }
  interface SecurityRequirementObject {
    [name: string]: string[]
  }
  interface ComponentsObject {
    schemas?: {
      [key: string]: SchemaObject
    }
    responses?: {
      [key: string]: ResponseObject
    }
    parameters?: {
      [key: string]: ParameterObject
    }
    examples?: {
      [key: string]: ExampleObject
    }
    requestBodies?: {
      [key: string]: RequestBodyObject
    }
    headers?: {
      [key: string]: HeaderObject
    }
    securitySchemes?: {
      [key: string]: SecuritySchemeObject
    }
    links?: {
      [key: string]: LinkObject
    }
    callbacks?: {
      [key: string]: CallbackObject
    }
  }
  type SecuritySchemeObject =
    | HttpSecurityScheme
    | ApiKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdSecurityScheme
  interface HttpSecurityScheme {
    type: 'http'
    description?: string
    scheme: string
    bearerFormat?: string
  }
  interface ApiKeySecurityScheme {
    type: 'apiKey'
    description?: string
    name: string
    in: string
  }
  interface OAuth2SecurityScheme {
    type: 'oauth2'
    description?: string
    flows: {
      implicit?: {
        authorizationUrl: string
        refreshUrl?: string
        scopes: {
          [scope: string]: string
        }
      }
      password?: {
        tokenUrl: string
        refreshUrl?: string
        scopes: {
          [scope: string]: string
        }
      }
      clientCredentials?: {
        tokenUrl: string
        refreshUrl?: string
        scopes: {
          [scope: string]: string
        }
      }
      authorizationCode?: {
        authorizationUrl: string
        tokenUrl: string
        refreshUrl?: string
        scopes: {
          [scope: string]: string
        }
      }
    }
  }
  interface OpenIdSecurityScheme {
    type: 'openIdConnect'
    description?: string
    openIdConnectUrl: string
  }
  interface TagObject {
    name: string
    description?: string
    externalDocs?: ExternalDocumentationObject
  }
}

export declare namespace OpenAPIV2 {
  interface Document<T extends {} = EmptyObject> {
    'basePath'?: string
    'consumes'?: MimeTypes
    'definitions'?: DefinitionsObject
    'externalDocs'?: ExternalDocumentationObject
    'host'?: string
    'info': InfoObject
    'parameters'?: ParametersDefinitionsObject
    'paths': PathsObject<T>
    'produces'?: MimeTypes
    'responses'?: ResponsesDefinitionsObject
    'schemes'?: string[]
    'security'?: SecurityRequirementObject[]
    'securityDefinitions'?: SecurityDefinitionsObject
    'swagger': string
    'tags'?: TagObject[]
    'x-express-openapi-additional-middleware'?: (
      | ((request: any, response: any, next: any) => Promise<void>)
      | ((request: any, response: any, next: any) => void)
    )[]
    'x-express-openapi-validation-strict'?: boolean
  }
  interface TagObject {
    name: string
    description?: string
    externalDocs?: ExternalDocumentationObject
  }
  interface SecuritySchemeObjectBase {
    type: 'basic' | 'apiKey' | 'oauth2'
    description?: string
  }
  interface SecuritySchemeBasic extends SecuritySchemeObjectBase {
    type: 'basic'
  }
  interface SecuritySchemeApiKey extends SecuritySchemeObjectBase {
    type: 'apiKey'
    name: string
    in: string
  }
  type SecuritySchemeOauth2 =
    | SecuritySchemeOauth2Implicit
    | SecuritySchemeOauth2AccessCode
    | SecuritySchemeOauth2Password
    | SecuritySchemeOauth2Application
  interface ScopesObject {
    [index: string]: any
  }
  interface SecuritySchemeOauth2Base extends SecuritySchemeObjectBase {
    type: 'oauth2'
    flow: 'implicit' | 'password' | 'application' | 'accessCode'
    scopes: ScopesObject
  }
  interface SecuritySchemeOauth2Implicit extends SecuritySchemeOauth2Base {
    flow: 'implicit'
    authorizationUrl: string
  }
  interface SecuritySchemeOauth2AccessCode extends SecuritySchemeOauth2Base {
    flow: 'accessCode'
    authorizationUrl: string
    tokenUrl: string
  }
  interface SecuritySchemeOauth2Password extends SecuritySchemeOauth2Base {
    flow: 'password'
    tokenUrl: string
  }
  interface SecuritySchemeOauth2Application extends SecuritySchemeOauth2Base {
    flow: 'application'
    tokenUrl: string
  }
  type SecuritySchemeObject =
    | SecuritySchemeBasic
    | SecuritySchemeApiKey
    | SecuritySchemeOauth2
  interface SecurityDefinitionsObject {
    [index: string]: SecuritySchemeObject
  }
  interface SecurityRequirementObject {
    [index: string]: string[]
  }
  interface ReferenceObject {
    $ref: string
  }
  type Response = ResponseObject
  interface ResponsesDefinitionsObject {
    [index: string]: ResponseObject
  }
  type Schema = SchemaObject
  interface ResponseObject {
    description: string
    schema?: Schema
    headers?: HeadersObject
    examples?: ExampleObject
  }
  interface HeadersObject {
    [index: string]: HeaderObject
  }
  interface HeaderObject extends ItemsObject {
    description?: string
  }
  interface ExampleObject {
    [index: string]: any
  }
  interface ResponseObject {
    description: string
    schema?: Schema
    headers?: HeadersObject
    examples?: ExampleObject
  }
  type OperationObject<T extends {} = EmptyObject> = {
    tags?: string[]
    summary?: string
    description?: string
    externalDocs?: ExternalDocumentationObject
    operationId?: string
    consumes?: MimeTypes
    produces?: MimeTypes
    parameters?: Parameters
    responses: ResponsesObject
    schemes?: string[]
    deprecated?: boolean
    security?: SecurityRequirementObject[]
  } & T
  interface ResponsesObject {
    [index: string]: Response | undefined
    default?: Response
  }
  type Parameters = (ReferenceObject | Parameter)[]
  type Parameter = InBodyParameterObject | GeneralParameterObject
  interface InBodyParameterObject extends ParameterObject {
    schema: Schema
  }
  interface GeneralParameterObject extends ParameterObject, ItemsObject {
    allowEmptyValue?: boolean
  }
  enum HttpMethods {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    DELETE = 'delete',
    OPTIONS = 'options',
    HEAD = 'head',
    PATCH = 'patch',
  }
  type PathItemObject<T extends {} = EmptyObject> = {
    $ref?: string
    parameters?: Parameters
  } & {
    [method in HttpMethods]?: OperationObject<T>
  }
  interface PathsObject<T extends {} = EmptyObject> {
    [index: string]: PathItemObject<T>
  }
  interface ParametersDefinitionsObject {
    [index: string]: ParameterObject
  }
  interface ParameterObject {
    name: string
    in: string
    description?: string
    required?: boolean
    [index: string]: any
  }
  type MimeTypes = string[]
  interface DefinitionsObject {
    [index: string]: SchemaObject
  }
  interface SchemaObject extends IJsonSchema {
    [index: string]: any
    discriminator?: string
    readOnly?: boolean
    xml?: XMLObject
    externalDocs?: ExternalDocumentationObject
    example?: any
    default?: any
    items?: ItemsObject
    properties?: {
      [name: string]: SchemaObject
    }
  }
  interface ExternalDocumentationObject {
    [index: string]: any
    description?: string
    url: string
  }
  interface ItemsObject {
    type: string
    format?: string
    items?: ItemsObject
    collectionFormat?: string
    default?: any
    maximum?: number
    exclusiveMaximum?: boolean
    minimum?: number
    exclusiveMinimum?: boolean
    maxLength?: number
    minLength?: number
    pattern?: string
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    enum?: any[]
    multipleOf?: number
    $ref?: string
  }
  interface XMLObject {
    [index: string]: any
    name?: string
    namespace?: string
    prefix?: string
    attribute?: boolean
    wrapped?: boolean
  }
  interface InfoObject {
    title: string
    description?: string
    termsOfService?: string
    contact?: ContactObject
    license?: LicenseObject
    version: string
  }
  interface ContactObject {
    name?: string
    url?: string
    email?: string
  }
  interface LicenseObject {
    name: string
    url?: string
  }
}

export interface IJsonSchema {
  id?: string
  $schema?: string
  title?: string
  description?: string
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: boolean
  minimum?: number
  exclusiveMinimum?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  additionalItems?: boolean | IJsonSchema
  items?: IJsonSchema | IJsonSchema[]
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  maxProperties?: number
  minProperties?: number
  required?: string[]
  additionalProperties?: boolean | IJsonSchema
  definitions?: {
    [name: string]: IJsonSchema
  }
  properties?: {
    [name: string]: IJsonSchema
  }
  patternProperties?: {
    [name: string]: IJsonSchema
  }
  dependencies?: {
    [name: string]: IJsonSchema | string[]
  }
  enum?: any[]
  type?: string | string[]
  allOf?: IJsonSchema[]
  anyOf?: IJsonSchema[]
  oneOf?: IJsonSchema[]
  not?: IJsonSchema
  $ref?: string
}
