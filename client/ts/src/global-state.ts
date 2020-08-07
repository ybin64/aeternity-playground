import {combineReducers, createStore, Store} from 'redux'
import { connect as rr_connect} from "react-redux"

export const connect = rr_connect


import {AeNetworkConfig, AeNetworkInfo, LocalhostNetwork, TestNet1Network} from './ae-network'
import * as ae_wallet from './ae-wallet'
import * as ae_utils from './ae-utils'
import * as ae_logger from './ae-logger'



export type RuntimeConfig = {
    networks : AeNetworkInfo[]
}

type Balance = ae_wallet.Balance

type _ActionTypes = 
    'SET_RUNTIME_CONFIG' |
    'SET_MAIN_VIEW_NAME' | 
    'SELECT_NETWORK' |
    'SET_AE_LOGS' |
    'SET_ALICE_BALANCE' | 'SET_BOB_BALANCE' 

// -----------------------------------------------------------------------------

export type UIState = {
    runtimeConfig : RuntimeConfig
    mainViewName : string
    networkName : string
    networkConfig : AeNetworkConfig

    aliceBalance : Balance | null
    bobBalance   : Balance | null
    logs : ae_logger.LogItem[]
}


// -----------------------------------------------------------------------------
// Actions

type _UIAction = {
    type : _ActionTypes

    runtimeConfig : RuntimeConfig
    mainViewName : string
    networkName : string
    balance : Balance | null
    logs : ae_logger.LogItem[]
}

export function setRuntimeConfig(config : RuntimeConfig) : _UIAction {
    return {
        type : 'SET_RUNTIME_CONFIG',
        runtimeConfig : config
    } as _UIAction
}

export function setMainViewName(name : string) : _UIAction {
    return {
        type : 'SET_MAIN_VIEW_NAME',
        mainViewName : name
    } as _UIAction
}

export function selectNetwork(networkName : string) : _UIAction {
    return {
        type : 'SELECT_NETWORK',
        networkName : networkName
    } as _UIAction
}

export function setAeLogs(logs : ae_logger.LogItem[]) : _UIAction {
    return {
        type : 'SET_AE_LOGS',
        logs : logs
    } as _UIAction
}




// -----------------------------------------------------------------------------
// Reducers

const _defaultRuntimeConfig : RuntimeConfig = {
    networks : [LocalhostNetwork]
}
/*
const _networkConfigs : {[key in NetworkName] : AeNetworkConfig} = {
    'localhost' : {...LocalhostNetwork.config}
    //'testnet'   : {...TestNet1Network.config}
}
*/
const _defaultNetwork = {...LocalhostNetwork}
//const _defaultNetwork = {...TestNet1Network}

const ui = (state : UIState = {
    runtimeConfig : _defaultRuntimeConfig,
    mainViewName : '',
    networkName : _defaultNetwork.name,
    networkConfig : _defaultNetwork.config,
    aliceBalance : null,
    bobBalance   : null,
    logs : []
}, action : _UIAction) : UIState => {

    switch (action.type) {
        case 'SET_RUNTIME_CONFIG' : {
            let networkName = state.networkName
            let networkConfig = state.networkConfig

            if (action.runtimeConfig.networks.length > 0) {
                const nw = action.runtimeConfig.networks[0]
                networkName = nw.name
                networkConfig = nw.config
            }
            return {...state,
                runtimeConfig : action.runtimeConfig,
                networkName : networkName,
                networkConfig : networkConfig
            }
        }

        case 'SET_MAIN_VIEW_NAME' : {
            return {...state,
                mainViewName : action.mainViewName
            }
        }

        case 'SELECT_NETWORK' : {
            let ret = {...state}

            const network = state.runtimeConfig.networks.find(nw => nw.name === action.networkName)

            if (!network) {
                const errText = `Can't find network "${action.networkName}`
                console.error('global-state.ts : ' + errText)
                throw new Error(errText)
            }

            ret.networkName = action.networkName
            ret.networkConfig = network.config

            setTimeout(() => {
                // The api-cache will use the value we return here
                ae_utils.clearApiCache()
                checkCompilerVersion()
                updateAliceBalance()
                updateBobBalance()
            })

            return ret
        }

        case 'SET_AE_LOGS' : {
            return {...state,
                logs : action.logs
            }
        }

        case 'SET_ALICE_BALANCE' : {
            return {...state,
                aliceBalance : action.balance
            }
        }

        case 'SET_BOB_BALANCE' : {
            return {...state,
                bobBalance : action.balance
            }
        }



        default : 
            return state
    }
}

// -----------------------------------------------------------------------------

function _setBalance(action : _ActionTypes, balance : Balance | null) {
    dispatch({
        type : action,
        balance : balance
    } as _UIAction)
}

function _updateBalance(action : _ActionTypes, address : string) {
    const token = ae_logger.beginLog(`global-state : getBalance [${ae_wallet.getWalletName(address)}]`)

    ae_utils.getBalance(address).then(result => {
        ae_logger.endLogOk(token, token.txt + ' ' + result)
        _setBalance(action, result)
    }).catch(e => {
        ae_logger.endLogError(token, token.txt, e)
        if (ae_utils.isAccountNotFoundError(e)) {
            _setBalance(action, null)
        } else {
            ae_utils.logError(e)
            _setBalance(action, null)
        }
    })

}

export function updateAliceBalance() {
    _updateBalance('SET_ALICE_BALANCE', ae_wallet.AliceWallet.keypair.publicKey)
}

export function updateBobBalance() {
    _updateBalance('SET_BOB_BALANCE', ae_wallet.BobWallet.keypair.publicKey)
}

export function checkCompilerVersion() {
    const token = ae_logger.beginLog('global-state : checkCompilerVersion')
    ae_utils.getCachedUniversal().then(universal => {
        universal.getCompilerVersion().then(version => {
            ae_logger.endLogOk(token, token.txt + ' : ' + version)
        }).catch(e => {
            ae_logger.endLogError(token, token.txt, e)
        })
    }).catch(e => {
        ae_logger.endLogError(token, token.txt, e)
    })
    
}

// -----------------------------------------------------------------------------

export type AppState = {
    ui : UIState
}

const reducers = combineReducers<AppState>({
    ui
})


let store = createStore(reducers)

export function getStore() : Store<AppState> {
    return store
}


export function dispatch(action: _UIAction) {
    store.dispatch(action)
}

export function getUiState() : UIState {
    return store.getState().ui
}

export default reducers