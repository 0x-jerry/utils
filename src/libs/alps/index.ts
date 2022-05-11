//

import { is } from '../../is'
import { compose } from './compose'
import { AlpsRequestConfig, Method, ResponseType } from './types'

export interface AlpsMiddleware {
  (ctx: AlpsContext, next: () => {}): Promise<void>
}

interface AlpsContext<T = any> {
  requestConfig: AlpsRequestConfig

  response?: Response

  /**
   * Response data
   */
  data?: T

  error?: any
}

export class Alps {
  _middleware: AlpsMiddleware[] = []

  config: AlpsRequestConfig = {}

  use(middleware: AlpsMiddleware) {
    this._middleware.push(middleware)
  }

  async request<ReturnData = any>(
    url: string,
    method: Method,
    conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}
  ): Promise<AlpsContext<ReturnData>> {
    // Merge config
    const config: AlpsRequestConfig = {
      ...alps.config,
      ...this.config,
      ...conf,
    }

    const ctx: AlpsContext<ReturnData> = {
      requestConfig: structuredClone(config),
    }

    const next = () => createRequest<ReturnData>(url, method, ctx)

    const doRequest = compose(this._middleware)

    try {
      await doRequest(ctx, next)
    } catch (error) {
      ctx.error = error
      throw ctx
    }

    return ctx
  }

  get<D>(url: string, params: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.params = Object.assign({}, params, conf.params)
    return this.request<D>(url, 'get', conf)
  }

  post<D>(url: string, data: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.data = Object.assign({}, data, conf.data)

    return this.request<D>(url, 'post', conf)
  }

  put<D>(url: string, data: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.data = Object.assign({}, data, conf.data)

    return this.request<D>(url, 'put', conf)
  }

  patch<D>(url: string, data: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.data = Object.assign({}, data, conf.data)

    return this.request<D>(url, 'patch', conf)
  }

  delete<D>(url: string, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    return this.request<D>(url, 'delete', conf)
  }

  head<D>(url: string, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    return this.request<D>(url, 'head', conf)
  }

  options<D>(url: string, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    return this.request<D>(url, 'options', conf)
  }

  postForm<D>(url: string, data: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.data = transformToFormData(data)

    return this.request<D>(url, 'post', conf)
  }

  putForm<D>(url: string, data: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.data = transformToFormData(data)

    return this.request<D>(url, 'put', conf)
  }

  patchForm<D>(url: string, data: any = {}, conf: Omit<AlpsRequestConfig, 'url' | 'method'> = {}) {
    conf.data = transformToFormData(data)

    return this.request<D>(url, 'patch', conf)
  }
}

export const alps = new Alps()

async function createRequest<ReturnData = any>(
  url: string,
  method: string,
  ctx: AlpsContext<ReturnData>
) {
  const res = await fetch(url, {
    method,
    body: '',
  })

  ctx.response = res

  try {
    ctx.data = await getResponseData(res, ctx.requestConfig.responseType)
  } catch (error) {
    ctx.data = res.body as any
    throw new Error('Parse response data failed')
  }
}

function transformToFormData(data: any) {
  const isForm = data instanceof FormData

  const formData = isForm ? data : new FormData()

  if (!isForm) {
    Object.entries(data)
      .filter((n) => !is.nullish(n[1]))
      .forEach(([key, val]) => {
        formData.set(key, val instanceof Blob ? val : String(val))
      })
  }

  return formData
}

async function getResponseData(response: Response, type?: ResponseType) {
  switch (type) {
    case 'json':
      return response.json()

    case 'text':
    case 'document':
      return response.text()

    case 'arraybuffer':
      return response.arrayBuffer()

    case 'stream':
      return response.body

    case 'blob':
      return response.blob()

    default:
      return response.body
  }
}
