export interface RPCRequest {
  type: 'q'
  id: string
  method: string
  params: any[]
}

export interface RPCResponse {
  type: 's'
  id: string
  result?: any
  error?: any
}

export type RPCMessage = RPCRequest | RPCResponse
