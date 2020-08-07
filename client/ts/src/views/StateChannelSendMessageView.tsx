import * as React from 'react'
import clsx from 'clsx'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import Button from '@material-ui/core/Button'

import {PropsWithStyles, withStyles, styles} from '../mui-styles'

import NetworkConfiguration from '../components/NetworkConfiguration'

import AeLogs from '../components/AeLogs'
import SophiaEditor from '../components/SophiaEditor'
import CallSophiaFunctions from '../components/CallSophiaFunction'
import ChannelState from '../components/ChannelState'
import {ChannelStateItem} from '../state-channel-utils'

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'
import * as ae_utils from '../ae-utils'
import * as ae_logger from '../ae-logger'

import * as utils from '../utils'

import {AliceWalletInfo, BobWalletInfo} from '../components/WalletInfo'
import * as ae_wallet from '../ae-wallet'
//import {Channel} from '@aeternity/aepp-sdk/es'

import Channel, {Channel as ChannelType} from '@aeternity/aepp-sdk/es/channel'
import * as es_channel from '@aeternity/aepp-sdk/es/channel'
import {unpackTx} from '@aeternity/aepp-sdk/es/tx/builder'

import {KeyPair, generateKeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'


import * as state_channel_utils from '../state-channel-utils'

const _errorLoggerToken = (t : ae_logger.LoggerToken | undefined) => {
    if (t) {
        const endOkText = ae_logger.endOkText(t)

        if (endOkText) {
            ae_logger.endLogError(t, endOkText, '--error--')
        } else {
            ae_logger.endLogError(t, t.txt, '--error--')
        }
    }
}

const _onChannelPrefixLog = (prefix : string) => {
    return (event : es_channel.OnEvents, args : any) => {
        console.log(`_onTest1._onLog : ${prefix} : ch.on('${event}) : args=`, args)
    }
}

async function _getUniqueUniversal(accountKeyPair : KeyPair) {
    const ret = await ae_utils.getUniversal(global_state.getUiState().networkConfig, accountKeyPair)
    return ret
}

async function _createChannel(role : 'initiator' | 'responder', initiatorId : string, responderId : string, sign : (tag : any, tx : any) => Promise<string>) : Promise<ChannelType> {
    const ncConfig = global_state.getUiState().networkConfig

    return await Channel({
        url : ncConfig.channelUrl,
        role : role,
        initiatorId : initiatorId,
        responderId : responderId,
        pushAmount : 3,
        initiatorAmount : 1000000000000111,
        responderAmount : 1000000000000222,
        channelReserve  : 20000001234,
        host : ncConfig.channelResponderNode.host,
        port : ncConfig.channelResponderNode.port,
        lockPeriod : 1000,
        sign : sign,

        debug : false
    })
}


async function _createAccount(text : string) : Promise<KeyPair> {
    const kp = generateKeyPair()

    const tl = ae_logger.beginLog(text)

    try {
        // Must spend something to create the account
        const result = await ae_utils.spend('10000000000000000000', kp.publicKey)
        ae_logger.endLogOk(tl)
    } catch (e) {
        ae_logger.endLogError(tl, text, e)
    }

    return kp
}

async function _getInitiatorAndResponder(type : 'alice-and-bob' | 'new-accounts') : Promise<{
    uInitiator : Universal
    uResponder : Universal
}> {


    if (type === 'alice-and-bob') {
        // Use existing Alice and Bob
  
        return {
            uInitiator : await _getUniqueUniversal(ae_wallet.AliceWallet.keypair),
            uResponder : await _getUniqueUniversal(ae_wallet.BobWallet.keypair)
        }

    } else {
        // Create two new accounts
        const account1 = await _createAccount('Create initiator account')
        const account2 = await _createAccount('Create responder account')

        return {
            uInitiator : await _getUniqueUniversal(account1),
            uResponder : await _getUniqueUniversal(account2)
        }
    }
}

function _initiatorLog(txt : string) {
    ae_logger.log('initiator : ' + txt, {
        css : {
            backgroundColor : 'rgba(0, 255, 0, 0.1)'
        }
    })
}

function _responderLog(txt : string)  {
    ae_logger.log('responder : ' + txt, {
        css : {
            backgroundColor : 'rgba(0, 0, 255, 0.1)'
        }
    })
}

// -----------------------------------------------------------------------------

import {
    buildChLogAccountId,
    buildChLogArtificialInfo, 
    buildChLogBalance,
    
    buildChLogStatus, 
    
    buildChLogChainTx, 
    buildChLogState,
    buildChLogMessage
} from '../state-channel-utils'

let _balances : state_channel_utils.ChannelBalances = state_channel_utils.initBalance()

function _clearBalance() {
    _balances = state_channel_utils.initBalance()
}

function _cbNewBalance(cb : state_channel_utils.ChannelLogCallback, src : state_channel_utils.ChannelCbLogSrc, u : Universal, accountId : string, info : string) {
    u.balance(accountId).then(balance => {
        //cb(buildChLogBalance(src, result, null, ''))
        _balances = state_channel_utils.cbDistributeBalance(cb, src, u, accountId, info, _balances, balance)

    })
}

// -----------------------------------------------------------------------------
// https://github.com/aeternity/tutorials/blob/master/state-channels-introduction.md

async function _onSendMessages(infoCb : state_channel_utils.ChannelLogCallback) {

    let ltInitiatorOpen : ae_logger.LoggerToken | undefined
    let ltResponderOpen : ae_logger.LoggerToken  | undefined
    
    try { 
        _clearBalance()

        //const us = await _getInitiatorAndResponder('new-accounts')
        const us = await _getInitiatorAndResponder('alice-and-bob')

        let uInitiator : Universal = us.uInitiator
        let uResponder : Universal = us.uResponder

        const initiatorId = await uInitiator.address()
        const responderId = await uResponder.address()

        infoCb(buildChLogAccountId('initiator', initiatorId))
        infoCb(buildChLogAccountId('responder', responderId))

        const _checkInitiatorBalance = (info : string) => {
            _cbNewBalance(infoCb, 'initiator', uInitiator, initiatorId, info)
        }

        const _checkResponderBalance = (info : string) => {
            _cbNewBalance(infoCb, 'responder', uResponder, responderId, info)
        }
        
   
        const chInitiator = await _createChannel('initiator', initiatorId, responderId, async (tag, tx) => {
            const utx = unpackTx(tx)
            console.log('chInitiator : 10 : utx=', utx)
            return await uInitiator.signTransaction(tx)
        })

        const chResponder = await _createChannel('responder', initiatorId, responderId, async (tag, tx) => {
            return await uResponder.signTransaction(tx)
        })

        state_channel_utils.addChannelOnEventLogger(chInitiator, _onChannelPrefixLog('initiator'))
        state_channel_utils.addChannelOnEventLogger(chResponder, _onChannelPrefixLog('responder'))


        // 
        // chInitiator.on(...)
        //

        chInitiator.on('statusChanged', async (status) => {
            _initiatorLog(`statusChanged : ${status}`)
            infoCb(buildChLogStatus('initiator', status))

            if (status === 'connected') {
                _checkInitiatorBalance('status=connected')
            }

            if (status === 'disconnected') {
                _checkInitiatorBalance('status=disconnected')
            }

            if (status === 'signed') {
                ltInitiatorOpen = ae_logger.beginLog('initiator : Signed! Waiting for open ...')
 
                _checkInitiatorBalance('status=signed')

                setTimeout(()  => {
                    _initiatorLog('Sending hello world : status=signed')
                    chInitiator.sendMessage('hello world : From initiator [initiator status=signed]', responderId)
                }, 100)
            }

            if (status === 'open') {
                ae_logger.endLogOk(ltInitiatorOpen!, ltInitiatorOpen!.txt + ' : Open!')

  
                setTimeout(() => {
                    _initiatorLog('Sending hello world : status=open')
                    chInitiator.sendMessage('hello world : From initiator [initiator status=open]', responderId)    
                }, 100)


                _initiatorLog('Will shutdown channel in 5 seconds')
                infoCb(buildChLogArtificialInfo('initiator', 'Will shutdown channel in 5 seconds'))

                setTimeout(() => {
                    infoCb(buildChLogArtificialInfo('initiator', 'Shutting down ...'))
                    infoCb(buildChLogArtificialInfo('responder', 'Initiator shutting down the channel!'))

                    const ltShutdown = ae_logger.beginLog('initiator : Shutting down ...')
                    chInitiator.shutdown(async tx => {
                        ae_logger.endLogOk(ltShutdown, ltShutdown.txt + ' : Signing!')
                        return await uInitiator.signTransaction(tx)
                    })

                }, 5000)
            }
        })

        chInitiator.on('onChainTx', async tx => {
            infoCb(buildChLogChainTx('initiator', tx))
        })

        chInitiator.on('stateChanged', async tx => {
            infoCb(buildChLogState('initiator', tx))
        })

        chInitiator.on('message', async msg => {
            _initiatorLog(`message : status=${chResponder.status()} : "${msg.info}`)
            infoCb(buildChLogMessage('initiator', msg))
        })

 
        //
        // chResponder.on(...)
        //

        chResponder.on('statusChanged', status => {
            _responderLog(`statusChanged : ${status}`)
            infoCb(buildChLogStatus('responder', status))

            if (status === 'connected') {
                _checkResponderBalance('status=connected')
            }

            if (status === 'disconnected') {
                _checkResponderBalance('status=disconnected')
            }


            if (status === 'halfSigned') {
                ltResponderOpen = ae_logger.beginLog('responder : Half signed! Waiting for open ...')
                _checkResponderBalance('status=halfSigned')

                setTimeout(() => {
                    _responderLog('Sending hello world : status=halfSigned')
                    chResponder.sendMessage('hello world : From responder [responder status=halfSigned]', initiatorId)    
                }, 100)
            
            }

            if (status === 'open') {
                ae_logger.endLogOk(ltResponderOpen!, ltResponderOpen!.txt + ' : Open!')

                setTimeout(() => {
                    _responderLog('Sending hello world : status=open')
                    chResponder.sendMessage('hello world : From responder [responder status=open]', initiatorId)    
                }, 100)
            }
        })

        chResponder.on('onChainTx', async tx => {
            infoCb(buildChLogChainTx('responder', tx))
        })

        chResponder.on('stateChanged', async tx => {
            infoCb(buildChLogState('responder', tx))
        })

        chResponder.on('message', msg => {
            _responderLog(`message : status=${chResponder.status()} : "${msg.info}"`)
            infoCb(buildChLogMessage('responder', msg))
        })

    } catch (e) {
        console.error('_onSendMessages : 90 : Error : e=', e)
        _errorLoggerToken(ltInitiatorOpen)
        _errorLoggerToken(ltResponderOpen)
    }
}


// -----------------------------------------------------------------------------
//

interface Props extends PropsWithStyles {
}


type _ChannelInfo = {
    startTime : Date
    balance   : string
    items     : ChannelStateItem[]
}

interface State {

    initiator : _ChannelInfo
    initiatorId : string

    responder : _ChannelInfo
    responderId : string
}

class _StateChannelSendMessageView extends React.PureComponent<Props, State> {
    constructor(props : Props, ctx? : any) {
        super(props, ctx)

        this.state = {
            initiator : {
                startTime : new Date(),
                balance   : '',
                items     : []
            },
            initiatorId : '',

            responder : {
                startTime : new Date(),
                balance   : '',
                items     : []
            },
            responderId : ''
        }

        this._onNewChannelStatus = this._onNewChannelStatus.bind(this)
    }

    componentDidMount() {
    }

    render() {
        const p = this.props
        const s = this.state

        return <div className={clsx(p.classes.view, p.classes.contract1View)}>
            <Grid container spacing={3} >
                <Grid item xs={12}>
                    <NetworkConfiguration /> 
                </Grid>

                <Grid item xs={12}>
                    <Button variant='outlined' onClick={() => {
                        this._clearInitiatorAndResponderState()
                        _onSendMessages(this._onNewChannelStatus)
                    }}>Send Messages</Button>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={p.classes.viewPaper}>
                        <ChannelState 
                            type      = 'initiator'
                            accountId = {s.initiatorId}
                            startTime = {s.initiator.startTime}
                            balance   = {s.initiator.balance}
                            items     = {s.initiator.items}
                            />
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={p.classes.viewPaper}>
                        <ChannelState 
                            type      = 'responder'
                            accountId = {s.responderId}
                            startTime = {s.responder.startTime}
                            balance   = {s.responder.balance}
                            items     = {s.responder.items}
                        />
                    </Paper>
                </Grid>
                
                <Grid item xs={12}>
                    <Paper className={p.classes.viewPaper}>
                        <AeLogs />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    }

    private _clearInitiatorAndResponderState() {
        this.setState({
            initiator : {
                startTime : new Date(),
                balance   : '',
                items     : []
            },

            responder : {
                startTime : new Date(),
                balance   : '',
                items     : []
            }          
        })
    }
    private _onNewChannelStatus(msg : state_channel_utils.ChannelLogMsg) {
        if ((msg.type === 'item') && (msg.item)) {
            const item = msg.item

        

            // Use same reference time for initiator and responder
            let startTime = this.state.initiator.startTime

            if (this.state.initiator.items.length === 0) {
                startTime = item.time
            }

            const _add = (org : _ChannelInfo) : _ChannelInfo => {
                let items  = org.items.slice()     
                let balance = org.balance

                if (item.type === 'balance') {
                    balance = item.balance + ''
                }

                items.push(item)

                return {
                    startTime : startTime,
                    balance   : balance,
                    items     : items
                }
            }

            if (msg.src === 'initiator') {
                this.setState({
                    initiator : _add(this.state.initiator)
                })
            } else {
                this.setState({
                    responder : _add(this.state.responder)
                })
            }
        } else if (msg.type === 'account-id') {
            if (msg.src === 'initiator') {
                this.setState({
                    initiatorId : msg.accountId!
                })
            } else {
                this.setState({
                    responderId : msg.accountId!
                })
            }
        } 
    }
}

export default withStyles(styles)(_StateChannelSendMessageView)