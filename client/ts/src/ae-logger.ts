import * as global_state from './global-state'
import * as ae_utils from './ae-utils'
import * as ae_network from './ae-network'
import { CSSProperties } from '@material-ui/core/styles/withStyles'

export type LoggerToken = {
    id  : number
    beginTime : Date
    txt : string
}

export type LogArgs = {
    css? : CSSProperties
}

export type LogItem = {
    id : number
    network : string

    beginTime : Date
    endTime?  : Date
    text      : string
    endText   : string
    errorText? : string
    state : 'begin' | 'end-ok' | 'end-error'

    logArgs? : LogArgs
}

function _newToken(txt : string) : LoggerToken {
    return {
        id : _id++,
        beginTime : new Date(),
        txt : txt
    }
}




export function log(txt : string, args? : LogArgs) {
    const logItem = _createBeginLogItem(_newToken(txt), args)

    logItem.state = 'end-ok'

    _addAndDispatchLogItem(logItem)
}

export function error(txt : string) {
    const logItem = _createBeginLogItem(_newToken(txt))

    logItem.state = 'end-error'

    _addAndDispatchLogItem(logItem)
}


export function beginLog(txt: string) : LoggerToken {
    const token = _newToken(txt)
    _addBeginLog(token)
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


export function clearLogs() {
    _logItems = []
    _id = 0
}

function _findLogItem(items: LogItem[], id: number) : LogItem {
    for (let item of items) {
        if (item.id === id) {
            return item
        }
    }

    throw new Error(`Can't find log item with id=${id}`)
}

function _createBeginLogItem(token : LoggerToken, args? : LogArgs) : LogItem {
    const ret : LogItem = {
        id : token.id,
        network : global_state.getUiState().networkName,
        beginTime : token.beginTime,
        state : 'begin',
        text : token.txt,
        endText : ''
    }

    if (args) {
        ret.logArgs = args
    }

    return ret
}

function _addAndDispatchLogItem(item : LogItem) {
    let items = _logItems.slice()

    items.push(item)

    _logItems = items
    global_state.dispatch(global_state.setAeLogs(_logItems))
}

function _addBeginLog(token : LoggerToken) {
    _addAndDispatchLogItem(_createBeginLogItem(token))
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


