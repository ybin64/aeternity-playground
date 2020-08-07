import * as React from 'react'

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel'
import Tooltip from '@material-ui/core/Tooltip'

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'
import * as mui_styles from '../mui-styles'


interface Props extends mui_styles.PropsWithStyles {
    readonly networkName? : string
}

function _NetworkSelect(p : Props) {
    const handleChange = (e : any) => {
        //p.onNewNetwork(e.target.value)
        global_state.dispatch(global_state.selectNetwork(e.target.value))
    }

    return <Tooltip title='See client/ts/dist/runtime-config.json' placement='left' enterDelay={1500}>
        <FormControl className={p.classes.networkSelect}>
            <InputLabel id="network-select" >Network</InputLabel>
            <Select
            labelId="network-select"
            id="demo-simple-select"
            value={p.networkName}
            onChange={handleChange}
            color='secondary'
            >
                {
                    global_state.getUiState().runtimeConfig.networks.map((nw, ix) => {
                        return <MenuItem key={ix} value={nw.name}>{nw.name}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
    </Tooltip>
}



export default global_state.connect((state : global_state.AppState) : Partial<Props> => {
    return {
        networkName : state.ui.networkName
    }
})(mui_styles.withStyles(mui_styles.styles)(_NetworkSelect))