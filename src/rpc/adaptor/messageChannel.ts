import type { CommunicationAdapter } from '../types'

export function createMessageChannelAdaptor(m: MessagePort) {
  const adaptor: CommunicationAdapter = {
    send(data) {
      m.postMessage(data)
    },
    registerReceiveCallback(receiveCallback) {
      m.addEventListener('message', (evt) => {
        receiveCallback(evt.data)
      })
    },
  }

  return adaptor
}
