
import {ClassNameMap, ClassKeyOfStyles} from '@material-ui/styles/withStyles'
import {withStyles as muiWithStyles, } from '@material-ui/core/styles'
import {WithStyles, createStyles, Theme} from '@material-ui/core'


const drawerWidth = 240;

/** Aeternity colors
 * 001835 rgb(0, 24, 53)
 * D1DCE7 rgb(209, 220, 231)
 * F6FAFC rgb(246, 250, 252)
 */


// NOTE: VSCode speed with newer material-ui is very very slow,
// Use _createStyles(...) during active development.

/** 
 * Looser typecheck, but significant VSCode code check speed improvement
 * See node_modules/@material-ui/styles/createStyles/createStyles.d.ts 
 */
function _createStyles(styles : any) {
    return styles
}

  
export const styles = (theme: Theme) => {
    const networkSelectColor = 'white'

    //return createStyles({
    return _createStyles({

        // Dashboard styles BEGIN
        root: {
            display: 'flex',
            //backgroundColor : 'yellow'
        },
        toolbar: {
            paddingRight: 24, // keep right padding when drawer closed
        },
        toolbarIcon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 8px',
            ...theme.mixins.toolbar,
        },

        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },

        appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },

        menuButton: {
            marginRight: 36,
        },

        menuButtonHidden: {
            display: 'none',
        },

        title: {
            flexGrow: 1,
        },

        drawerPaper: {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },

        drawerPaperClose: {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        },

        appBarSpacer: theme.mixins.toolbar,
        content: {
            //backgroundColor : 'red',
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
        },

        container: {
            //backgroundColor : 'red',
            height : 'calc(100% - 20px)',
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
        },

        paper: {
            padding: theme.spacing(2),
            display: 'flex',
            overflow: 'auto',
            flexDirection: 'column',
        },
        
        fixedHeight: {
            height: 240,
        },

        // Dashboard styles END

        view : {
            //backgroundColor : 'green',
            height : '100%',

            '& .y-view-grid-container' : {
                height : '100%'
            },

            '& .y-view-grid-item' : {
                height : '100%'
            },

        },

        viewPaper : {
            height : '100%',
            padding : '4px 0px 0px 4px'
        },

        simpleList: {
            overflow : 'auto',

            '& .item' : {
                cursor : 'pointer'
            },
            '& .item.selected' : {
                backgroundColor : theme.palette.action.selected
            },
            '& .item:hover' : {
                backgroundColor : theme.palette.action.hover
            }
        
        },

        headerContent : {
            marginBottom : '4px',
            display : 'flex',

            '& > .body' : {
                marginLeft : '4px',
                display    : 'flex',
                flexDirection : 'column'
            }
        },


        noUnderlineTextField : {
            '& >div:before' : {
                border : 'none'
            }
        },

        // -------------------------------------------------------------------------
        // icons

        okIcon : {
            color : 'darkseagreen'
        },

        errorIcon : {
            color : 'salmon'
        },


        // -------------------------------------------------------------------------
        // table

        flexContainer: {
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
        },

        table : {

        },

        tableRow: {
            cursor: 'pointer',
        },

        tableCell: {
            flex: 1,
        },

        tableErrorCell : {
            backgroundColor : '#FFF1F5'
        },

        noClick: {
            cursor: 'initial',
        },

        virtualizedTable : {
            height : '100%'
        },

        // -------------------------------------------------------------------------
        // Components

        component : {
            padding : '2px 2px 2px 2px',
            margin : '4px 4px 4px 4px'
        },

        networkSelect : {
            minWidth : '10rem',
            '& div, div:focus, svg' : {
                color : networkSelectColor
            },

            '& >label, >label:focus' : {
                color : networkSelectColor + ' !important'
            },

            '& >div:before, >div:before:focus' : {
                border : 'none',
                //transition : 'none',
                //borderColor : networkSelectColor,
                //borderBottomColor : networkSelectColor
            },

            '& div:after' : {
                border : 'none',
                //transition : 'none'
            }
        },

        networkConfiguration : {
            '& .nc-details' : {
                width : '100%'
            },

            /*
            '& .nc-name' : {
                marginBottom : theme.spacing(2)
            },
            */
            '& .nc-config' : {
                display : 'flex',
                justifyContent : 'space-between'
            }
        },


        aeLogs : {
            minHeight : '400px'
        },

        aeLogsTable : {
            minHeight : '380px',

            '& .log-table-buttons' : {
                //position : 'absolute',
                //right    : '40px'
                display : 'flex',
                justifyContent : 'flex-end',
                marginTop : '-15px'
            },

            '& .log-virt-table' : {
                marginTop : '-45px',
                width : 'calc(100% - 40px)',
                minHeight : '380px'
            },

        },

        channelState : {
            //overflow : 'auto',
            minHeight : '200px',
            maxHeight : '300px',

            '& .channel-items' : {
                maxHeight : '260px',
                overflow : 'auto'  
            },

            '& .item-row-balance' : {
                color : 'grey',
                fontStyle : 'italic'
            },

            '& .item-row-artificial-info' : {
                backgroundColor : 'rgba(211, 211, 211, 0.5)', //'#d3d3d3',
                fontStyle : 'italic'
            },

            '& .item-part' : {
                display : 'inline-block'
            },
            '& .item-part-timestamp' : {
                width : '80px'
            },
            '& .item-part-type' : {
                width : '100px'
            }
        },

        // ---------------------------------------------------------------------
        // Views

        contract1View : {
            '& .sophia-editor' : {
                minHeight : '250px',
                maxHeight : '250px',
                overflow : 'auto'
            }
        }
    })
}

export type Styles = ClassNameMap<ClassKeyOfStyles<typeof styles>>

export interface PropsWithStyles extends WithStyles<typeof styles> {
}

export const withStyles = muiWithStyles