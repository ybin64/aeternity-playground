import * as React from 'react'
import * as ReactDOM from 'react-dom'

import clsx from 'clsx'

import Typography from '@material-ui/core/Typography'

import * as mui_styles from '../mui-styles'
import { OnEventCbArg_StatusChanged } from '@aeternity/aepp-sdk/es/channel'

import * as utils from '../utils'
import * as ae_wallet from '../ae-wallet'

import {ChannelStateItem} from '../state-channel-utils'
import AeBalance from './AeBalance'


// -----------------------------------------------------------------------------

type _ChannelItemProps = {
    readonly startTime      : Date
    readonly item           : ChannelStateItem
    readonly showBalanceDiffStart : boolean
    readonly scrollIntoView? : boolean
}

class _ChannelItem extends React.PureComponent<_ChannelItemProps> {

    componentDidMount() {
        const ref = ReactDOM.findDOMNode(this) as HTMLDivElement

        if (this.props.scrollIntoView) {
            ref.scrollIntoView()        
        }
    }
    render() {
        const p = this.props
        const balanceMarginLeft = '2px'

        const item = p.item
        const timeMs = item.time.getTime() - p.startTime.getTime()
        let info : React.ReactElement | string | number = ''

        let rowClass = ''

        if (item.type === 'status') {
            info = item.status!
        } else if (item.type === 'message') {
            info = item.message!
        } else if (item.type === 'balance') {
            const bitems : (React.ReactElement | React.ReactText)[] = []
            let key = 1000

            bitems.push(<AeBalance key={key++} balance={item.balance!} noColor marginLeft={balanceMarginLeft}/>)
            bitems.push(' : ')
            bitems.push(item.info!)

            if (item.balanceDiffPrev) {
                bitems.push(' : ΔPrev ')
                bitems.push(<AeBalance key={key++} balance={item.balanceDiffPrev} marginLeft={balanceMarginLeft}/>)
            }

            if (p.showBalanceDiffStart && item.balanceDiffStart) {
                bitems.push(' : ΔStart ')
                bitems.push(<AeBalance key={key++} balance={item.balanceDiffStart} marginLeft={balanceMarginLeft}/>)         
            }

            info = <span>{bitems}</span>

            rowClass = 'item-row-balance'
        } else if (item.type === 'artificial-info') {
            info = item.artificialInfo!
            rowClass = 'item-row-artificial-info'
        } else if (item.type === 'channel-sign') {
            info = item.channelSignTag!
            rowClass = 'item-row-channel-sign'
        }

        return <div className={clsx('channel-item-row', rowClass)}>
            <div className='item-part item-part-timestamp'>{utils.msToStr(timeMs)}</div>
            <div className='item-part item-part-type'>{item.type}</div>
            <div className='item-part item-part-info'>{info}</div>
        </div>
    }
}

// -----------------------------------------------------------------------------

function _ChannelItems(p : {
    readonly startTime : Date
    readonly items : ChannelStateItem[]
}) {
    let _balanceCount = 0
    const rows = p.items.map((item, ix) => {
        let showBalanceDiffStart = false
        if (item.type === 'balance') {
            if ((item.balanceDiffPrev && (item.balanceDiffPrev !== '0')) || (_balanceCount === 0)) {
                showBalanceDiffStart = true
            }
            _balanceCount += 1
        }
        return <_ChannelItem key={ix} startTime={p.startTime} item={item} showBalanceDiffStart={showBalanceDiffStart}/>
    })
    
    return <div className='channel-items'>
        {rows}
    </div>
}
// -----------------------------------------------------------------------------

interface Props extends mui_styles.PropsWithStyles {
    readonly type : 'initiator' | 'responder'
    readonly accountId : string
    readonly startTime : Date
    readonly balance   : string
    readonly items : ChannelStateItem[]
}

interface State {
}

class _ChannelState extends React.PureComponent<Props, State> {
    constructor(props : Props, ctx? : any) {
        super(props, ctx)

        this.state = {

        }
    }

    render() {
        const p = this.props

        let balance : React.ReactElement | undefined
        let accountName = ''
        const items = p.items.slice()
        items.reverse()

        if (p.balance !== '') {
            balance = <span><span> : Balance </span><AeBalance balance={p.balance} noColor marginLeft='3px'/></span>
        }

        if (ae_wallet.hasWalletName(p.accountId)) {
            accountName = ' - ' + ae_wallet.getWalletName(p.accountId)
        }

        return <div className={clsx(p.classes.component, p.classes.channelState)}>
            <div>
                <Typography variant='h6'>{p.type + accountName} {balance}</Typography>
            </div>
            <_ChannelItems startTime={p.startTime} items={items} />
        </div>
    }
}

export default mui_styles.withStyles(mui_styles.styles)(_ChannelState)