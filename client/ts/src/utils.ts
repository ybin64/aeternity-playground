import * as global_state from './global-state'

export function date2TimeStr(d : Date) : string {
    return `${_pzp(d.getHours(), 2)}:${_pzp(d.getMinutes(), 2)}:${_pzp(d.getSeconds(), 2)}.${_pzp(d.getMilliseconds(), 3)}`
}

export function msToStr(milliseconds : number) : string {
    if (milliseconds < 1000) {
        return milliseconds + ' ms'
    }

    const s = Math.floor(milliseconds / 100) / 10
    return s + ' s'
}



export async function readRuntimeConfigFromFile() : Promise<global_state.RuntimeConfig> {
    const rsp = await fetch('/runtime-config.json')

    if (!rsp.ok) {
        console.error('Cant find runtime-config.json : rsp=', rsp)

        throw new Error(`Can't find runtime-config.json`)
    }

    const j = rsp.json()

    // FIXME: Add basic verification

    return j
}
export async function getContract(contractName : string) : Promise<string> {
    const rsp = await fetch('/contracts/' + contractName)
  
    if (!rsp.ok) {
        throw new Error(`Can't find contract "${contractName}"`)
    }

    return rsp.text()
}

// -----------------------------------------------------------------------------
//

/**
 * Prefix zero pad
 * @param value 
 * @param nofZeros 
 */
function _pzp(value : number, nofZeros : number) : string {
    let ret = '' + value
    while (ret.length < nofZeros) {
        ret = '0' + ret
    }
    return ret
}