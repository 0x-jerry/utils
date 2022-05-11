export type MethodLowerCase =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'purge'
  | 'link'
  | 'unlink'

export type Method = `${Uppercase<MethodLowerCase>}` | MethodLowerCase

export type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'

type OmitRequestInitProperties = 'body' | 'method'

export interface AlpsRequestConfig<D = any, P = D>
  extends Omit<RequestInit, OmitRequestInitProperties> {
  url?: string
  baseURL?: string

  method?: Method | string

  params?: P
  data?: D

  timeout?: number
  timeoutErrorMessage?: string

  responseType?: ResponseType

  /**
   * @todo
   */
  onUploadProgress?: (progressEvent: any) => void
  /**
   * @todo
   */
  onDownloadProgress?: (progressEvent: any) => void
}

export interface AlpsMiddleware {
  (ctx: AlpsContext, next: () => {}): Promise<void>
}

export interface AlpsContext<T = any> {
  requestConfig: AlpsRequestConfig

  response?: Response

  /**
   * Response data
   */
  data?: T

  error?: any
}
