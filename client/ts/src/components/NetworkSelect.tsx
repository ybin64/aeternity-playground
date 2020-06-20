import * as React from 'react'

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'
import * as mui_styles from '../mui-styles'


interface Props extends mui_styles.PropsWithStyles {
    readonly networkName? : ae_network.NetworkName
}

function _NetworkSelect(p : Props) {
    const handleChange = (e : any) => {
        //p.onNewNetwork(e.target.value)
        global_state.dispatch(global_state.selectNetwork(e.target.value))
    }

    return <FormControl className={p.classes.networkSelect}>
        <InputLabel id="network-select" >Network</InputLabel>
        <Select
          labelId="network-select"
          id="demo-simple-select"
          value={p.networkName}
          onChange={handleChange}
          color='secondary'
        >
            {
                ae_network.NetworkNames.map((name, ix) => {
                    return <MenuItem key={ix} value={name}>{name}</MenuItem>
                })
            }
        </Select>
    </FormControl>
}



export default global_state.connect((state : global_state.AppState) : Partial<Props> => {
    return {
        networkName : state.ui.networkName
    }
})(mui_styles.withStyles(mui_styles.styles)(_NetworkSelect))