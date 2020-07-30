import * as global_state from './global-state'
import * as ae_utils from './ae-utils'
import * as ae_network from './ae-network'

export type LoggerToken = {
    id  : number
    beginTime : Date
    txt : string
}

export type LogItem = {
    id : number
    network : ae_network.NetworkName

    beginTime : Date
    endTime?  : Date
    text      : string
    endText   : string
    errorText? : string
    state : 'begin' | 'end-ok' | 'end-error'
}

export function beginLog(txt: string) : LoggerToken {
    const token : LoggerToken = {
        id : _id++,
        beginTime : new Date(),
        txt : txt
    }

    _addBeginLog(token)

    //console.info(`${_prefix('BEGIN      ', token)}${txt}`)

    return token
}

export function endLogOk(token: LoggerToken, txt? : string) {
    //console.info(`${_prefix('END OK     ', token)}${txt}`)

    if (txt === undefined) {
        txt = token.txt
    }

    _addEndLogOk(token, txt)
}

export function endLogError(token: LoggerToken, txt : string, err : any) {
    //console.error(`${_prefix('END ERROR', token)}${txt}`)
    _addEndLogError(token, txt, err)
}

export function endOkText(token : LoggerToken) : string | false {
    const item = _findLogItem(_logItems, token.id)
    if (item.endText === '') {
        return false
    } else {
        return item.endText
    }
}

// -----------------------------------------------------------------------------
// Privat functions

function _prefix(type: string, token : LoggerToken) {
    return `ae_logger : [${type}] : ${token.id} : `
}



let _logItems : LogItem[] = []
let _id = 0


function _findLogItem(items: LogItem[], id: number) : LogItem {
    for (let item of items) {
        if (item.id === id) {
            return item
        }
    }

    throw new Error(`Can't find log item with id=${id}`)
}

function _addBeginLog(token : LoggerToken) {
    let items = _logItems.slice()

    items.push({
        id : token.id,
        network : global_state.getUiState().networkName,
        beginTime : token.beginTime,
        state : 'begin',
        text : token.txt,
        endText : ''
    })

    _logItems = items
    global_state.dispatch(global_state.setAeLogs(_logItems))
}

function _addEndLogOk(token : LoggerToken, txt : string) {
    let items = _logItems.slice()

    let item = _findLogItem(items, token.id)
    item.endTime = new Date()
    item.state = 'end-ok'
    item.endText = txt

    _logItems = items
    global_state.dispatch(global_state.setAeLogs(_logItems))

}


function _addEndLogError(token : LoggerToken, txt : string, err : any) {
    let items = _logItems.slice()

    let item = _findLogItem(items, token.id)
    item.text = txt
    item.endTime = new Date()
    item.state = 'end-error'
    item.endText = txt

    const errInfo = ae_utils.getErrorInfo(err)

    _logItems = items
    //ae_utils.logError(err)
    item.errorText = errInfo.text

    global_state.dispatch(global_state.setAeLogs(_logItems))
}


