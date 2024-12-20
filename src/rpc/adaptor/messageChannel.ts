import type { Fn } from '../../types'
import type { CommunicationAdapter } from '../types'

export function createMessageChannelAdaptor(m: MessagePort) {
  let fn: Fn

  const adaptor: CommunicationAdapter = {
    send(data) {
      m.postMessage(data)
    },
    receive(receiver) {
      fn = (ev) => receiver(ev.data)

      m.addEventListener('message', fn)
    },
    destory() {
      m.removeEventListener('message', fn)
    },
  }

  return adaptor
}
