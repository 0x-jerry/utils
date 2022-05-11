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

export type ResponseEncodingLowerCase =
  | 'ascii'
  | 'ansi'
  | 'binary'
  | 'base64'
  | 'base64url'
  | 'hex'
  | 'latin1'
  | 'ucs-2'
  | 'ucs2'
  | 'utf-8'
  | 'utf8'
  | 'utf16le'

export type ResponseEncoding = `${Uppercase<ResponseEncodingLowerCase>}` | ResponseEncodingLowerCase

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
  responseEncoding?: ResponseEncoding | string
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
