import type { Fn } from '../types/index.js'

export interface Procedure {
  [key: string]: Procedure | Fn
}

export interface CommunicationAdapter {
  serialize(o: any): any
  deserialize(o: any): any
  receive(receiver: Fn<any, [any]>): any
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
  a?: any[]

  /**
   * error
   */
  e?: string

  /**
   * response data
   */
  d?: any
}
