import * as React from 'react'
import clsx from 'clsx'

import TextField from '@material-ui/core/TextField'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import * as global_state from '../global-state'
import * as ae_network from '../ae-network'

import {PropsWithStyles, withStyles, styles} from '../mui-styles'


// -----------------------------------------------------------------------------

interface Props extends PropsWithStyles {
    readonly networkName?   : string
    readonly networkConfig? : ae_network.AeNetworkConfig
}




function _NetworkConfiguration(p: Props) {
    const _field = (_p : {label: string, value?: string}) => {
        return <TextField className={p.classes.noUnderlineTextField}
            label={_p.label} 
            defaultValue={_p.value} 
            fullWidth={true}
            InputProps={{
                readOnly : true
            }}
        />
    }

    if (p.networkConfig) {
        return <div className={clsx(p.classes.component, p.classes.networkConfiguration)}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                >
                    <_field label='Network' value={p.networkName} /> 
                    <_field label='Network ID'   value={p.networkConfig.networkId} />
                    <_field label='Network URL' value={p.networkConfig.networkUrl} /> 
                    <_field label='Channel URL' value={p.networkConfig.channelUrl} /> 
                </AccordionSummary>
                <AccordionDetails>
                    <div className='nc-details'>
                        <div className='nc-config'>
                            
                         
                            
                            <_field label='Internal URL' value={p.networkConfig.internalUrl} />
                            
                            <_field label='Compiler URL' value={p.networkConfig.compilerUrl} />     
                        </div> 
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    } else {
        return <div />
    }
}

export default global_state.connect((state : global_state.AppState) : Partial<Props> => {
    return {
        networkName : state.ui.networkName,
        networkConfig : state.ui.networkConfig
    }
})(withStyles(styles)(_NetworkConfiguration))