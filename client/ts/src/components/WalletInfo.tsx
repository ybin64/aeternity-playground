import * as React from 'react'
import clsx from 'clsx'

import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Badge from '@material-ui/core/Badge'
import Popover from '@material-ui/core/Popover'

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'
import * as ae_utils from '../ae-utils'

import {PropsWithStyles, withStyles, styles} from '../mui-styles'

import {AeWalletConfig, AliceWallet, BobWallet, Balance} from '../ae-wallet'
import AeBalance from './AeBalance'

function _WalletHeader(p : {
    name : string
    warningText? : string
}) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event : any) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handlePopoverClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const content = <Typography variant='h5' color="textPrimary" gutterBottom>
        {p.name} - Wallet
    </Typography>

    if (p.warningText) {
        return <div>
            <Badge 
                badgeContent={'note'} color="error"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            >
                {content}
            </Badge>

            <Popover
//                id="mouse-over-popover"

                style = {{
                    pointerEvents : 'none'
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Typography style={{
                    padding : '2px'
                }}>{p.warningText}</Typography>
            </Popover>
        </div>
    } else {
        return content
    }
}

// -----------------------------------------------------------------------------

interface Props extends PropsWithStyles {
    readonly wallet : AeWalletConfig
    readonly globalNetwork : boolean
    readonly balance? :  Balance | null
}



function _WalletInfo(p : Props) {
    let warningText : string | undefined = undefined
    let balance : React.ReactElement | undefined = undefined


    if (p.globalNetwork) {
        warningText = `Using a global network! Wallet balance may be changed by other users`
    }

    if ((p.balance === null) || (p.balance === undefined)) {
        balance = <span>-</span>
    } else {
        balance = <AeBalance balance={p.balance} noColor marginLeft='3px' />
    }

    return <Card className={p.classes.component}>
        <CardContent>
            <_WalletHeader name={p.wallet.name} warningText={warningText}/>

            <Typography color="textPrimary" gutterBottom>
                Public Key:
            </Typography>

            <Typography color="textSecondary" gutterBottom>
                {p.wallet.keypair.publicKey}
            </Typography>

            <Typography color="textPrimary" gutterBottom>
                Balance:
            </Typography>

            <Typography color="textSecondary" gutterBottom>
                {balance}
            </Typography>
        </CardContent>
    </Card>
}


const WalletInfo = withStyles(styles)(_WalletInfo)
export default WalletInfo

// -----------------------------------------------------------------------------

interface WalletWithGlobalCheckProps {
    networkName? : string
    balance? : Balance | null
}

function _walletWithGlobalCheck(wallet : AeWalletConfig, valueKey : 'aliceBalance' | 'bobBalance') {
    return global_state.connect((state : global_state.AppState) : Partial<WalletWithGlobalCheckProps> => {
        return {
            networkName : state.ui.networkName,
            balance : state.ui[valueKey]
        }
    })((p : WalletWithGlobalCheckProps) => {
        return <WalletInfo wallet={wallet} balance={p.balance} globalNetwork={p.networkName != 'localhost'} />  
    })
}

export const AliceWalletInfo = _walletWithGlobalCheck(AliceWallet, 'aliceBalance')
export const BobWalletInfo = _walletWithGlobalCheck(BobWallet, 'bobBalance')