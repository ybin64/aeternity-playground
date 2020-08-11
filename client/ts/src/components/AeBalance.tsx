import * as React from 'react'

interface Props {
    readonly balance : string | number
    readonly noColor? : boolean
    readonly noUnderline? : boolean

    /** E.g. '1px' */
    readonly marginLeft? : string
}

export default function AeBalance(p : Props) {
    const b = p.balance.toString()

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

                if (!p.noUnderline) {
                    style.borderBottom = '1px solid currentColor'
                }

                if (p.marginLeft) {
                    style.marginLeft = p.marginLeft
                }
            } else {

                if (p.marginLeft) {
                    style.marginLeft = p.marginLeft
                }
            }

            return <span key={ix} style={style}>{item}</span>
        })

        return <span style={css}>{items}</span>
    }

    return <span>{p.balance}</span>
}



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