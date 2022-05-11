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

export type AlpsHeaders = Record<string, string>

export interface AlpsRequestConfig<D = any, P = D> {
  url?: string
  method?: Method | string
  baseURL?: string
  headers?: AlpsHeaders
  params?: P
  data?: D
  timeout?: number
  timeoutErrorMessage?: string
  withCredentials?: boolean
  responseType?: ResponseType
  xsrfCookieName?: string
  xsrfHeaderName?: string
  onUploadProgress?: (progressEvent: any) => void
  onDownloadProgress?: (progressEvent: any) => void
  maxContentLength?: number
  validateStatus?: ((status: number) => boolean) | null
  maxBodyLength?: number
  maxRedirects?: number
  beforeRedirect?: (
    options: Record<string, any>,
    responseDetails: { headers: Record<string, string> }
  ) => void
  signal?: AbortSignal
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
