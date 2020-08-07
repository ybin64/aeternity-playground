import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Provider } from "react-redux"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
  

import {getStore} from './global-state'

import Dashboard, {drawerListItems, DrawerListItemData} from './templates/Dashboard'
import MainView from './views/MainView'
import TransferAliceBobView from './views/TransferAliceBobView'
import Contract1View from './views/Contract1View'
import StateChannelSendMessageView from './views/StateChannelSendMessageView'
import StateChannelCallContractView from './views/StateChannelCallContractView'

import DashboardIcon from '@material-ui/icons/Dashboard'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import Contract1Icon from '@material-ui/icons/Assignment'
import StateChannelSendMessageIcon from '@material-ui/icons/LinearScale'
import StateChannelCallContractIcon from '@material-ui/icons/LinearScale'


import {generateKeyPair} from '@aeternity/aepp-sdk/es/utils/crypto'

import * as example_code from './example-code'

import * as global_state from './global-state'
import * as utils from './utils'


/**
 * Using .html extension in links due to webpack dev-server
 * 
 * NOTE: Don't forget to add an .html file in the ./views directory when a view is added
 */

const _drawerItems : DrawerListItemData[] = [
    {text : 'Dashboard', 
        link : '/views/dashboard.html', icon : <DashboardIcon />},
    {text : 'Alice <-> Bob Transfer Funds', 
        link : '/views/transfer-alice-bob.html', icon : <ShoppingCartIcon />},
    {text : 'Contract - 1', 
        link : '/views/contract-1.html', icon : <Contract1Icon />},
    {text : 'State Channel - Send Message', 
        link : '/views/state-channel-send-message.html', icon : <StateChannelSendMessageIcon />},
    {text : 'State Channel - Call Contract', 
        link : '/views/state-channel-call-contract.html', icon : <StateChannelCallContractIcon />},

]
const drawerMainListItems = drawerListItems(_drawerItems)


function _getMainViewName(path : string) {
    let name = ''

    for (let item of _drawerItems) {
        if (item.link === path) {
            name = item.text
            break
        }
    }

    return name
}



function _Route(props : {path : string, component : React.ComponentType<any>}) {
    return <Route 
        path={props.path}
        render={() => {
            let path = props.path
            if (path === '/') {
                path = _drawerItems[0].link
            }
     
            setTimeout(() => {
                // Will cause React warning "..." if not setting the main view name in the setTimeout
                // FIXME: This feels a little brittle
                global_state.dispatch(global_state.setMainViewName(_getMainViewName(path)))
            })

            return <props.component />
        }}
    />
}


function _App(p: {}) {
    return <Router>
        <Dashboard drawerMainListItems={drawerMainListItems}>       
            <Switch>
                <_Route path="/views/dashboard.html" component={MainView} />
                <_Route path="/views/transfer-alice-bob.html" component={TransferAliceBobView} />
                <_Route path="/views/contract-1.html" component={Contract1View} />
                <_Route path="/views/state-channel-send-message.html" component={StateChannelSendMessageView} />
                <_Route path="/views/state-channel-call-contract.html" component={StateChannelCallContractView} />
                <_Route path="/" component={MainView} />
            </Switch>
        </Dashboard>
    </Router>
}

const store = getStore();

async function _init() {

    try {
        const config = await utils.readRuntimeConfigFromFile()
        global_state.dispatch(global_state.setRuntimeConfig(config))
    } catch (e) {
        console.error('Failed to load runtime-config.json : e=', e)
    }

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


setTimeout( () => {
    //example_code.callContractEntryPoint1()
}, 1000)