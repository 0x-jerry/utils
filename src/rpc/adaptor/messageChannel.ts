import { CommunicationAdapter } from '../types'

export function createMessageChannelAdaptor(m: MessagePort) {
  const adaptor: CommunicationAdapter = {
    serialize(o) {
      return o
    },
    deserialize(o) {
      return o
    },
    send(data) {
      m.postMessage(data)
    },
    receive(receiver) {
      m.addEventListener('message', (ev) => receiver(ev.data))
    },
  }

  return adaptor
}
