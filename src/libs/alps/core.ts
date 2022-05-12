import { createPromiseInstance } from '../../core'
import { is } from '../../is'
import { compose } from './compose'
import { AlpsContext, AlpsMiddleware, AlpsRequestConfig, Method } from './types'
import { isAbsolutePath, parseURL } from './utils'

type AlpsInstanceRequestConfig = Omit<AlpsRequestConfig, 'url' | 'method'>

export function createAlpsInstance<CustomConfig extends {}, CustomContext extends {} = {}>(
  conf: Partial<AlpsInstanceRequestConfig & CustomConfig> = {}
) {
  type RequestConfig = Partial<AlpsInstanceRequestConfig & CustomConfig>

  type InstanceContext<D> = AlpsContext<D> & Partial<CustomContext>

  const _middleware: AlpsMiddleware[] = []
  const _config: RequestConfig = conf

  return {
    config: _config,
    use(middleware: AlpsMiddleware) {
      _middleware.push(middleware)
    },
    request,
    get<D>(url: string, params: any = {}, conf: RequestConfig = {}) {
      conf.params = Object.assign({}, params, conf.params)
      return request<D>(url, 'get', conf)
    },
    post<D>(url: string, data: any = {}, conf: RequestConfig = {}) {
      conf.data = Object.assign({}, data, conf.data)

      return request<D>(url, 'post', conf)
    },
    put<D>(url: string, data: any = {}, conf: RequestConfig = {}) {
      conf.data = Object.assign({}, data, conf.data)

      return request<D>(url, 'put', conf)
    },
    patch<D>(url: string, data: any = {}, conf: RequestConfig = {}) {
      conf.data = Object.assign({}, data, conf.data)

      return request<D>(url, 'patch', conf)
    },
    delete<D>(url: string, conf: RequestConfig = {}) {
      return request<D>(url, 'delete', conf)
    },
    head<D>(url: string, conf: RequestConfig = {}) {
      return request<D>(url, 'head', conf)
    },
    options<D>(url: string, conf: RequestConfig = {}) {
      return request<D>(url, 'options', conf)
    },
    postForm<D>(url: string, data: any = {}, conf: RequestConfig = {}) {
      conf.data = transformToFormData(data)

      return request<D>(url, 'post', conf)
    },
    putForm<D>(url: string, data: any = {}, conf: RequestConfig = {}) {
      conf.data = transformToFormData(data)

      return request<D>(url, 'put', conf)
    },
    patchForm<D>(url: string, data: any = {}, conf: RequestConfig = {}) {
      conf.data = transformToFormData(data)

      return request<D>(url, 'patch', conf)
    },
  }

  async function request<ReturnData = any>(
    url: string,
    method: Method,
    conf: RequestConfig = {}
  ): Promise<InstanceContext<ReturnData>> {
    // Merge config
    const config: AlpsRequestConfig = {
      ..._config,
      ...conf,
      url,
      method,
    }

    const ctx: InstanceContext<ReturnData> = {
      requestConfig: config,
    } as any

    try {
      const doRequest = compose(_middleware)

      const next = () => makeRequest(ctx)

      await doRequest(ctx, next)
    } catch (error) {
      ctx.error = error
      throw ctx
    }

    return ctx
  }
}

async function makeRequest(ctx: AlpsContext) {
  const { requestConfig: conf } = ctx

  const p = createPromiseInstance<void>()

  let timeoutHandle = null as any

  if (conf.timeout) {
    timeoutHandle = setTimeout(
      () => p.reject(conf.timeoutErrorMessage || 'Request timeout'),
      conf.timeout
    )
  }

  const url = composeUrl(conf.url!, conf)

  fetch(url, {
    method: conf.method!,
    body: conf.data,
  })
    .finally(() => clearTimeout(timeoutHandle))
    .then(async (res) => {
      ctx.response = res

      try {
        ctx.data = await getResponseData(res, conf)
      } catch (error) {
        ctx.data = res.body as any
        throw new Error('Parse response data failed')
      }
    })
    .then(p.resolve)
    .catch(p.reject)

  return p.instance
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

async function getResponseData(response: Response, conf: AlpsRequestConfig) {
  switch (conf.responseType) {
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

export function composeUrl(url: string, conf: AlpsRequestConfig): string {
  const u = parseURL(url)

  if (u.origin || isAbsolutePath(url)) {
    return mergeParams(url, conf.params)
  }

  const baseU = parseURL(conf.baseURL || '')

  const mergedUrl =
    baseU.origin +
    (baseU.path.replace(/\/$/, '') + (u.path ? '/' : '') + u.path) +
    u.search +
    u.hash

  return mergeParams(mergedUrl, conf.params)
}

function mergeParams(url: string, params: Record<string, string | boolean | number> = {}) {
  const fallbackOrigin = 'http://alps'

  const u = new URL(url, fallbackOrigin)

  for (const key in params) {
    const value = params[key]

    if (!is.nullish(value)) {
      u.searchParams.set(key, String(value))
    }
  }

  const result = u.toString()

  return result.startsWith(fallbackOrigin) ? result.slice(fallbackOrigin.length) : result
}
