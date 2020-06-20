
export type NetworkName = 'localhost' | 'testnet'

export const NetworkNames : NetworkName[] = ['localhost', 'testnet']

export type AeNetworkConfig = {
    networkUrl : string
    internalUrl : string
    networkId  : string
    compilerUrl : string
}

export type AeNetworkInfo = {
    name : NetworkName
    config : AeNetworkConfig
}


export const LocalhostNetwork : AeNetworkInfo = {
    name : 'localhost',
    config : {
        networkUrl  : 'http://localhost:3001',
        internalUrl : 'http://localhost:3001/internal',
        networkId   : 'ae_devnet',
        compilerUrl : 'http://localhost:3080'     
    }
}


export const TestNet1Network : AeNetworkInfo = {
    name : 'testnet',
    config : {
        networkUrl  : 'https://testnet.aeternity.io',
        internalUrl : 'https://testnet.aeternity.io-probably-wroing',
        networkId   : 'ae_testnet',
        compilerUrl : 'http://localhost:3080-this-is-wrong'     
    }
}