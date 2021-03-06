import * as React from 'react'
import * as ReactDOM from 'react-dom'
import clsx from 'clsx'

import {EditorState, EditorView, basicSetup} from "@codemirror/next/basic-setup"
import {Transaction, Text} from '@codemirror/next/state'

import {linter, Diagnostic} from "@codemirror/next/lint"

import {StreamSyntax} from "@codemirror/next/stream-syntax"
import Foo from './codemirror-lang-sophia'

import * as sophia_parser from 'aesophia-parser'
import * as mui_styles from '../mui-styles'

class SophiaLinter {

}

function _sophiaErrWarnToDiagnostic(severity: 'error' | 'warning', ew : sophia_parser.ParseErrWarn) : Diagnostic {
    return {
        from : ew.location.begin.offset,
        to   : ew.location.end.offset,
        severity : severity,
        message : ew.message
    }
}
function sophiaLinter() :(view : EditorView) => Promise<readonly Diagnostic[]> {
    return (view : EditorView) => {
 
        const src = view.state.doc.sliceString(0)
 
        return new Promise<readonly Diagnostic[]>((resolve) => {
            const scanner = new sophia_parser.Scanner(src)
            const result = sophia_parser.parse(scanner)
            
            let ret : Diagnostic[] = []
            ret = ret.concat(result.errors.map(e => _sophiaErrWarnToDiagnostic('error', e)))
            ret = ret.concat(result.warnings.map(e => _sophiaErrWarnToDiagnostic('warning', e)))

            resolve(ret)
        })
    }
}

interface Props extends mui_styles.PropsWithStyles {
    readonly className? : string
    readonly doc : string
    readonly onDocUpdate : (doc : string) => void
}

interface State {
    pendingUpdateTimeMs : number
    doc? : Text
    docS : string
}

class _SophiaEditor extends React.PureComponent<Props, State> {
    private _ew : EditorView
    private _handleChanges = false
    private _pendingUpdate = false
    private _lastDocUpdate : Text | undefined = undefined

    constructor(props : Props, ctx? : any) {
        super(props, ctx)

        this.state = {
            pendingUpdateTimeMs : 1000,
            docS : ''
        }
    }

    componentDidMount() {
        const el = ReactDOM.findDOMNode(this) as Element

        let state = EditorState.create({
            doc : this.props.doc,
            extensions : [
                basicSetup,
                linter(sophiaLinter()),
                new StreamSyntax(Foo()).extension
            ]
        })

        this._ew = new EditorView({
            state : state, 
            parent: el,

            
            dispatch : (tr : Transaction) => {
                this._ew.update([tr])

                if (!this._handleChanges) {
                    return
                }

                this._handleDocChange(tr)
            }      
        })
    }

    componentWillUnmount() {
        this._ew.destroy()
    }

    componentDidUpdate(prevProps : Props) {
        if (this.props.doc !== prevProps.doc) {

            if (this.props.doc !== this.state.docS) {
                this._newDoc(this.props.doc)
            }
        }
    }

    render() {
        const p = this.props
        const s = this.state
        return <div className={clsx(p.classes.sophiaEditor, p.className)}></div>
    }

    private _newDoc(doc : string) {     
        this._handleChanges = false
        this._ew.dispatch({
            changes : [
                {from : 0, to : this._ew.state.doc.length}, // Delete current content
                {from : 0, insert : doc}
            ]
        })
        this.setState({
            doc : this._ew.state.doc
        })
        this._handleChanges = true
    }

    private _handleDocChange(tr : Transaction) {
        if (tr.state.doc !== this.state.doc) {
            // Document content change

            this._lastDocUpdate = tr.state.doc

            if (!this._pendingUpdate) {
                // Start update buffering

                this._pendingUpdate = true

                setTimeout(() => {
                    let docS = ''

                    if (this._lastDocUpdate) {
                        docS = this._lastDocUpdate.sliceString(0)
                    }

                    this.setState({
                        doc  : this._lastDocUpdate,
                        docS : docS
                    })

                    if (this._lastDocUpdate) {
                        this.props.onDocUpdate(docS)
                    }

                    this._pendingUpdate = false
                }, this.state.pendingUpdateTimeMs)
            }
        }
    }
}

export default mui_styles.withStyles(mui_styles.styles)(_SophiaEditor)