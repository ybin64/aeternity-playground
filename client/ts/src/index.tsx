import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Provider } from "react-redux"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
  

import {getStore} from './global-state'

import Dashboard, {drawerListItems} from './templates/Dashboard'
import MainView from './views/MainView'
import TransferAliceBobView from './views/TransferAliceBobView'
import Contract1View from './views/Contract1View'

import DashboardIcon from '@material-ui/icons/Dashboard'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import Contract1Icon from '@material-ui/icons/Assignment'

import {generateKeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'


import * as global_state from './global-state'

// During development
//console.log('New keypair : ', generateKeyPair())

/**
 * Using .html extension in links due to webpack dev-server
 * 
 * NOTE: Don't forget to add files in the ./views directory
 */
const drawerMainListItems = drawerListItems([
    {text : 'Dashboard', 
        link : '/views/dashboard.html', icon : <DashboardIcon />},
    {text : 'Alice <-> Bob Transfer Funds', 
        link : '/views/transfer-alice-bob.html', icon : <ShoppingCartIcon />},
    {text : 'Contract - 1', 
        link : '/views/contract-1.html', icon : <Contract1Icon />}
])


function _App(p: {}) {
    return <Router>
        <Dashboard drawerMainListItems={drawerMainListItems}>       
            <Switch>
                <Route path="/about">
                    <div>about</div>
                </Route>
                <Route path="/views/dashboard.html">
                    <MainView />
                </Route>
                <Route path="/views/transfer-alice-bob.html">
                    <TransferAliceBobView />
                </Route>
                <Route path="/views/contract-1.html">
                    <Contract1View />
                </Route>
                <Route path="/">
                    <MainView />
                </Route>
            </Switch>
        </Dashboard>
    </Router>
}


const store = getStore();

function _init() {
    ReactDOM.render(
        <Provider store={store} >
            <_App />        
        </Provider>
        , 
        document.getElementById('main')
    )
}

_init()

setTimeout(() => {
    global_state.checkCompilerVersion()
    global_state.updateAliceBalance()
    global_state.updateBobBalance()
}, 500)