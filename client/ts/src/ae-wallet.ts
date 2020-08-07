

import {KeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'

export type Balance = number | string

export type AeWalletConfig = {
    name : string
    keypair : KeyPair
}



export const AliceWallet : AeWalletConfig = {
    name : 'Alice',
    keypair : {
        publicKey: "ak_29aHdDoASEJJNrxmWAAkTRK2nP1WT7UJzKpiB3EP7V8Ka6Pkv6", 
        secretKey: "10514de92009888e24711821268aa945c9e32e1406e887ee1e7a78da9adc0906972a0912a353aa97bb3739516ffe9b1f3ff450b307132021521a4826c06d4d27"
        
    }
}

export const BobWallet : AeWalletConfig = {
    name : 'Bob',
    keypair : {
        publicKey: "ak_izGWMicyLmKUBzuYAkFfeRD9xzdsQMUE8amj9Ff53qVjXAnvt", 
        secretKey: "cc955a01cfb0480b8b7faee0a633b338807a91299fdfbd22f4f0216dd5d734895f56637deca81883b1ff629e91aa36c521b7d1d6e481bc716e6810de2fd5b389"
    }
}

export function getWalletName(publicKey: string) : string {
    if (publicKey == AliceWallet.keypair.publicKey) {
        return 'Alice'
    } else if (publicKey === BobWallet.keypair.publicKey) {
        return 'Bob'
    } else {
        return '<Unknown Wallet>'
    }
}

export function hasWalletName(publicKey : string) : boolean {
    if (publicKey == AliceWallet.keypair.publicKey) {
        return true
    } else if (publicKey === BobWallet.keypair.publicKey) {
        return true
    } else {
        return false
    }
}


