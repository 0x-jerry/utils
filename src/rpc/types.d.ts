export interface RPCMessageProtocol {
  /**
   * protocol ID
   */
  _: string
  /**
   * type
   */
  t: string
  /**
   * id
   */
  id: string
}

export interface RPCRequest extends RPCMessageProtocol {
  t: 'q'
  id: string
  /**
   * method
   */
  m: string
  /**
   * params
   */
  p?: any[]
}

export interface RPCResponse extends RPCMessageProtocol {
  t: 's'
  id: string
  /**
   * result
   */
  r?: any
  /**
   * error
   */
  e?: any
}

export type RPCMessage = RPCRequest | RPCResponse
