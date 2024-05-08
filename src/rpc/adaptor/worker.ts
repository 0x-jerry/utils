import type { CommunicationAdapter } from '../types.js'

export function createWorkerAdaptor(m?: Worker) {
  const adaptor: CommunicationAdapter = {
    serialize(o) {
      return o
    },
    deserialize(o) {
      return o
    },
    send(data) {
      if (m) {
        m.postMessage(data)
      } else {
        globalThis.postMessage(data)
      }
    },
    receive(receiver) {
      if (m) {
        m.addEventListener('message', (ev) => receiver(ev.data))
      } else {
        globalThis.addEventListener('message', (ev) => receiver(ev.data))
      }
    },
  }

  return adaptor
}
