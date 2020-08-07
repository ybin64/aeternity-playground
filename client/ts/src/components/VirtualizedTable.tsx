import * as React from 'react'
import clsx from 'clsx'

import TableCell from '@material-ui/core/TableCell'

import * as mui_styles from '../mui-styles'

import { AutoSizer, Column, Table, TableHeaderProps, TableCellProps, Index } from 'react-virtualized'
import { CSSProperties } from '@material-ui/core/styles/withStyles'


// Originally from https://material-ui.com/components/tables/#virtualized-table

export type CustomCellArgs = {
    rowIndex : number
    className : string
}

export type ColumnDescription = {
    dataKey : string
    label   : string
    width   : number

    numeric? : boolean
    customCell? : (args : CustomCellArgs) => React.ReactElement
}

interface Props extends mui_styles.PropsWithStyles {
    readonly className? : string
    readonly headerHeight : number
    readonly rowHeight : number

    readonly columns : ColumnDescription[]

    readonly rowCount : number
    readonly rowGetter : (args : {index : number}) => any

    readonly cellClassName? : (rowIndex: number, args : any) => string
    readonly cellStyle? : (rowIndex : number) => React.CSSProperties | undefined
}

interface State {
}

class _VirtualizedTable extends React.PureComponent<Props, State> {

    constructor(props: Props, ctx? : any) {
        super(props, ctx)

        this.state = {     
        }

        this.getRowClassName = this.getRowClassName.bind(this)
        this.cellRenderer = this.cellRenderer.bind(this)
    }

    getRowClassName = (args : Index) => {
        const { classes, /*onRowClick*/ } = this.props;
    
        return clsx(classes.tableRow, classes.flexContainer, {
          //[classes.tableRowHover]: args.index !== -1 && onRowClick != null,
        })
    }

    headerRenderer(thProps: TableHeaderProps, columnIndex: number) {
        const { classes } = this.props;
        
        const columns = this.props.columns
        const headerHeight = this.props.headerHeight

        
        return <TableCell
            component="div"
            className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
            variant="head"
            style={{ height: headerHeight }}
            align={columns[columnIndex].numeric || false ? 'right' : 'left'}
          >
            <span>{columns[columnIndex].label}</span>
          </TableCell>
        
    }

    cellRenderer(args : TableCellProps) {
        const {classes, columns, rowHeight} = this.props;

        const columnIndex = args.columnIndex
        const cellData = args.cellData

        const column = columns[columnIndex]

        let cellClassName = ''

        if (this.props.cellClassName) {
            cellClassName = this.props.cellClassName(args.rowIndex, args)
        }
        
        const className = clsx(classes.tableCell, classes.flexContainer, cellClassName)

        if (column.customCell) {
            return column.customCell({
                rowIndex : args.rowIndex, 
                className : className
            })
        }

        let style : React.CSSProperties = {
            height : rowHeight
        }

        if (this.props.cellStyle) {
            const additionalStyle = this.props.cellStyle(args.rowIndex)
            if (additionalStyle) {
                style = {...style, ...additionalStyle}
            }
        }
        return (
          <TableCell
            component="div"
            className={className}
            variant="body"
            //style={{ height: rowHeight }}
            style={style}
            align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
          >
            {cellData}
          </TableCell>
        );
    }

    render() { 
        const p = this.props
        const s = this.state

        const tableProps = {
            onRowClick : () => {}
        }
        
        return <div className={clsx(p.classes.component, p.classes.virtualizedTable, 'virtualized-table', p.className)}>
                <AutoSizer>
                    {({ height, width }) => {                    
                    return <Table
                        height={height}
                        width={width}
                        rowHeight={p.rowHeight}
                        gridStyle={{
                            direction: 'inherit',
                        }}
                        headerHeight={p.headerHeight}
                        className={p.classes.table}

                        rowCount={p.rowCount}
                        rowGetter={p.rowGetter} 

                        rowClassName={this.getRowClassName}
                    >
                        {p.columns.map((col, index) => {
                            return (
                                <Column
                                    key={col.dataKey}
                                    headerRenderer={(props: TableHeaderProps) =>  
                                        this.headerRenderer(props, index)
                                    }
                                    className={p.classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey={col.dataKey}
                                    width={col.width}
                                />
                            )
                        })}
                    </Table>
                }}
            </AutoSizer>
        </div>
    }
}

export default mui_styles.withStyles(mui_styles.styles)(_VirtualizedTable)