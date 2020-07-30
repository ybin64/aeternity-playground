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

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'
import * as ae_utils from '../ae-utils'
import * as ae_logger from '../ae-logger'

import * as utils from '../utils'
import CallSophiaFunction from '../components/CallSophiaFunction'


import * as sophia_parser from 'aesophia-parser'


const _errorLoggerToken = (t : ae_logger.LoggerToken | false) => {
    if (t) {
        const endOkText = ae_logger.endOkText(t)

        if (endOkText) {
            ae_logger.endLogError(t, endOkText, '--error--')
        } else {
            ae_logger.endLogError(t, t.txt, '--error--')
        }
    }
}

/*
function _Test1() {

    const _onTest1 = async () => {
        console.log('_onTest1')

        const universal = await ae_utils.getCachedUniversal()
        console.log('universal=', universal)

        const ver = await universal.getCompilerVersion()
        console.log('ver=', ver)

        
        utils.getContract('contract-1.aes').then(src => {
            console.log('src=', src)

            universal.contractCompile(src).then(result => {
                console.log('contractCompile : result=', result)
                
                const tDeploy = ae_logger.beginLog('deploy')
                result.deploy([]).then(deployResult => {
                    console.log('deployResult=', deployResult)
                    const r = deployResult.result

                    ae_logger.endLogOk(tDeploy, tDeploy.txt + ` : gasPrice=${r.gasPrice} : gasUsed=${r.gasUsed} : height=${r.height}`)

                    const tCall = ae_logger.beginLog('call')

                    deployResult.call('foo', []).then(async callResult => {
                        console.log('callResult=', callResult)
                        console.log('callResult.result=', callResult.result)
                        ae_logger.endLogOk(tCall, tCall.txt)

                        console.log('callResult.decode()=', await callResult.decode())
                    }).catch(e => {
                        console.error('callResult : error : e=', e)
                        ae_logger.endLogError(tCall, tCall.txt, e)
                    })
                }).catch(e => {
                    console.error('deployResult error : e=', e)
                    ae_logger.endLogError(tDeploy, tDeploy.txt, e)
                })

            }).catch(e => {
                console.error('contractCompile : e=', e)
            })
        }).catch( e => {
            console.error('e=', e)
        })
    
    }



    const _onTest2 = async () => {
        console.log('_onTest1')
        const universal = await ae_utils.getCachedUniversal()
        console.log('universal=', universal)

        const tTest2 = ae_logger.beginLog('_onTest2')

        let tDeploy  : ae_logger.LoggerToken | false = false
        let tCallFoo : ae_logger.LoggerToken | false = false
        let tCallFooDecode : ae_logger.LoggerToken | false = false
        let tCallBar : ae_logger.LoggerToken | false = false
        let tCallBarDecode : ae_logger.LoggerToken | false = false
        

        try {
            const ContractName = 'contract-1.aes'
            const contractSrc = await utils.getContract(ContractName)
            const compileResult = await universal.contractCompile(contractSrc)

            tDeploy = ae_logger.beginLog(`Deploy ${ContractName}`)
            const deployResult = await compileResult.deploy([])
            ae_logger.endLogOk(tDeploy, tDeploy.txt)


            
            tCallFoo = ae_logger.beginLog('Call foo()')
            const callFooResult = await deployResult.call('foo', [])
            //ae_logger.endLogOk(tCallFoo, tCallFoo.txt + ' : returnValue=' + callFooResult.result.returnValue)
            const rFoo = callFooResult.result
            ae_logger.endLogOk(tCallFoo, `${tCallFoo.txt} : returnValue=${rFoo.returnValue} : gasPrice=${rFoo.gasPrice} : gasUised=${rFoo.gasUsed} : height=${rFoo.height}`)


            tCallFooDecode = ae_logger.beginLog(`foo() decode : ${callFooResult.result.returnValue} : `)
            const callFooDecode = await callFooResult.decode()
            ae_logger.endLogOk(tCallFooDecode, tCallFooDecode.txt + ' : ' + callFooDecode)
            
            

            tCallBar = ae_logger.beginLog('Call bar()')
            const callBarResult = await deployResult.call('bar', ['2'])
            const rBar = callBarResult.result
            ae_logger.endLogOk(tCallBar, `${tCallBar.txt} : returnValue=${rBar.returnValue} : gasPrice=${rBar.gasPrice} : gasUised=${rBar.gasUsed} : height=${rBar.height}`)

            
            tCallBarDecode = ae_logger.beginLog('bar() decode')
            const callBarDecode = await callBarResult.decode()
            ae_logger.endLogOk(tCallBarDecode, tCallBarDecode.txt + ' : ' + callBarDecode)
            

            ae_logger.endLogOk(tTest2)
        } catch (e) {
            console.error('_onTest2 : Error : e=', e)
            ae_logger.endLogError(tTest2, tTest2.txt, e)
            _errorLoggerToken(tDeploy)
            _errorLoggerToken(tCallFoo)
            _errorLoggerToken(tCallFooDecode)
            _errorLoggerToken(tCallBar)
            _errorLoggerToken(tCallBarDecode)
        }

    }

    return <div>
        <Button onClick={_onTest1}>Test 1</Button>
        <Button onClick={_onTest2}>Test 2</Button>
    </div>
}
*/

// -----------------------------------------------------------------------------
//


// -----------------------------------------------------------------------------
//

interface Props extends PropsWithStyles {
    readonly networkName? : ae_network.NetworkName
}

interface State {
    contractName : string
    doc      : string
    ast?     : sophia_parser.AstItem
}

class _Contract1View extends React.PureComponent<Props, State> {
    constructor(props : Props, ctx? : any) {
        super(props, ctx)

        this.state = {
            contractName : 'contract-1.aes',
            doc : 'foo bar'
        }

        this._onCallEntryPoint = this._onCallEntryPoint.bind(this)
    }

    componentDidMount() {
        this._readContract(this.state.contractName)
    }

    render() {
        const p = this.props
        const s = this.state

        return <div className={clsx(p.classes.view, p.classes.contract1View)}>
            <Grid container spacing={3} >
                <Grid item xs={12}>
                    <Paper className={p.classes.viewPaper}>
                        <NetworkConfiguration />
                    </Paper>
                </Grid>

{/*}
                
                <Grid item xs={12}>
                    <_Test1 />
                </Grid>
*/}

                <Grid item xs={6}>
                    <Paper className={p.classes.viewPaper}>
                        <SophiaEditor className='sophia-editor' doc={s.doc}/>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={p.classes.viewPaper}>
                        <CallSophiaFunction className='sophia-function' 
                            ast={s.ast}
                            onCallEntryPoint={this._onCallEntryPoint}
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

    private _readContract(contractName : string) {
        utils.getContract(contractName).then(doc => {
            this._updateDoc(doc)
        })
    }

    private _updateDoc(doc : string) {
        const scanner = new sophia_parser.Scanner(doc)
        const result = sophia_parser.parse(scanner)

        this.setState({
            doc : doc,
            ast : result.ast
        })  
    }

    private async _onCallEntryPoint(entryPointName : string, args : string[]) {
        const universal = await ae_utils.getCachedUniversal()

        const argsText = args.join(', ')
        const tMain = ae_logger.beginLog(`Call entrypoint ${entryPointName}(${argsText})`)

        let tDeploy  : ae_logger.LoggerToken | false = false
        let tCall : ae_logger.LoggerToken | false = false
        let tCallDecode : ae_logger.LoggerToken | false = false
        

        try {
            const compileResult = await universal.contractCompile(this.state.doc)

            tDeploy = ae_logger.beginLog(`Deploy ${this.state.contractName}`)
            const deployResult = await compileResult.deploy([])
            ae_logger.endLogOk(tDeploy, tDeploy.txt)

  
            tCall = ae_logger.beginLog(`Call ${entryPointName}(${argsText})`)
            const callResult = await deployResult.call(entryPointName, args)
            const rCall = callResult.result
            ae_logger.endLogOk(tCall, `${tCall.txt} : returnValue=${rCall.returnValue} : gasPrice=${rCall.gasPrice} : gasUised=${rCall.gasUsed} : height=${rCall.height}`)


            tCallDecode = ae_logger.beginLog(`${tCall.txt} : decode : ${callResult.result.returnValue}`)
            const callDecode = await callResult.decode()
            ae_logger.endLogOk(tCallDecode, tCallDecode.txt + ' = ' + callDecode)
            
            ae_logger.endLogOk(tMain)
        } catch (e) {
            ae_logger.endLogError(tMain, tMain.txt, e)

            _errorLoggerToken(tDeploy)
            _errorLoggerToken(tCall)
            _errorLoggerToken(tCallDecode)
        }
    }


}

export default global_state.connect((state : global_state.AppState) : Partial<Props> => ({
    networkName : state.ui.networkName
}))(withStyles(styles)(_Contract1View))