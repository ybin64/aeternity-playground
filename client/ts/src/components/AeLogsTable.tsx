import * as React from 'react'
import clsx from 'clsx'

import TableCell from '@material-ui/core/TableCell';
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip';

import DoneIcon from '@material-ui/icons/Done'
import ErrorIcon from '@material-ui/icons/ErrorOutlineTwoTone'


import * as mui_styles from '../mui-styles'
import * as ae_logger from '../ae-logger'

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
                width   : 100,
                customCell : this._customStateCell
            }, {
                dataKey : 'text',
                label  : 'Text',
                width  : 600
            }, {
                dataKey : 'errorText',
                label : 'Error',
                width : 600,
                customCell : this._customErrorCell
            }]
        }
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
            <VirtualizedTable
                headerHeight = {s.headerHeight}
                rowHeight = {s.rowHeight}
                columns={s.columns}
                rowCount={p.logs.length}
                rowGetter={(args : {index : number}) => _getRow(args.index)}
                cellClassName={_cellClassName}
            />
        </div>
    }

    private _getRow(rowIndex : number) : ae_logger.LogItem {
        const logs = this.props.logs
        return logs[logs.length - rowIndex - 1]
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

        return <TableCell className={args.className}>{content}</TableCell>
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
            >{text}</TableCell>
        </Tooltip>
    }
}

export default mui_styles.withStyles(mui_styles.styles)(_AeLogsTable)