import type { CommunicationAdapter } from '../types'

export function createWorkerAdaptor(m?: Worker) {
  const host = m || globalThis

  const adaptor: CommunicationAdapter = {
    send(data) {
      host.postMessage(data)
    },
    registerReceiveCallback(receiveCallback) {
      host.addEventListener('message', (evt) => {
        receiveCallback((evt as any).data)
      })
    },
  }

  return adaptor
}
