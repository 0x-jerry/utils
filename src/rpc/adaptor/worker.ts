import type { Fn } from '../../types/index.js'
import type { CommunicationAdapter } from '../types.js'

export function createWorkerAdaptor(m?: Worker) {
  let fn: Fn

  const host = m ?? globalThis

  const adaptor: CommunicationAdapter = {
    send(data) {
      host.postMessage(data)
    },
    receive(receiver) {
      fn = (ev) => receiver(ev.data)

      host.addEventListener('message', fn)
    },
    destory() {
      host.removeEventListener('message', fn)
    },
  }

  return adaptor
}
