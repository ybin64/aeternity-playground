import {combineReducers, createStore, Store} from 'redux'
import { connect as rr_connect} from "react-redux"

export const connect = rr_connect


import {AeNetworkConfig, LocalhostNetwork, TestNet1Network, NetworkName} from './ae-network'
import * as ae_wallet from './ae-wallet'
import * as ae_utils from './ae-utils'
import * as ae_logger from './ae-logger'

type _ActionTypes = 
    'SELECT_NETWORK' |
    'SET_AE_LOGS' |
    'SET_ALICE_BALANCE' | 'SET_BOB_BALANCE' 

// -----------------------------------------------------------------------------

export type UIState = {
    networkName : NetworkName
    networkConfig : AeNetworkConfig

    aliceBalance : BigInt | null
    bobBalance   : BigInt | null
    logs : ae_logger.LogItem[]
}


// -----------------------------------------------------------------------------
// Actions

type _UIAction = {
    type : _ActionTypes

    networkName : NetworkName
    balance : BigInt | null
    logs : ae_logger.LogItem[]
}

export function selectNetwork(networkName : NetworkName) : _UIAction {
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

const _networkConfigs : {[key in NetworkName] : AeNetworkConfig} = {
    'localhost' : {...LocalhostNetwork.config},
    'testnet'   : {...TestNet1Network.config}
}
const _defaultNetwork = {...LocalhostNetwork}
//const _defaultNetwork = {...TestNet1Network}

const ui = (state : UIState = {
    networkName : _defaultNetwork.name,
    networkConfig : _defaultNetwork.config,
    aliceBalance : null,
    bobBalance   : null,
    logs : []
}, action : _UIAction) : UIState => {

    switch (action.type) {
        case 'SELECT_NETWORK' : {
            let ret = {...state}
            ret.networkName = action.networkName
            ret.networkConfig = _networkConfigs[action.networkName]

            setTimeout(() => {
                // The api-cache will use the value we return here
                ae_utils.clearApiCache()
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

function _setBalance(action : _ActionTypes, balance : BigInt | null) {
    dispatch({
        type : action,
        balance : balance
    } as _UIAction)
}

function _updateBalance(action : _ActionTypes, address : string) {
    const token = ae_logger.beginLog(`global-state : getBalance [${ae_wallet.getWalletName(address)}]`)

    ae_utils.getBalance(address).then(result => {
        ae_logger.endLogOk(token, token.txt + ' ' + result)
        _setBalance(action, BigInt(result))
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