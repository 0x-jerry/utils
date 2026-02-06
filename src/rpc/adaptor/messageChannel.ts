import type { CommunicationAdapter } from '../types'

export function createMessageChannelAdaptor(m: MessagePort) {
  const adaptor: CommunicationAdapter = {
    send(data) {
      m.postMessage(data)
    },
    receive(receiver) {
      m.addEventListener('message', (evt) => {
        receiver(evt.data)
      })
    },
  }

  return adaptor
}
