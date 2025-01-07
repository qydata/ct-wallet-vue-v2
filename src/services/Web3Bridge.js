import {EIP155Method} from './config/EIP155'

export default class Web3Bridge {
  constructor(state, address) {
    this.projectMetadata = null
    this.targetOrigin = '*' //Gets set by the DAppModal
    this.targetFrame = null
    this.state = state
    this.address = address
  }

  endSession() {
    this.projectMetadata = null
    this.targetFrame = null
  }

  sendConfig(targetFrame, selectedAddress) {
    console.log(selectedAddress)
    const config = {
      origin: window.location.origin,
      chainId: 27,
      jsonRpcUrl: 'https://ctblock.cn/blockChain',
      accounts: [selectedAddress]
    }
    if (targetFrame && targetFrame.contentWindow) {
      targetFrame.contentWindow.postMessage(JSON.stringify({
        type: 'wallet_setConfig',
        config: config
      }), this.targetOrigin);
    }
    else {
      console.error('targetFrame not found or contentWindow is unavailable');
    }
  }

  init(modal,
    dispatch) {
    window.addEventListener('message', async (event) => {
      // TODO ensure the origin is whitelisted in our wallet-metadata
      // if (event.origin !== "https://example-dapp.com") return; // Check origin for security

      try {
        const sourceFrame = event.source

        const selectedAddress = this.address
        console.log('init selectedAddress:', selectedAddress)
        const buildRPCResponse = (id, result, error) => {
          if (error) {
            return {
              id: id,
              jsonrpc: '2.0',
              error: error
            }
          }

          return {
            id: id,
            jsonrpc: '2.0',
            result: result
          }
        }
        const respond = (request, result, error) => {
          const {id} = request
          const response = buildRPCResponse(id, result, error)
          sourceFrame.postMessage(JSON.stringify(response), this.targetOrigin)
        }

        let data
        if (typeof event.data === 'string') {
          data = JSON.parse(event.data)
        }
        else {
          data = event.data
        }
        console.log('data:', data)
        if (data.type === 'connect') {
          // Ignore?
        }
        else if (data.type === 'wallet_sendDomainMetadata') {
          this.projectMetadata = data.metadata
        }
        else if (data.type === 'request') {
          const request = data.request
          const {id, method, params} = request

          try {
            console.log('parent method:', method)
            switch (method) {
            case 'wallet_switchEthereumChain': {
              const [targetChain] = params
              let {chainId} = targetChain
              chainId = parseInt(chainId, 16)

              if (chainId !== 27) {
                respond(request, null, {
                  code: -32000,
                  message: 'Unsupported chain id'
                })
                break
              }

              // TODO set network
              // dispatch(setNetwork(network))
              respond(request, true)
              break
            }
            case 'wallet_requestPermissions': {
              const [targetChain] = params
              let {chainId} = targetChain
              chainId = parseInt(chainId, 16)

              if (chainId !== 27) {
                respond(request, null, {
                  code: -32000,
                  message: 'Unsupported chain id'
                })
                break
              }

              // TODO set network
              // dispatch(setNetwork(network))
              respond(request, true)
              break
            }
            case 'eth_requestAccounts': {
              respond(request, [selectedAddress])
              break
            }
            case 'eth_sign': {
              const [address, message] = params
              const decodedMessage = Buffer.from(message.replace('0x', ''), 'hex').toString('utf8')

              // TODO need to show the modal here...
              console.log('eth_sign', decodedMessage)
              // dispatch(modal.show(ModalTypes.PERSONAL_SIGN, {
              //     wallet: selectedIdentity,
              //     chainInfo: network,
              //     projectMetadata: projectMetadata,
              //     message: decodedMessage,
              //     onAccept: async (signedMessage) => {
              //         respond(request, signedMessage);
              //     },
              //     onReject: () => {
              //         respond(request, null, {
              //             code: 4001,
              //             message: 'User rejected the request.',
              //         });
              //     }
              // }))
              break
            }
            case 'personal_sign': {
              const [message, address] = params
              const decodedMessage = Buffer.from(message.replace('0x', ''), 'hex').toString('utf8')
              console.log('personal_sign', decodedMessage)
              modal.show({
                type: EIP155Method.PersonalSign,
                props: {
                  message: decodedMessage,
                  onAccept: async (signedMessage) => {
                    console.log('personal_sign rejected - onAccept', signedMessage)
                    modal.hide()
                    respond(request, signedMessage)
                  },
                  onReject: () => {
                    console.log('personal_sign rejected - onReject')
                    modal.hide()
                    respond(request, null, {
                      code: 4001,
                      message: 'User rejected the request.'
                    })
                  }
                }
              })
              break
            }
            case 'eth_sendTransaction': {
              const [transaction] = params

              modal.show({
                type: EIP155Method.EthSendTransaction,
                props: {
                  transaction: transaction,
                  onAccept: async (signedMessage) => {
                    console.log('personal_sign rejected - onAccept', signedMessage)
                    modal.hide()
                    respond(request, signedMessage)
                  },
                  onReject: () => {
                    console.log('personal_sign rejected - onReject')
                    modal.hide()
                    respond(request, null, {
                      code: 4001,
                      message: 'User rejected the request.'
                    })
                  }
                }
              })
            }
            }
          } catch (e) {
            console.trace(e)
            respond(request, null, {
              code: -32603,
              message: 'Internal JSON-RPC error.'
            })
          }
        }
        // eslint-disable-next-line no-empty
      } catch (e) {
        console.log(e)
      }
    }, false)
  }
}
