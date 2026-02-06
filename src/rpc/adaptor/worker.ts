import type { CommunicationAdapter } from '../types'

export function createWorkerAdaptor(m?: Worker) {
  const host = m || globalThis

  const adaptor: CommunicationAdapter = {
    send(data) {
      host.postMessage(data)
    },
    receive(receiver) {
      host.addEventListener('message', (evt) => {
        receiver((evt as any).data)
      })
    },
  }

  return adaptor
}
