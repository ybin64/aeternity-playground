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

import * as bignumber from 'bignumber.js'

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

const _errorLoggerToken = (t : ae_logger.LoggerToken | undefined, error? : any) => {
    if (t) {
        const endOkText = ae_logger.endOkText(t)

        if (!error) {
            error = '--error--'
        }

        if (endOkText) {
            ae_logger.endLogError(t, endOkText, error)
        } else {
            ae_logger.endLogError(t, t.txt, error)
        }
    }
}

const _onChannelPrefixLog = (prefix : string) => {
    return (event : es_channel.OnEvents, args : any) => {
        console.log(`state_ch_call_conntract : ${prefix} : ch.on('${event}) : args=`, args)
    }
}

async function _getUniqueUniversal(accountKeyPair : KeyPair) {
    const ret = await ae_utils.getUniversal(global_state.getUiState().networkConfig, accountKeyPair)
    return ret
}

async function _createChannel(role : 'initiator' | 'responder', initiatorId : string, responderId : string, sign : (tag : es_channel.SignTag, tx : any) => Promise<string>) : Promise<ChannelType> {
    const ncConfig = global_state.getUiState().networkConfig

    return await Channel({
        url : ncConfig.channelUrl,
        role : role,
        initiatorId : initiatorId,
        responderId : responderId,
        pushAmount : 3,
        //                 ---   ---   ---
        initiatorAmount : 1000000000000001,
        responderAmount : 1000000000000010,

        channelReserve  :      20000001000,
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
    buildChChannelSign,
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


function _cbNewBalanceAsync(cb : state_channel_utils.ChannelLogCallback, src : state_channel_utils.ChannelCbLogSrc, u : Universal, accountId : string, info : string) {
    u.balance(accountId).then(balance => {
        _balances = state_channel_utils.cbDistributeBalance(cb, src, u, accountId, info, _balances, balance)
    })
}

async function _cbNewBalanceSync(cb : state_channel_utils.ChannelLogCallback, src : state_channel_utils.ChannelCbLogSrc, u : Universal, accountId : string, info : string) {
    const balance = await u.balance(accountId)
    _balances = state_channel_utils.cbDistributeBalance(cb, src, u, accountId, info, _balances, balance)
}


// -----------------------------------------------------------------------------
// 

// State channel with contract https://blog.coinfabrik.com/aeternity-state-channels-a-peer-to-peer-browser-game/
// https://forum.aeternity.com/t/state-channels-smart-contracts-samples/3434/4
async function _onCallContract(infoCb : state_channel_utils.ChannelLogCallback, contractSrc : string) {
    let ltContractSrc : ae_logger.LoggerToken | undefined
    let ltCompileContract : ae_logger.LoggerToken | undefined
    let ltInitiatorOpen : ae_logger.LoggerToken | undefined
    let ltResponderOpen : ae_logger.LoggerToken | undefined

    let ltContractEncodeCallDataApi_CreateContract : ae_logger.LoggerToken | undefined
    let ltCreateContract : ae_logger.LoggerToken | undefined

    let ltContractEncodeCallDataApi_Call : ae_logger.LoggerToken | undefined
    let ltCallContract : ae_logger.LoggerToken | undefined
    let ltGetContractCall : ae_logger.LoggerToken | undefined
    
    const _errorCleanup = (e : Error) => {
        console.error('_onCallContract : _errorCleanup : Error : e=', e)
        _errorLoggerToken(ltGetContractCall)
        _errorLoggerToken(ltCallContract)
        _errorLoggerToken(ltContractEncodeCallDataApi_Call)
        _errorLoggerToken(ltCreateContract, e)
        _errorLoggerToken(ltContractEncodeCallDataApi_CreateContract)
        _errorLoggerToken(ltInitiatorOpen)
        _errorLoggerToken(ltResponderOpen)
        _errorLoggerToken(ltCompileContract)
        _errorLoggerToken(ltContractSrc)
    }
    
    try {   
        _clearBalance()

        const us = await _getInitiatorAndResponder('alice-and-bob')

        let uInitiator : Universal = us.uInitiator
        let uResponder : Universal = us.uResponder

        
        const initiatorId = await uInitiator.address()
        const responderId = await uResponder.address()
        
        // Distribute intiator and responder addresses 
        infoCb(buildChLogAccountId('initiator', initiatorId))
        infoCb(buildChLogAccountId('responder', responderId))

        const _bothChArtificialInfo = (text : string) => {
            infoCb(buildChLogArtificialInfo('initiator', text))
            infoCb(buildChLogArtificialInfo('responder', text))
        }

        const _checkInitiatorBalanceAsync = (info : string) => {_cbNewBalanceAsync(infoCb, 'initiator', uInitiator, initiatorId, info)}
        const _checkResponderBalanceAsync = (info : string) => {_cbNewBalanceAsync(infoCb, 'responder', uResponder, responderId, info)}
        
        const _checkInitiatorBalanceSync = async (info : string) => {await _cbNewBalanceSync(infoCb, 'initiator', uInitiator, initiatorId, info)}
        const _checkResponderBalanceSync = async (info : string) => {await _cbNewBalanceSync(infoCb, 'responder', uResponder, responderId, info)}
     
        //
        // Compile contract early to detect problems
        //
        let compiledContract : string = ''
        ltCompileContract = ae_logger.beginLog('Compiling contract ...')

        try {
            compiledContract = await uInitiator.compileContractAPI(contractSrc, {backend : 'aevm'})
            ae_logger.endLogOk(ltCompileContract, 'Compiled contract!')
        } catch (e) {
            ae_logger.endLogError(ltCompileContract!, ltCompileContract.txt + ' : FAILED!', e)
            return
        }

        // Create channels

        const chInitiator = await _createChannel('initiator', initiatorId, responderId, async (tag, tx) => {
            _initiatorLog('sign : tag=' + tag)
            infoCb(buildChChannelSign('initiator', tag))
            return await uInitiator.signTransaction(tx)
        })

        const chResponder = await _createChannel('responder', initiatorId, responderId, async (tag, tx) => {
            _responderLog('sign : tag=' + tag)
            infoCb(buildChChannelSign('responder', tag))
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
                _checkInitiatorBalanceAsync('status=connected')
            }

            if (status === 'disconnected') {
                _checkInitiatorBalanceAsync('status=disconnected')
            }

            if (status === 'accepted') {
                await _checkInitiatorBalanceSync('status=accepted')
            }

            if (status === 'signed') {
                ltInitiatorOpen = ae_logger.beginLog('initiator : Waiting for open ...')
                await _checkInitiatorBalanceSync('status=signed')
            }

            if (status === 'open') {
                try {
                    ae_logger.endLogOk(ltInitiatorOpen!, ltInitiatorOpen!.txt + ' : Opened!')

                    //
                    // Build create contract init call data
                    //

                    ltContractEncodeCallDataApi_CreateContract = ae_logger.beginLog('contractEncodeCallDataApi : createContract ...')
                    const createContractCallData = await uInitiator.contractEncodeCallDataAPI(contractSrc, "init", [], {backend : 'aevm'})
                    ae_logger.endLogOk(ltContractEncodeCallDataApi_CreateContract)

                    
                    //
                    // Create channel contract
                    //

                    _bothChArtificialInfo('Initiator creating channel contract')
                    
                    const VmVersion = 6
                    const AbiVersion = 1

                    ltCreateContract = ae_logger.beginLog(`createContract vmVersion=${VmVersion}, abiVersion=${AbiVersion} ...`)

                    var ctdata = await chInitiator.createContract({
                        code : compiledContract,
                        callData : createContractCallData,
                        deposit: 1000,
                        vmVersion: VmVersion,
                        abiVersion: AbiVersion
                    }, async (tx) => {
                        //console.log('...... createContract : sign')
                        return await uInitiator.signTransaction(tx)
                    })

                    if (ctdata.accepted) {
                        ae_logger.endLogOk(ltCreateContract, ltCreateContract.txt + ' : Accepted! address=' + ctdata.address)
                        _bothChArtificialInfo('Channel contract created and accepted')
                    } else {
                        // Not accepted
                        ae_logger.endLogError(ltCreateContract, ltCreateContract.txt + ' : NOT Accepted', '')
                        return
                    }

    
                    const contractAddress = ctdata.address
              
                    //
                    // Build call data
                    //
                    const callInfo = 'foo2(11)'

                    ltContractEncodeCallDataApi_Call = ae_logger.beginLog(`initiator : contractEncodeCallDataAPI : ${callInfo}`)
                    const callData =  await uInitiator.contractEncodeCallDataAPI(contractSrc, "foo2", ['11'], {backend : 'aevm'})
                    ae_logger.endLogOk(ltContractEncodeCallDataApi_Call)

                    //
                    // Call contract
                    //
                    _bothChArtificialInfo(`Calling ${callInfo} ...`)

                    ltCallContract = ae_logger.beginLog(`initiator : Channel callContract : ${callInfo}`)
                    const callContractResult = await chInitiator.callContract({
                        // FIXME: Add version with payable contract?
                        amount : 0,
                        callData : callData,
                        abiVersion : AbiVersion,
                        contract : contractAddress
                    }, (tx => uInitiator.signTransaction(tx)))
                    ae_logger.endLogOk(ltCallContract)
                    

                    //
                    // Get call result
                    //      

                    ltGetContractCall = ae_logger.beginLog(`initiator : Channel getContractCall : round=${chInitiator.round()}`)
                    const callResult = await chInitiator.getContractCall({
                        caller : initiatorId, 
                        contract : contractAddress, 
                        round : chInitiator.round()!
                    })
                    ae_logger.endLogOk(ltGetContractCall)

                    console.log('callResult=', callResult)
                
                    // 
                    // Decode call result
                    //
                    const decodedResult = await uInitiator.contractDecodeData(contractSrc, 'foo2', callResult.returnValue, callResult.returnType, {
                        backend : 'aevm'
                    })
                

                    console.log('decodedResult=', decodedResult)

                    _initiatorLog(`Call ${callInfo} = ${decodedResult}`)
                    _bothChArtificialInfo(`Call ${callInfo} = ${decodedResult}`)


                    if (true) {
                        const result = await chInitiator.getContractState(contractAddress)
                        console.log('getContractState : result=', result)
                    }

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
                
                } catch(e) {
                    _errorCleanup(e)
                }
            } // status === 'open'

        }) // .on('statusChanged', ...)

        chInitiator.on('onChainTx', async tx => {
            infoCb(buildChLogChainTx('initiator', tx))
            await _checkInitiatorBalanceSync('onChainTx')
        })

        chInitiator.on('stateChanged', async tx => {
            infoCb(buildChLogState('initiator', tx))
            await _checkInitiatorBalanceSync('stateChanged')
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
                _checkResponderBalanceAsync('status=connected')
            }

            if (status === 'disconnected') {
                _checkResponderBalanceAsync('status=disconnected')
            }

            if (status === 'halfSigned') {
                ltResponderOpen = ae_logger.beginLog('responder : Waiting for open ...')
                _checkResponderBalanceAsync('status=halfSigned')
            }

            if (status === 'open') {
                ae_logger.endLogOk(ltResponderOpen!, ltResponderOpen!.txt + ' : Opened!')

            }
        })

        chResponder.on('onChainTx', async tx => {
            infoCb(buildChLogChainTx('responder', tx))
            await _checkResponderBalanceSync('onChainTx')
        })

        chResponder.on('stateChanged', async tx => {
            infoCb(buildChLogState('responder', tx))
            await _checkResponderBalanceSync('stateChanged')
        })

        chResponder.on('message', msg => {
            _responderLog(`message : status=${chResponder.status()} : "${msg.info}"`)
            infoCb(buildChLogMessage('responder', msg))
        })
       
        
    } catch (e) {
        _errorCleanup(e)
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

    contractName : string
    contractSrc : string
}

class _StateChannelCallContractView extends React.PureComponent<Props, State> {
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
            responderId : '',

            contractName : 'state-channel-1-1.aes',
            //contractName : 'identity-contract.aes',
            contractSrc  : ''
        }

        this._onNewChannelStatus = this._onNewChannelStatus.bind(this)
        this._onEditorDocUpdate = this._onEditorDocUpdate.bind(this)
    }

    componentDidMount() {
        const s = this.state
        utils.getContract(s.contractName).then(result => {
            this.setState({
                contractSrc : result
            })
        })
    }

    render() {
        const p = this.props
        const s = this.state

        return <div className={clsx(p.classes.view, p.classes.contract1View)}>
            <Grid container spacing={3} >
                <Grid item xs={12}>
                    <NetworkConfiguration /> 
                </Grid>

                <Grid item xs={6}>
                    <Button variant='outlined' onClick={() => {
                        this._clearInitiatorAndResponderState()
                        _onCallContract(this._onNewChannelStatus, this.state.contractSrc)
                    }}>Call Contract</Button>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={p.classes.viewPaper}>
                        <SophiaEditor className='sophia-editor' 
                            doc={s.contractSrc}
                            onDocUpdate={this._onEditorDocUpdate}
                        />
                    </Paper>
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

    private _onEditorDocUpdate(doc : string) {
        console.log('_onEditorDocUpdate : doc=', doc)
        this._updateContractSrc(doc)
    }

    private _updateContractSrc(src : string) {
        this.setState({
            contractSrc : src
        })
    }
}

export default withStyles(styles)(_StateChannelCallContractView)