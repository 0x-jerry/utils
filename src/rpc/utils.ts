import { isObject, isString } from '../is'
import { type CommunicationProtocol, MessageFlag } from './types'

export function isResponseMessage(o: unknown, namespace?: string): o is CommunicationProtocol {
  return isCommunicationProtocol(o, namespace) && isFlagOn(o.f, MessageFlag.Response)
}

export function isRequestMessage(o: unknown, namespace?: string): o is CommunicationProtocol {
  return isCommunicationProtocol(o, namespace) && !isFlagOn(o.f, MessageFlag.Response)
}

export function isCommunicationProtocol(
  o: unknown,
  namespace?: string,
): o is CommunicationProtocol {
  return isObject(o) && '_' in o && isString(o._) && o.n === namespace
}

function isFlagOn(n: number, flags: number) {
  return (n & flags) === flags
}
