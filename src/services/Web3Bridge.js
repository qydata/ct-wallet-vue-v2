export default class Web3Bridge {
  constructor(state) {
    this.projectMetadata = null
    this.targetOrigin = '*' //Gets set by the DAppModal
    this.targetFrame = null
    this.state = state
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
    targetFrame.contentWindow.postMessage(JSON.stringify({
      type: 'wallet_setConfig',
      config: config
    }), this.targetOrigin)
  }

  init() {
    window.addEventListener('message', async (event) => {
      // TODO ensure the origin is whitelisted in our wallet-metadata
      // if (event.origin !== "https://example-dapp.com") return; // Check origin for security

      try {
        const sourceFrame = event.source

        const selectedAddress = this.state.address

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

        const data = event.data
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
              // await store.dispatch(setNetwork(network))
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
              // store.dispatch(showModal(ModalTypes.PERSONAL_SIGN, {
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
              // case 'personal_sign': {
              //   const [message, address] = params
              //   const decodedMessage = Buffer.from(message.replace('0x', ''), 'hex').toString('utf8')
              //   console.log('personal_sign', decodedMessage)
              //   store.dispatch(showModal({
              //     type: ModalTypes.PERSONAL_SIGN,
              //     props: {
              //       message: decodedMessage,
              //       onAccept: async (signedMessage) => {
              //
              //         store.dispatch(hideModal())
              //         respond(request, signedMessage)
              //       },
              //       onReject: () => {
              //         store.dispatch(hideModal())
              //         respond(request, null, {
              //           code: 4001,
              //           message: 'User rejected the request.'
              //         })
              //       }
              //     }
              //   }))
              //   break
              // }
              // case 'eth_sendTransaction': {
              //   const [transaction] = params
              //   window.transaction = transaction
              //   store.dispatch(createTransactionRequest({
              //     txData: transaction,
              //     txType: TxType.SmartContract
              //   }, {
              //     onAccept: async (txHash) => {
              //       respond(request, txHash)
              //     },
              //     onReject: () => {
              //       respond(request, null, {
              //         code: 4001,
              //         message: 'User rejected the request.'
              //       })
              //     }
              //   }))
              // }
            }
          } catch (e) {
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
