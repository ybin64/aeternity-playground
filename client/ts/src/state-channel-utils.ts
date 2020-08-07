import * as bignumber from 'bignumber.js'
import * as es_channel from '@aeternity/aepp-sdk/es/channel'
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'


import {unpackTx} from '@aeternity/aepp-sdk/es/tx/builder'

type ChannelOnEventLogger = (event : es_channel.OnEvents, args : any) => void


export type ChannelCbLogSrc = 'initiator' | 'responder'
export type ChannelLogMsg = {
    src : ChannelCbLogSrc
    type : 'item' | 'account-id' 
    item? : ChannelStateItem
    accountId? : string
}
export type ChannelLogCallback = (log : ChannelLogMsg) => void


export type ChannelBalances = {[key in ChannelCbLogSrc] : {
    startBalance : string,
    prevBalance  : string
} | null}

export function initBalance() : ChannelBalances {
    return {
        initiator : null,
        responder : null
    }
}

/**
 * Calculate balance difference and distribute the balance info via the callback
 * @param cb 
 * @param src 
 * @param u 
 * @param accountId 
 * @param info 
 * @param balances 
 * @param balance 
 */
export function cbDistributeBalance(cb : ChannelLogCallback, src : ChannelCbLogSrc, u : Universal, accountId : string, info : string, balances : ChannelBalances, balance : number | string) : ChannelBalances {
    const ret = {...balances}

    let diffStart : string | null = null
    let diffPrev : string | null = null

    if (balances[src] === null) {
        ret[src] = {
            startBalance : balance.toString(),
            prevBalance  : balance.toString()
        }
    } else {
        diffPrev = (new bignumber.BigNumber(balance).minus(new bignumber.BigNumber(balances[src]!.prevBalance))).toString()
        diffStart = (new bignumber.BigNumber(balance).minus(new bignumber.BigNumber(balances[src]!.startBalance))).toString()
        ret[src]!.prevBalance = balance.toString()
    }

    cb(buildChLogBalance(src, balance, diffStart, diffPrev, info))

    return ret
}




export function addChannelOnEventLogger(ch : es_channel.Channel, logger : ChannelOnEventLogger) {

    ch.on('error', (args => {
        logger('error', args)
    }))

    ch.on('onChainTx', (args => {
        logger('onChainTx', '[Not showing args tx_...]')   
    }))

    ch.on('onWithdrawLocked', (args => {
        logger('onWithdrawLocked', args)
    }))

    ch.on('withdrawLocked', (args => {
        logger('withdrawLocked', args)
    }))

    ch.on('ownDepositLocked', (args => {
        logger('ownDepositLocked', args)
    }))

    ch.on('depositLocked', (args => {
        logger('depositLocked', args)
    }))


    // Internal events?
    
    ch.on('statusChanged', (args => {
        logger('statusChanged', args)
    }))
    

    ch.on('stateChanged', (args => {
        logger('stateChanged', '[Not showing args tx_...]')
    }))

    ch.on('message', (args => {
        logger('message', args)
    }))
}


export type ChannelStateItem = {
    time : Date
    type : 'status' | 'chain-tx' | 'state' | 'message' | 'balance' | 
           'artificial-info' | 'channel-sign',

    /**
     * Valid if type === 'status'
     */
    status? : es_channel.OnEventCbArg_StatusChanged

    /**
     * Valid if type === 'message'
     */
    message? : string

    /**
     * Valid if type === 'balance'
     */
     balance? : number | string

    /**
     * Balance diff since start
     * Valid if type === 'balance'
     */
    balanceDiffStart? : string | null

    /**
     * Balance diff since previous balance report
     * Valid if type === 'balance'
     */
    balanceDiffPrev? : string | null

     /**
      * Valid if type === 'artificial-info'
      */
     artificialInfo? : string

     /**
      * Valid if type === 'channel-sign'
      */
     channelSignTag? : es_channel.SignTag

     /**
      * Valid if type === 'balance'
      */
     info? : string
}

/**
 * Create a log that distributes the account id (i.e. the account public key)
 * @param src 
 * @param accountId 
 */
export function buildChLogAccountId(src : ChannelCbLogSrc, accountId : string) : ChannelLogMsg {
    return {
        src : src,
        type : 'account-id',
        accountId : accountId
    }
}

/**
 * Create a log for generic message information.
 * @param src 
 * @param infoText 
 */
export function buildChLogArtificialInfo(src : ChannelCbLogSrc, infoText : string) : ChannelLogMsg {
    return {
        src : src,
        type : 'item',
        item : {
            type : 'artificial-info',
            time : new Date(),
            artificialInfo : infoText
        }
    }
}

export function buildChChannelSign(src : ChannelCbLogSrc, tag : es_channel.SignTag) : ChannelLogMsg {
    return {
        src : src,
        type : 'item',
        item : {
            type : 'channel-sign',
            time : new Date(),
            channelSignTag : tag
        }
    }
}

/**
 * Create a log for indicating the account balance.
 * @param src 
 * @param balance 
 */
export function buildChLogBalance(src : ChannelCbLogSrc, balance : number | string, balanceDiffStart : string | null, balanceDiffPrev : string | null, info : string) : ChannelLogMsg {
    return {
        src : src,
        type : 'item',
        item : {
            type : 'balance',
            time : new Date(),
            balance : balance,
            balanceDiffStart : balanceDiffStart,
            balanceDiffPrev : balanceDiffPrev,
            info    : info
        }
    }
}

/**
 * Create log for 'statusChanged' channel message
 * 
 * **Example:**
 * ```
 * chResponder.on('statusChanged', status => {
 *    testCb(buildChLogStatus('responder', status))
 * }
 * ```
 * @param src 
 * @param status 
 */
export function buildChLogStatus(src : ChannelCbLogSrc, status : es_channel.OnEventCbArg_StatusChanged) : ChannelLogMsg {
    return {
        src : src,
        type : 'item',
        item : {
            type : 'status',
            time : new Date(),
            status : status
        }
    }
}

/**
 * Create log for 'onChainTx' channel message
 * **Example:**
 * ```
 * chResponder.on('onChainTx', async tx => {
 *     testCb(buildChLogChainTx('initiator', tx))
 * })
 * ```
 * @param src 
 * @param tx 
 */
export function buildChLogChainTx(src : ChannelCbLogSrc, tx : string) : ChannelLogMsg {
    //const result = unpackTx(tx)
    //console.log(`.... ${src} : _cbNewChainTx : result=`, result)
    return {
        src : src,
        type : 'item',
        item : {
            type : 'chain-tx',
            time : new Date()
        }
    }
}

/**
 * Create log for 'stateChanged' channel message
 * **Example:**
 * ```
 * chInitiator.on('stateChanged', async tx => {
 *      testCb(buildChLogState('initiator', tx))
 * })
 * ``` 
 * @param src 
 * @param tx 
 */
export function buildChLogState(src : ChannelCbLogSrc, tx : string) : ChannelLogMsg {
    //const result = unpackTx(tx)
    //console.log(`.... ${src} : _cbNewState : result=`, result)

    return {
        src : src,
        type : 'item',
        item : {
            type : 'state',
            time : new Date()
        }
    } 
}


/**
 * Create log for received channel message
 * **Example:**
 * ```
 * chResponder.on('message', msg => {
 *     testCb(buildChLogMessage('responder', msg))
 * })
 * ```
 * @param src 
 * @param message 
 */
export function buildChLogMessage(src : ChannelCbLogSrc, message : es_channel.OnEventCbArg_Message) : ChannelLogMsg {
    return {
        src : src,
        type : 'item',
        item : {
            type : 'message',
            time : new Date(),
            message : message.info
        }
    }
}
