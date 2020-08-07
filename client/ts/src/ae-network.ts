

export type AeNetworkConfig = {
    networkUrl : string
    channelUrl : string 
    internalUrl : string
    networkId  : string
    compilerUrl : string,

    channelResponderNode : {
        host : string
        port : number
    }
}

export type AeNetworkInfo = {
    name : string
    config : AeNetworkConfig
}


export const LocalhostNetwork : AeNetworkInfo = {
    name : 'localhost',
    config : {
        networkUrl  : 'http://localhost:3001',
        channelUrl  : 'ws://localhost:3001/channel',
        internalUrl : 'http://localhost:3001/internal',
        networkId   : 'ae_devnet',
        compilerUrl : 'http://localhost:3080',
        channelResponderNode : {
            host : 'localhost',
            port : 3001
        }   
    }
}


export const TestNet1Network : AeNetworkInfo = {
    name : 'testnet',
    config : {
        networkUrl  : 'https://testnet.aeternity.io',
        channelUrl  : 'wss://testnet.aeternity.io/channel/this-is-wrong',
        
        internalUrl : 'https://testnet.aeternity.io-this-is-wrong',
        networkId   : 'ae_testnet',
        compilerUrl : 'http://localhost:3080-this-is-wrong',
        channelResponderNode : {
            host : 'https://testnet.aeternity.io/this-is-wrong',
            port : 3001
        }      
    }
}