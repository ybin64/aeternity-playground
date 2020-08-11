import * as ts_events from 'ts-events'

import * as ae_network from './ae-network'

export interface UINodeEvent  {
    type : 'node-change'
    networkName : string
    networkConfig : ae_network.AeNetworkConfig
}
export type UINodeEventCallback = (e: UINodeEvent) => void

const _uiNodeEvents = new ts_events.SyncEvent<UINodeEvent>()

export function addUINodeEventEventCallback(cb : UINodeEventCallback) {
    _uiNodeEvents.attach(cb)
}

export function removeUINodeEventCallback(cb : UINodeEventCallback) {
    _uiNodeEvents.detach(cb)
}

export function nodeChange(networkName : string, networkConfig : ae_network.AeNetworkConfig) {
    _uiNodeEvents.post({
        type : 'node-change',
        networkName : networkName,
        networkConfig : networkConfig
    })
}


