// Originally from https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard/Dashboard.js

import * as React from 'react';
import clsx from 'clsx';


import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MuiList from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MuiLink from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';

import Tooltip from '@material-ui/core/Tooltip'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
//import { mainListItems, secondaryListItems } from './listItems';

import {PropsWithStyles, withStyles, Styles, styles} from './../mui-styles'

import { connect, AppState } from "../global-state";


import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'

import {Link} from 'react-router-dom'


import NetworkSelect from '../components/NetworkSelect'

type _ListItem = {
    text : string
    link : string
    icon : React.ReactElement
}

export function drawerListItems(items : _ListItem[]) {
    return <div>
    {
        items.map((item, ix) => {
            return <ListItem key={ix} button>
                <Tooltip title={item.text}>
                    <ListItemIcon>
                        <Link to={item.link}>
                            {item.icon}
                        </Link>
                    </ListItemIcon>
                </Tooltip>
                <ListItemText primary={item.text} />
            </ListItem>
        })
    }
    </div>
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://foo.bar.com">
        Foo Bar
      </MuiLink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// -----------------------------------------------------------------------------

function _AppBar(p: {
    classes : Styles
    open : boolean
    handleDrawerOpen : () => void
}) {
    const classes = p.classes
    
    return <AppBar position="absolute" className={clsx(classes.appBar, p.open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={p.handleDrawerOpen}
                className={clsx(classes.menuButton, p.open && classes.menuButtonHidden)}
            >
                <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                Aeternity Playground
            </Typography>

            <NetworkSelect />
        </Toolbar>
    </AppBar>
}


// -----------------------------------------------------------------------------

function _Drawer(p: {
    classes : Styles
    open : boolean
    handleDrawerClose : () => void

    mainListItems : React.ReactElement
}) {
    const classes = p.classes
    
    return  <Drawer
        variant="permanent"
        classes={{
            paper: clsx(classes.drawerPaper, !p.open && classes.drawerPaperClose),
        }}
        open={p.open}
    >
        <div className={classes.toolbarIcon}>
            <IconButton onClick={p.handleDrawerClose}>
                <ChevronLeftIcon />
            </IconButton>
        </div>
        <Divider />
        <MuiList>{p.mainListItems}</MuiList>

    {/*}
        <Divider />
        <MuiList>{secondaryListItems}</MuiList>
    */}
    </Drawer>
}


function _Logs(p : {
    open : boolean
}) {
    if (p.open) {
        return <div></div>
    } else {
        return <div />
    }
}


// -----------------------------------------------------------------------------


interface Props extends PropsWithStyles {
    children : NonNullable<React.ReactElement>
    drawerMainListItems : React.ReactElement
}

interface State {
    openDrawer : boolean
    showLogs   : boolean
}

class _Dashboard extends React.PureComponent<Props, State> {
    constructor(props: Props, ctx? : any) {
        super(props, ctx)

        this.state = {
            openDrawer : false,
            showLogs   : true
        }
    }

    render() {
        const p = this.props
        const s = this.state

        const classes = p.classes

        //const [open, setOpen] = React.useState(false);

        const handleDrawerOpen = () => {
            //this.setState({openDrawer : true})
        }
        const handleDrawerClose = () => {
            this.setState({openDrawer : false})
        };
        

        const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

        return (
            <div className={classes.root}>
                <CssBaseline />

                <_AppBar classes={classes} open={s.openDrawer} handleDrawerOpen={handleDrawerOpen} />
                
                <_Drawer classes={classes} open={s.openDrawer} handleDrawerClose={handleDrawerClose} 
                    mainListItems={p.drawerMainListItems}
                />
        
                <main className={classes.content}>
                    <div className={classes.appBarSpacer} />
                    <Container fixed maxWidth="xl" className={classes.container} children={p.children} />
                    <_Logs open={s.showLogs} /> 
                    <Copyright />
                </main>
            </div>
        )
    }
}

export default withStyles(styles)(_Dashboard)