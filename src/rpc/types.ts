import type { Fn } from '../types'

export interface Procedure {
  [key: string]: Procedure | Fn
}

export interface CommunicationAdapter<T extends CommunicationProtocol = CommunicationProtocol> {
  receive(receiver: Fn<void, [data: T]>): void
  send(data: T): void
}

export enum MessageFlag {
  /**
   * remote response
   */
  Response = 1,
}

export interface CommunicationProtocol {
  /**
   * id
   */
  _: string

  /**
   * flags
   */
  f?: number

  /**
   * key path
   */
  k?: string[]

  /**
   * arguments
   */
  a?: unknown[]

  /**
   * error
   */
  e?: string

  /**
   * response data
   */
  d?: unknown
}
