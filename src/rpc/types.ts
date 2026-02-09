import type { Fn } from '../types'

export interface Procedure {
  [key: string]: Procedure | Fn
}

export interface CommunicationAdapter<T extends CommunicationProtocol = CommunicationProtocol> {
  /**
   *
   * @param receiveCallback Return true if the data is valid message
   */
  registerReceiveCallback(receiveCallback: Fn<boolean, [data: T]>): void
  send(data: T): void
}

export enum MessageFlag {
  Default = 0,
  /**
   * Remote response
   */
  Response = 0b1,
}

export interface CommunicationProtocol {
  /**
   * ID
   */
  _: string

  /**
   * Flags
   */
  f: number

  /**
   * Key path
   */
  k?: string[]

  /**
   * Arguments
   */
  a?: unknown[]

  /**
   * Error
   */
  e?: string

  /**
   * Response data
   */
  d?: unknown

  /**
   * Namespcae
   */
  n?: string
}
