
import Node from '@aeternity/aepp-sdk/es/node'
import {Ae, SpendResult} from '@aeternity/aepp-sdk/es/ae'
import UniversalF, {Universal} from '@aeternity/aepp-sdk/es/ae/universal'
import {KeyPair, generateKeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'
import {Chain} from '@aeternity/aepp-sdk/es/chain'

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'

import {getUiState} from './global-state'
import { AeNetworkConfig } from './ae-network'



export async function getUniversal(network : AeNetworkConfig, accountKeyPair? : KeyPair) : Promise<Universal> {
    let node = await Node({
        url: network.networkUrl,
        internalUrl: network.internalUrl,

        // FIXME: Not in .d.ts file yet
        //forceCompatibility: true
    })

    
    // FIXME: From node_modules/aeproject-config/config/config.json, not sure if they are 'magical', keeping them for now
    let keypair : KeyPair = {
        secretKey : "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca",
        publicKey : "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU"
    }

    if (accountKeyPair) {
        keypair = accountKeyPair
    }
            
    return await UniversalF({
        nodes: [{
            name: 'ANY_NAME',
            instance: node
        }],
        accounts: [MemoryAccount({
            keypair : keypair
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


export async function getBalance(address : string, chain? : Chain) : Promise<number | string> {
    chain = await getChain(chain)
    return chain.balance(address)
}

export async function spend(amount : number | string, recipientId : string, ae? : Ae) : Promise<SpendResult> {
    ae = await getAe(ae)
    return ae.spend(amount, recipientId)
}

export async function compileContract(text : string) {

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