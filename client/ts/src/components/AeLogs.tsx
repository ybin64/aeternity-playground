import * as React from 'react'
import clsx from 'clsx'

import * as global_state from '../global-state'
import * as mui_styles from '../mui-styles'
import * as ae_logger from '../ae-logger'

import AeLogsTable from './AeLogsTable'

interface Props extends mui_styles.PropsWithStyles {
    readonly logs : ae_logger.LogItem[]
}


function _AeLogs(p : Props) {
    return <div className={clsx(p.classes.component, p.classes.aeLogs)}>
        <AeLogsTable logs={p.logs} />
    </div>
}

export default global_state.connect((state : global_state.AppState) : Partial<Props> => {
    return {
        logs : state.ui.logs
    }
})(mui_styles.withStyles(mui_styles.styles)(_AeLogs))