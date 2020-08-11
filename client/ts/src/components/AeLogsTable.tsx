import * as React from 'react'
import clsx from 'clsx'

import TableCell from '@material-ui/core/TableCell';
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'

import IconButton from '@material-ui/core/IconButton'

import DoneIcon from '@material-ui/icons/Done'
import ErrorIcon from '@material-ui/icons/ErrorOutlineTwoTone'
import DeleteIcon from '@material-ui/icons/DeleteOutline'


import * as mui_styles from '../mui-styles'
import * as global_state from '../global-state'
import * as ae_logger from '../ae-logger'

import * as utils from '../utils'

import VirtualizedTable, {ColumnDescription, CustomCellArgs} from './VirtualizedTable'



interface Props extends mui_styles.PropsWithStyles {
    readonly logs : ae_logger.LogItem[]
}

interface State {
    headerHeight : number
    rowHeight : number
    columns : ColumnDescription[]
}

class _AeLogsTable extends React.PureComponent<Props, State> {
    constructor(props: Props, ctx? : any) {
        super(props, ctx)

        this._customStateCell = this._customStateCell.bind(this)
        this._customBeginTimeCell = this._customBeginTimeCell.bind(this)
        this._customElapsedTimeCell = this._customElapsedTimeCell.bind(this)
        this._customTextCell = this._customTextCell.bind(this)
        this._customErrorCell = this._customErrorCell.bind(this)

        this.state = {
            headerHeight : 48,
            rowHeight    : 32,
            columns      : [{
                dataKey : 'id',
                label   : 'Id',
                width   : 50
            }, {
                dataKey : 'network',
                label   : 'Network',
                width   : 100
            }, {
                dataKey : 'state',
                label   : 'State',
                width   : 60,
                customCell : this._customStateCell
            }, {
                dataKey : 'beginTime',
                label   : 'Time',
                width   : 100,
                customCell : this._customBeginTimeCell
            }, {
                dataKey : 'endTime',
                label : '',
                width : 80,
                customCell : this._customElapsedTimeCell
            }, {
                dataKey : 'text',
                label  : 'Text',
                width  : 700,
                customCell : this._customTextCell
            }, {
                dataKey    : 'errorText',
                label      : 'Error',
                width      : 600,
                customCell : this._customErrorCell
            }]
        }

        this._clearTable = this._clearTable.bind(this)
    }

    render() {    
        const p = this.props
        const s = this.state

        const tableProps = {
            onRowClick : () => {}
        }

        const _getRow = (index: number) => {
            return this._getRow(index)
        }

        const _cellClassName = (rowIndex: number, args: any) => {
            const row = _getRow(rowIndex)

            if (row.state === 'end-error') {
                return p.classes.tableErrorCell
            } 
            return ''
        }

        return <div className={clsx(p.classes.component, p.classes.aeLogsTable)}>
            <div className='log-table-buttons'>
                <IconButton color="primary" component="span" onClick={this._clearTable}>
                    <DeleteIcon />
                </IconButton>
            </div>
            <VirtualizedTable
                className='log-virt-table'
                headerHeight = {s.headerHeight}
                rowHeight = {s.rowHeight}
                columns={s.columns}
                rowCount={p.logs.length}
                rowGetter={(args : {index : number}) => _getRow(args.index)}
                cellClassName={_cellClassName}
                cellStyle={rowIndex => this._getRowStyle(this._getRow(rowIndex))}
            />
        </div>
    }

    private _getRow(rowIndex : number) : ae_logger.LogItem {
        const logs = this.props.logs
        return logs[logs.length - rowIndex - 1]
    }

    private _getRowStyle(row : ae_logger.LogItem) : React.CSSProperties | undefined {
        if (row.logArgs) {
            if (row.logArgs.css) {
                return row.logArgs.css
            }
        }
    }

    private _customStateCell(args : CustomCellArgs) {
        const row = this._getRow(args.rowIndex)
        let text = row.state

        let content : React.ReactElement 

        if (row.state === 'begin') {
            content = <CircularProgress size={24}/>
        } else if (row.state === 'end-ok') {
            content = <DoneIcon className={this.props.classes.okIcon}/>
        } else if (row.state === 'end-error') {
            content = <ErrorIcon className={this.props.classes.errorIcon}/>
        } else {
            content = <span>{text}</span>
        }

        return <TableCell component='div' className={args.className} style={this._getRowStyle(row)}>{content}</TableCell>
    }

    private _customBeginTimeCell(args : CustomCellArgs) {
        const row = this._getRow(args.rowIndex)
        let text = utils.date2TimeStr(row.beginTime)

        /*
        if (row.endTime !== undefined) {
            const dt = row.endTime.getTime() - row.beginTime.getTime()
            text += ' - ' + utils.msToStr(dt)
        }
        */

        return <TableCell component='div' className={args.className} style={this._getRowStyle(row)}>{text}</TableCell>
    }

    private _customElapsedTimeCell(args : CustomCellArgs) {
        const row = this._getRow(args.rowIndex)
        let text = ''

        if (row.endTime !== undefined) {
            const dt = row.endTime.getTime() - row.beginTime.getTime()
            text = utils.msToStr(dt)  
        }
        return <TableCell component='div' className={args.className} style={this._getRowStyle(row)}>{text}</TableCell>
    }

    private _customTextCell(args : CustomCellArgs) {
        const row = this._getRow(args.rowIndex)
        let text = row.text

        if ((row.state === 'end-ok') && (row.endText !== '')) {
            text = row.endText
        }

        return <TableCell component='div' className={args.className} style={this._getRowStyle(row)}>{text}</TableCell>
    }

    private _customErrorCell(args : CustomCellArgs) {
        const row = this._getRow(args.rowIndex)
        let text = ''

        if (row.errorText) {
            text = row.errorText
        }

        return <Tooltip title={text} placement='top-start' arrow>
            <TableCell
                component='div'
                className={args.className}
                style={this._getRowStyle(row)}
            >{text}</TableCell>
        </Tooltip>
    }

    private _clearTable() {
        global_state.dispatch(global_state.setAeLogs([]))
    }
}

export default mui_styles.withStyles(mui_styles.styles)(_AeLogsTable)