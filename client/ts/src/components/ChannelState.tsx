import * as React from 'react'
import * as ReactDOM from 'react-dom'

import clsx from 'clsx'

import Typography from '@material-ui/core/Typography'

import * as mui_styles from '../mui-styles'
import { OnEventCbArg_StatusChanged } from '@aeternity/aepp-sdk/es/channel'

import * as utils from '../utils'
import * as ae_wallet from '../ae-wallet'

import {ChannelStateItem} from '../state-channel-utils'

function _splitBalance(balance : string) : string[] {
    let ret : string[] = []

    for (let ix = 0; ix < balance.length; ix++) {
        const ch = balance[balance.length - ix - 1]
        if ((ix % 3) == 0) {
            ret.unshift(ch)
        } else {
            ret[0] = ch + ret[0]
        }
    }
    return ret
}

/*
function _test(b : string) {
    console.log(`##### _splitBalance(${b})=`, _splitBalance(b))
}


_test('')
_test('1')
_test('12')
_test('123')
_test('1234')
_test('12345')
_test('123456')
_test('1234567')
_test('12345678')
*/

function _balance(p : {readonly balance : string, readonly noColor?: boolean}) {
    const b = p.balance
    if (b.length > 0) {
        const css : React.CSSProperties = {}

        if (p.noColor !== true) {
            if (b[0] === '-') {
                css.color = 'red'
            } else if (b !== '0') {
                css.color = 'green'
            }
        }

        const splitItems = _splitBalance(b)

        const items = splitItems.map((item, ix) => {
            const style : React.CSSProperties = {}

            if ((splitItems.length > 1) && (((splitItems.length - ix -1) % 2) === 0)) {
                //style.textDecoration = 'underline'
                //style.fontStyle = 'italic'
                style.borderBottom = '1px solid currentColor'
            }

            return <span key={ix} style={style}>{item}</span>
        })

        return <span style={css}>{items}</span>
    }
    return <span>{p.balance}</span>
}

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

            bitems.push(<_balance key={key++} balance={item.balance! + ''} noColor />)
            bitems.push(' : ')
            bitems.push(item.info!)

            if (item.balanceDiffPrev) {
                bitems.push(' : ΔPrev ')
                bitems.push(<_balance key={key++} balance={item.balanceDiffPrev} />)
            }

            if (p.showBalanceDiffStart && item.balanceDiffStart) {
                bitems.push(' : ΔStart ')
                bitems.push(<_balance key={key++} balance={item.balanceDiffStart} />)         
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
            balance = <span><span> : Balance </span><_balance balance={p.balance} noColor/></span>
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