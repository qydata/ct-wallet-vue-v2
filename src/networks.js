import _ from 'lodash'

const ChainIds = {
  Mainnet: 'mainnet',
  Testnet: 'testnet',
  TestnetSapphire: 'testnet_sapphire',
  Privatenet: 'privatenet',
  EliteEdgeTestnet: 'testnet_amber'
}

const Mainnet = {
  chainId: ChainIds.Mainnet,
  chainIdNum: 361,
  name: 'Mainnet',
  rpcUrl: 'https://theta-bridge-rpc.thetatoken.org/rpc',
  ethRpcUrl: 'https://eth-rpc-api.thetatoken.org',
  explorerUrl: 'https://explorer.thetatoken.org',
  explorerApiUrl: 'https://explorer-api.thetatoken.org',
  color: '#1BDED0',
  metachain: {
    mainchainID: 361,
    mainchainIDStr: ChainIds.Mainnet,

    __LEGACY__mainchainTFuelTokenBankAddr: '0x3c5f7cE61561AA7A8e8919733aC250C84835427f',
    __LEGACY__mainchainTNT20TokenBankAddr: '0x0F1C0a95F5409546Be4E6C56351c8eA5AC8Cdd04',
    __LEGACY__mainchainTNT721TokenBankAddr: '0x551c097e520584689FC8daf4D7b3905fa6bfA54c',
    __LEGACY__mainchainTNT1155TokenBankAddr: '0x356E1ed03Ed7f12d85b666515A7e36952090e609',

    mainchainTFuelTokenBankAddr: '0x1169B30901E4591Ee8A0781af0C9003f608D6b8b',
    mainchainTNT20TokenBankAddr: '0x9f904dE01990e3Ba1AD93629604099D13706ec36',
    mainchainTNT721TokenBankAddr: '0xc85acE39701E02Dd27Df799988b39384AAe64774',
    mainchainTNT1155TokenBankAddr: '0x5907D8e36785fa08E23A7955285EfFf3503909bd',

    crossChainTransferFeeInTFuel: 10,

    subchains: [
      {
        name: 'Playground',
        subchainID: 360888,
        subchainIDStr: 'tsub360888',
        subchainRPC: 'https://tsub360888-rpc.thetatoken.org/rpc',
        subchainTFuelTokenBankAddr: '0x5a443704dd4B594B382c22a083e2BD3090A6feF3',
        subchainTNT20TokenBankAddr: '0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D',
        subchainTNT721TokenBankAddr: '0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA',
        subchainTNT1155TokenBankAddr: '0x47c5e40890bcE4a473A49D7501808b9633F29782',

        crossChainTransferFeeInTFuel: 10,

        explorerUrl: 'https://tsub360888-explorer.thetatoken.org'
      },
      {
        name: 'Lavita',
        subchainID: 360890,
        subchainIDStr: 'tsub360890',
        subchainRPC: 'https://tsub360890-rpc.thetatoken.org/rpc',
        subchainTFuelTokenBankAddr: '0x5a443704dd4B594B382c22a083e2BD3090A6feF3',
        subchainTNT20TokenBankAddr: '0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D',
        subchainTNT721TokenBankAddr: '0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA',
        subchainTNT1155TokenBankAddr: '0x47c5e40890bcE4a473A49D7501808b9633F29782',

        crossChainTransferFeeInTFuel: 10,

        explorerUrl: 'https://tsub360890-explorer.thetatoken.org'
      },
      {
        name: 'Space Junk',
        subchainID: 360889,
        subchainIDStr: 'tsub360889',
        subchainRPC: 'https://tsub360889-rpc.thetatoken.org/rpc',
        subchainTFuelTokenBankAddr: '0x5a443704dd4B594B382c22a083e2BD3090A6feF3',
        subchainTNT20TokenBankAddr: '0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D',
        subchainTNT721TokenBankAddr: '0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA',
        subchainTNT1155TokenBankAddr: '0x47c5e40890bcE4a473A49D7501808b9633F29782',

        crossChainTransferFeeInTFuel: 10,

        explorerUrl: 'https://tsub360889-explorer.thetatoken.org'
      }
    ]
  }
}

const Testnet = {
  chainId: ChainIds.Testnet,
  chainIdNum: 365,
  name: 'Testnet',
  rpcUrl: 'https://theta-bridge-rpc-testnet.thetatoken.org/rpc',
  ethRpcUrl: 'https://eth-rpc-api-testnet.thetatoken.org/rpc',
  explorerUrl: 'https://beta-explorer.thetatoken.org',
  explorerApiUrl: 'https://testnet-explorer-api.thetatoken.org',
  color: '#FF4A8D',
  metachain: {
    mainchainID: 365,
    mainchainIDStr: ChainIds.Testnet,

    mainchainTFuelTokenBankAddr: '0xA906CB988bC8D37091B5962685E0bb5160039AC6',
    mainchainTNT20TokenBankAddr: '0x73b72cCBf9CefF04032cd7CA52AC64aE310985af',
    mainchainTNT721TokenBankAddr: '0x0A7111590CF9C547a1AA25A9a6c85a15aC86b7C8',
    mainchainTNT1155TokenBankAddr: '0xd3cF92dd341Ded226aa8a02C47296bAA23CFaaff',

    crossChainTransferFeeInTFuel: 10,

    subchains: [
      {
        name: 'Replay Demo',
        subchainID: 360777,
        subchainIDStr: 'tsub360777',
        subchainRPC: 'https://testnet-tsub360777-rpc.thetatoken.org/rpc',
        subchainTFuelTokenBankAddr: '0x5a443704dd4B594B382c22a083e2BD3090A6feF3',
        subchainTNT20TokenBankAddr: '0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D',
        subchainTNT721TokenBankAddr: '0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA',
        subchainTNT1155TokenBankAddr: '0x47c5e40890bcE4a473A49D7501808b9633F29782',

        crossChainTransferFeeInTFuel: 10,

        explorerUrl: 'https://testnet-tsub360777-explorer.thetatoken.org'
      }
    ]
  }
}

const Privatenet = {
  chainId: ChainIds.Privatenet,
  chainIdNum: 366,
  name: 'Smart Contracts Sandbox',
  rpcUrl: 'https://theta-node-rpc-smart-contract-sandbox.thetatoken.org/rpc',
  explorerUrl: 'https://smart-contracts-sandbox-explorer.thetatoken.org',
  explorerApiUrl: 'https://smart-contracts-sandbox-explorer.thetatoken.org:8443',
  color: '#7157FF'
}

const networks = {
  [ChainIds.Mainnet]: Mainnet,
  [ChainIds.Testnet]: Testnet,
  [ChainIds.Privatenet]: Privatenet
}

const getNetworkForChainId = (chainId) => {
  //TODO throw if unknown
  return networks[chainId]
}

const getRPCUrlForChainId = (chainId) => {
  return _.get(getNetworkForChainId(chainId), 'rpcUrl')
}

const getExplorerUrlForChainId = (chainId) => {
  return _.get(getNetworkForChainId(chainId), 'explorerUrl')
}

const getExplorerApiUrlForChainId = (chainId) => {
  return _.get(getNetworkForChainId(chainId), 'explorerApiUrl')
}

const getMetachainInfoForChainId = (chainId) => {
  return _.get(getNetworkForChainId(chainId), 'metachain')
}

export {
  Mainnet,
  Testnet,
  Privatenet,

  ChainIds,

  getRPCUrlForChainId,
  getExplorerUrlForChainId,
  getExplorerApiUrlForChainId,
  getNetworkForChainId,
  getMetachainInfoForChainId
}
