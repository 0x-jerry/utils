import { is } from '../../is'
import { compose } from './compose'
import { AlpsContext, AlpsMiddleware, AlpsRequestConfig, Method } from './types'

export function createAlpsInstance<CustomConfig extends {}, CustomContext extends {} = {}>(
  conf: Partial<AlpsRequestConfig & CustomConfig> = {}
) {
  type InstanceRequestConfig = Partial<AlpsRequestConfig & CustomConfig>
  type RequestConfig = Partial<Omit<InstanceRequestConfig, 'url' | 'method'>>

  type InstanceContext<D> = AlpsContext<D> & Partial<CustomContext>

  const _middleware: AlpsMiddleware[] = []
  const _config: InstanceRequestConfig = conf

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
    const config: InstanceRequestConfig = {
      ..._config,
      ...conf,
    }

    const ctx: InstanceContext<ReturnData> = {
      requestConfig: config,
    } as any

    const next = () => makeRequest(url, method, ctx)

    const doRequest = compose(_middleware)

    try {
      await doRequest(ctx, next)
    } catch (error) {
      ctx.error = error
      throw ctx
    }

    return ctx
  }
}

async function makeRequest(url: string, method: string, ctx: AlpsContext) {
  const { requestConfig: conf } = ctx

  // todo, merge params and data
  const res = await fetch(url, {
    method,
    body: '',
  })

  ctx.response = res

  try {
    ctx.data = await getResponseData(res, conf)
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
