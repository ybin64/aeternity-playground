import * as React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'

import {PropsWithStyles, withStyles, styles} from '../mui-styles'

import {AliceWalletInfo, BobWalletInfo} from '../components/WalletInfo'

import AeLogs from '../components/AeLogs'

import {Ae} from '@aeternity/aepp-sdk/es/ae'

import * as global_state from '../global-state'
import * as global_event from '../global-event'

import * as ae_wallet from '../ae-wallet'
import * as ae_utils from '../ae-utils'
import * as ae_logger from '../ae-logger'

interface _TransferToProps extends PropsWithStyles {
    readonly name : string,
    readonly address : string
    readonly ae? : Ae
    readonly onAfterTransfer : () => void
}

function __TransferTo(p : _TransferToProps) {
    const [amount, setAmount] = React.useState('1000000000000000000');

    const _onTransfer = () => {
        const token = ae_logger.beginLog('_onTransfer')

        console.log('_onTransfer : p.ae=', p.ae)
        ae_utils.spend(amount, p.address, p.ae).then(result => {
            //console.log('_onTransfer : result=', result)
            ae_logger.endLogOk(token, token.txt)
            p.onAfterTransfer()
        }).catch(e => {
            console.error('_onTransfer ... : e=', e)
            ae_logger.endLogError(token, token.txt, e)
        })
    }

    return <Card className={p.classes.component}>
        <CardContent>
            <Typography variant='h5' gutterBottom>
                To <span>{p.name}</span>
            </Typography>
            <TextField className={p.classes.noUnderlineTextField}
                label='Amount' 
                defaultValue={amount} 
                fullWidth={true}
                InputProps={{
                    //readOnly : true
                }}
            />
        </CardContent>
        <CardActions>
            <Button size="small" color="primary" onClick={_onTransfer}>
                Transfer
            </Button>
      </CardActions>
    </Card>
}

const _TransferTo = withStyles(styles)(__TransferTo)

// -----------------------------------------------------------------------------

interface Props extends PropsWithStyles {
}

interface State {
    aeAlice? : Ae
    aeBob?   : Ae
}

class _TransferAliceBobView extends React.PureComponent<Props, State> {

    constructor(props : Props, ctx?: any) {
        super(props, ctx)
        this.state = {

        }

        this._onAfterTransfer = this._onAfterTransfer.bind(this)
        this._nodeChangeCallback = this._nodeChangeCallback.bind(this)
    }

    componentDidMount() {
        global_event.addUINodeEventEventCallback(this._nodeChangeCallback)
        setTimeout(async () => {
            await this._updateAe()
        })
    }

    componentWillUnmount() {
        global_event.removeUINodeEventCallback(this._nodeChangeCallback)
    }

    render() {
        const p = this.props
       
        return <div className={p.classes.view}>
            <Grid container spacing={3} >
                <Grid item xs={6}>
                    <_TransferTo 
                        ae={this.state.aeAlice}
                        name='Bob' 
                        address={ae_wallet.BobWallet.keypair.publicKey} 
                        onAfterTransfer={this._onAfterTransfer}
                    />     
                </Grid>

                <Grid item xs={6}>
                    <_TransferTo 
                        ae={this.state.aeBob}
                        name='Alice' 
                        address={ae_wallet.AliceWallet.keypair.publicKey} 
                        onAfterTransfer={this._onAfterTransfer}/>
                </Grid>
                
                <Grid item xs={6}>
                    <AliceWalletInfo />
                </Grid>

                <Grid item xs={6}>
                    <BobWalletInfo />
                </Grid>

                <Grid item xs={12}>
                    <Paper className={p.classes.viewPaper}>
                        <AeLogs />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    }

    private async _updateAe() {
        const networkConfig = global_state.getUiState().networkConfig
        const aeAlice = await ae_utils.getUniversal(networkConfig, ae_wallet.AliceWallet.keypair)
        const aeBob = await ae_utils.getUniversal(networkConfig, ae_wallet.BobWallet.keypair)

        this.setState({
            aeAlice : aeAlice,
            aeBob   : aeBob
        })
    }

    private _onAfterTransfer = () => {
        global_state.updateAliceBalance()
        global_state.updateBobBalance()
    }

    private _nodeChangeCallback(e : global_event.UINodeEvent) {
        this._updateAe()
    }
}

export default withStyles(styles)(_TransferAliceBobView)