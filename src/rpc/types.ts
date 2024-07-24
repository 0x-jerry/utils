import type { Fn } from '../types/index.js'

export interface Procedure {
  [key: string]: Procedure | Fn
}

export interface CommunicationAdapter {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  serialize(o: any): any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  deserialize(o: any): any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  receive(receiver: Fn<any, [any]>): any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  send(data: any): any
}

export interface CommunicationProtocol {
  /**
   * version
   */
  v: number

  /**
   * id
   */
  _: string

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
