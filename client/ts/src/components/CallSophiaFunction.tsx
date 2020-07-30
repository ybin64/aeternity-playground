import * as React from 'react'
import clsx from 'clsx'

import {PropsWithStyles, withStyles, styles} from '../mui-styles'
import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import * as sophia_parser from 'aesophia-parser'
import Contract1View from '../views/Contract1View';

// -----------------------------------------------------------------------------

type FunctionDeclArgs = {
    name : string
}

type EntryPoint = {
    name : string
    args : FunctionDeclArgs[]
}

type Contract = {
    name : string
    entryPoints : EntryPoint[]
}

function _getContracts(ast : sophia_parser.AstItem | undefined) : Contract[] {
    let ret : Contract[] = []

    if (ast !== undefined) {

        for (let child of ast.children) {
            if (child.type === 'top-contract-decl') {
                const contract = child as sophia_parser.AstItem_TopContractDecl
                ret.push({
                    name : contract.con.text,
                    entryPoints : _getContractEntryPoints(contract)
                })
            }
        }   
    }

    return ret
} 

function _getContractEntryPoints(contract : sophia_parser.AstItem_TopContractDecl) : EntryPoint[] {
    let ret : EntryPoint[] = []

    for (let child of contract.children) {
        if (child.type === 'entrypoint-decl') {
            const ep = child as sophia_parser.AstItem_EntrypointDecl
            const funcDecl = ep.children[0]

            ret.push({
                name : funcDecl.id.text,
                args : _getFunctionDeclArgs(funcDecl.args)
            })
        }
    }
    return ret
}

function _getFunctionDeclArgs(args : sophia_parser.AstItem_Expr[] | undefined) : FunctionDeclArgs[] {
    let ret : FunctionDeclArgs[] = []

    if (args) {
        console.log('args=', args)

        for (let arg of args) {
            if (arg.exprType === 'identifier') {
                const id = arg as sophia_parser.AstItem_Expr_Identifier
                ret.push({
                    name : id.identifier.text
                })
            } else if (arg.exprType === 'type-annotation') {
                const ta = arg as sophia_parser.AstItem_Expr_TypeAnnotation

                if ((ta.children.length > 0) && ((ta.children[0] as sophia_parser.AstItem_Expr).exprType === 'identifier')) {
                    const id = ta.children[0] as sophia_parser.AstItem_Expr_Identifier

                    ret.push({
                        name : id.identifier.text
                    })
                }
            }
        }
    }
    return ret
}

// -----------------------------------------------------------------------------

function _EntryPointSelect(p : {
    readonly contract? : Contract
    readonly entryPoint : string
    readonly onChange : (ep : EntryPoint) => void
}) {
    const [entryPoint, setEntryPoint] = React.useState(p.entryPoint);
    const handleChange = (event : React.ChangeEvent<{value : string}>) => {
        const name = event.target.value

        //setEntryPoint(event.target.value);
        if (p.contract) {
            for (let ep of p.contract.entryPoints) {
                if (ep.name === name) {
                    p.onChange(ep)
                    break
                }
            }
        }
    };

    let items : React.ReactElement[] = []
    if (p.contract) {
        items = p.contract.entryPoints.map((ep, ix) => {
            return <MenuItem key={ix} value={ep.name}>{ep.name}</MenuItem>
        })
    }

    return <FormControl>
        <InputLabel id="entrypoint-label">Entrypoint</InputLabel>
        <Select
            labelId="entrypoint-label"
            //id="demo-simple-select"
            value={p.entryPoint}
            onChange={handleChange}
            style={{
                minWidth : '10em'
            }}
        >
            {items}
        </Select>
    </FormControl>
}

// -----------------------------------------------------------------------------

type _EntryPointArgument = {
    name : string
    value : string
}


function _EntryPointArgs(p : {
    args : _EntryPointArgument[]
    onValueChange : (valueIx : number, value : string) => void
}) {

    return <div>
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Argument</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {p.args.map((row, ix) => (
                        <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell>
                                <TextField value={p.args[ix].value} onChange={(e) => {
                                    p.onValueChange(ix, e.currentTarget.value)
                                }}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </div>
}
// -----------------------------------------------------------------------------

interface Props extends PropsWithStyles {
    readonly className? : string
    readonly ast? : sophia_parser.AstItem
    readonly onCallEntryPoint : (entryPointName : string, args : string[]) => void
}

interface State {
    contracts : Contract[]
    entryPointName : string
    entryPointArgs : _EntryPointArgument[]
}

class _CallSophiaFunction extends React.PureComponent<Props, State> {
    constructor(props : Props, ctx? : any) {
        super(props, ctx)

        this.state = {
            contracts : [],
            entryPointName : '',
            entryPointArgs : []
        }

        this._onChangeEntryPoint = this._onChangeEntryPoint.bind(this)
        this._onArgValueChange = this._onArgValueChange.bind(this)
    }

    componentDidMount() {
        this._newAst(this.props.ast)
    }

    componentDidUpdate(prevProps : Props) {
        if (this.props.ast !== prevProps.ast) {
            this._newAst(this.props.ast)
        }
    }

    render() {
        const p = this.props
        const s = this.state

        return <div className={clsx(p.className)}>
            <div style={{
                display : 'flex',
                justifyContent : 'flex-start',
                alignItems : 'flex-end',
                marginBottom : '10px',
                paddingBottom : '10px',
                boxShadow : '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
            }}>
                <Button 
                    disabled={(p.ast === undefined) || (this.state.entryPointName.trim() === '')}
                    onClick={() => {
                        this.props.onCallEntryPoint(this.state.entryPointName, this.state.entryPointArgs.map(arg => arg.value))
                    }}
                    style={{
                        marginRight : '10px'
                    }}
                >Call</Button>

                <_EntryPointSelect 
                    contract={s.contracts[0]} 
                    entryPoint={s.entryPointName} 
                    onChange={this._onChangeEntryPoint}
                />
            </div>
            <_EntryPointArgs args={s.entryPointArgs} onValueChange={this._onArgValueChange}/>
        </div>
    }

    private _newAst(ast : sophia_parser.AstItem | undefined) {
        const contracts = _getContracts(ast)

        console.log('CallSophiaFunction._newDoc : 30 : contracts=', contracts)

        this.setState({
            contracts : contracts
        })
    }

    private _onChangeEntryPoint(ep : EntryPoint) {
        console.log('onChangeEntryPoint : ep=', ep)
        this.setState({
            entryPointName : ep.name,
            entryPointArgs : ep.args.map((a, ix) => {return {name : a.name, value : '' + (ix + 1)}})
        })
    }

    private _onArgValueChange(valueIx : number, value : string) {
        const args = this.state.entryPointArgs.slice()
        args[valueIx].value = value

        this.setState({
            entryPointArgs : args
        })
    }
}

export default withStyles(styles)(_CallSophiaFunction)

