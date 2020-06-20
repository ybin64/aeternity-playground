
import Node from '@aeternity/aepp-sdk/es/node'
import {Ae, SpendResult} from '@aeternity/aepp-sdk/es/ae'
import UniversalF, {Universal} from '@aeternity/aepp-sdk/es/ae/universal'
import {KeyPair, generateKeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'
import {Chain} from '@aeternity/aepp-sdk/es/chain'

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'

import {getUiState} from './global-state'
import { AeNetworkConfig } from './ae-network'



export async function getUniversal(network : AeNetworkConfig) : Promise<Universal> {
    let node = await Node({
        url: network.networkUrl,
        internalUrl: network.internalUrl,

        // FIXME: Not in .d.ts file yet
        //forceCompatibility: true
    })

    return await UniversalF({
        nodes: [{
            name: 'ANY_NAME',
            instance: node
        }],
        accounts: [MemoryAccount({
            // FIXME: From node_modules/aeproject-config/config/config.json, not sure if they are 'magical', keeping them for now
            keypair : {
                secretKey : "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca",
                publicKey : "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU"
            }
        })],
        nativeMode: true,
        networkId: network.networkId,
        compilerUrl: network.compilerUrl,
        forceCompatibility: true
    })
}


let _cachedUniversal : Universal | undefined

export function clearApiCache() {
    _cachedUniversal = undefined
}

export async function getCachedUniversal() : Promise<Universal> {
    if (_cachedUniversal) {
        return _cachedUniversal
    }

    _cachedUniversal = await getUniversal(getUiState().networkConfig)
 
    return _cachedUniversal
}

export async function getChain(chain? : Chain) : Promise<Chain> {
    if (chain) {
        return chain
    }

    return await getCachedUniversal()
}


export async function getAe(ae? : Ae) : Promise<Ae> {
    if (ae) {
        return ae
    }

    return await getCachedUniversal()
}


export async function getBalance(address : string, chain? : Chain) : Promise<number> {
    chain = await getChain(chain)
    return chain.balance(address)
}

export async function spend(amount : number | string, recipientId : string, ae? : Ae) : Promise<SpendResult> {
    ae = await getAe(ae)
    return ae.spend(amount, recipientId)
}


/**
 * Didn't get the error items in FF, log explicitly
 *  e.config, e.code, e.request, e.response, e.isAxiosError
 * @param e 
 */
export function logError(e : any) {
    console.error(`ae-utils.ts : logError : e=`, e)

    // e.config, code, request, response, isAxiosError
    console.log('e=', e)
    console.log('e.config=', e.config)
    console.log('e.code=', e.code)
    console.log('e.request=', e.request)
    console.log('e.response=', e.response)
    console.log('e.isAxiosError', e.isAxiosError)  
}

/**
 * e.config, e.code, e.request, e.response, e.isAxiosError
 * @param e 
 */
export function isAccountNotFoundError(e : any) : boolean {
    let req : XMLHttpRequest = e

    if (e.request) {
        req = e.request
    }

    
    if (req.response && req.response.search('Account not found') >= 0) {
        return true
    }

    return false
}

export type ErrorType = 'unknown' | 'account-not-found'

export type ErrorInfo = {
    type : ErrorType
    text : string
}

export function getErrorInfo(e : any) : ErrorInfo {

    if (isAccountNotFoundError(e)) {
        return {
            type : 'account-not-found',
            text : 'Account not found'
        }
    }
    return {
        type : 'unknown',
        text : e.message
    }
}

/*
// -----------------------------------------------------------------------------
// node_modules/aeproject-config/config/config.json

const config = {
    "localhostParams": {
        "url": "http://localhost:3001",
        "networkId": "ae_devnet"
    },
    "testNetParams": {
        "url": "https://sdk-testnet.aepps.com",
        "networkId": "ae_uat"
    },
    "mainNetParams": {
        "url": "https://sdk-mainnet.aepps.com",
        "networkId": "ae_mainnet"
    },
    "keypair": {
        "secretKey": "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca",
        "publicKey": "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU"
    },
    "compilerUrl": "http://localhost:3080",
    "hostedCompiler": "https://compiler.aepps.com"
}


type Network = {
    url : string
    networkId : string
    compilerUrl? : string
}
*/

/*

// -----------------------------------------------------------------------------
// node_modules/aeproject-utils/utils/aeproject-utils.js

async function handleApiError(fn : () => any) {
    try {
        return await fn()
    } catch (e) {
        console.log(e)
        const response = e.response
        logApiError(response && response.data ? response.data.reason : e)
        process.exit(1)
    }
};

function logApiError(error : any) {
    //printError(`API ERROR: ${ error }`)
    console.error(`API Error: ${ error}`)
}


export async function getClient(network? : Network, keypair? : KeyPair) : Promise<Universal> {

    if (network === undefined) {
        network = {
            ...config.localhostParams,
            compilerUrl : config.compilerUrl
        }
    }

    if (!keypair) {
        keypair = config.keypair
    }


    let client : Universal;
    let internalUrl = network.url;

    
    if (network.url.includes("localhost")) {
        internalUrl = internalUrl + "/internal"
    }
    

    let node = await Node({
        url: network.url,
        internalUrl: internalUrl,

        // FIXME: Not in .d.ts file yet
        //forceCompatibility: true
    })



    //await handleApiError(async () => {
        client = await UniversalF({
            nodes: [{
                name: 'ANY_NAME',
                instance: node
            }],
            accounts: [MemoryAccount({
                keypair
            })],
            nativeMode: true,
            networkId: network.networkId,
            compilerUrl: network.compilerUrl,
            forceCompatibility: true
        })
    //});

    
    return client;
}




export async function waitToMineCoins(client : Chain, height: number) {
    return await client.awaitHeight(height, {
        interval: 8000,
        attempts: 300
    })
}


export async function fundWallet(client : Ae, recipient : string) {
    const amountToFund = 10000000000000000000
    return await client.spend(amountToFund, recipient)
}
*/