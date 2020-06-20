import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Provider } from "react-redux"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
  

import {getStore} from './global-state'

import Dashboard, {drawerListItems} from './templates/Dashboard'
import MainView from './views/MainView'
import TransferAliceBobView from './views/TransferAliceBobView'

import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import {generateKeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'


import * as global_state from './global-state'

// During development
//console.log('New keypair : ', generateKeyPair())


const drawerMainListItems = drawerListItems([
    {text : 'Dashboard', 
        link : '/dashboard', icon : <DashboardIcon />},
    {text : 'Alice <-> Bob Transfer Funds', 
        link : '/transfer-alice-bob', icon : <ShoppingCartIcon />}
])


function _App(p: {}) {
    return <Router>
        <Dashboard drawerMainListItems={drawerMainListItems}>       
            <Switch>
                <Route path="/about">
                    <div>about</div>
                </Route>
                <Route path="/dashboard">
                    <MainView />
                </Route>
                <Route path="/transfer-alice-bob">
                    <TransferAliceBobView />
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
    global_state.updateAliceBalance()
    global_state.updateBobBalance()
}, 500)