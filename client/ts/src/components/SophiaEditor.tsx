import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {EditorState, EditorView, basicSetup} from "@codemirror/next/basic-setup"

interface Props  {
    readonly className? : string
    readonly doc : string
}

interface State {

}

class _SophiaEditor extends React.PureComponent<Props, State> {
    private _ew : EditorView

    constructor(props : Props, ctx? : any) {
        super(props, ctx)

        this.state = {

        }
    }

    componentDidMount() {
        const el = ReactDOM.findDOMNode(this) as Element

        console.log('SophiaEditor.componentDidMount : el=', el)

        let state = EditorState.create({
            doc : this.props.doc,
            extensions : [basicSetup]
        })

        this._ew = new EditorView({state, parent: el})
    }

    componentWillUnmount() {
        this._ew.destroy()
    }

    componentDidUpdate(prevProps : Props) {
        if (this.props.doc !== prevProps.doc) {
            this._newDoc(this.props.doc)
        }
    }

    render() {
        const p = this.props
        const s = this.state
        return <div className={p.className}></div>
    }

    private _newDoc(doc : string) {
        this._ew.dispatch({
            changes : [
                {from : 0, to : this._ew.state.doc.length}, // Delete current conntent
                {from : 0, insert : doc}
            ]
        })
    }
}

export default _SophiaEditor

