import * as React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import {PropsWithStyles, withStyles, styles} from '../mui-styles'

import NetworkConfiguration from '../components/NetworkConfiguration'

import {AliceWalletInfo, BobWalletInfo} from '../components/WalletInfo'
import AeLogs from '../components/AeLogs'

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'


interface Props extends PropsWithStyles {
    readonly networkName? : ae_network.NetworkName
}

function _MainView(p : Props) {
    return <div className={p.classes.view}>
        <Grid container spacing={3} >
            <Grid item xs={12}>
                <Paper className={p.classes.viewPaper}>
                    <NetworkConfiguration />
                </Paper>
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

export default global_state.connect((state : global_state.AppState) : Partial<Props> => ({
    networkName : state.ui.networkName
}))(withStyles(styles)(_MainView))