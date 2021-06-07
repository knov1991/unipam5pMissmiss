import React, { useContext, useEffect, useState } from 'react';
import { Divider, Grid, Hidden, Menu, MenuItem } from '@material-ui/core';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { NavContext } from '../contexts/NavContext';

import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Toolbar from '@material-ui/core/Toolbar';
import { Skeleton } from '@material-ui/lab';

import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import DateRangeIcon from '@material-ui/icons/DateRange';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import BlockOutlinedIcon from '@material-ui/icons/BlockOutlined';
import ShoppingBasketOutlinedIcon from '@material-ui/icons/ShoppingBasketOutlined';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import HomeIcon from '@material-ui/icons/HomeOutlined';
import MoveToInboxOutlinedIcon from '@material-ui/icons/MoveToInboxOutlined';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import TrendingUpOutlinedIcon from '@material-ui/icons/TrendingUpOutlined';
import EmojiPeopleOutlinedIcon from '@material-ui/icons/EmojiPeopleOutlined';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import LibraryBooksOutlinedIcon from '@material-ui/icons/LibraryBooksOutlined';

import { makeStyles, useTheme, createStyles } from '@material-ui/core/styles';

import styles from '../styles/components/Navbar.module.css';

const drawerWidth = 260;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {

      [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
        zIndex: theme.zIndex.drawer + 1,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  }),
);

export default function NavBar({ children, ...props }) {
  const { window } = props;
  const theme = useTheme();
  const classes = useStyles();

  const { role, enterprise, handleLogout } = useContext(AuthContext);
  const { openProducts, openManager, openFinancial, loading, handleClickProducts, handleClickManager, handleClickFinancial, stopLoading } = useContext(NavContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const profileOpen = Boolean(profile);

  const location = useLocation();

  useEffect(() => {
    setTimeout(async () => {
      stopLoading()
    }, 1000)
  })

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfile = (event) => {
    setProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfile(null);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <List
        component="nav"
        className={styles.listStyle}
      >

        <ListItem button component={Link} to="/home" selected={location.pathname === "/home"}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Início" />
        </ListItem>

        {/* Início - Agenda: Funcionário e Gestor */}
        {(role !== "customer") ?
          <ListItem button component={Link} to="/schedule" selected={location.pathname === "/schedule"}>
            <ListItemIcon>
              <DateRangeIcon />
            </ListItemIcon>
            <ListItemText primary="Agenda" />
          </ListItem>
          : null}
        {/* Fim - Agenda: Funcionário e Gestor */}

        {/* Início - Comissões: Funcionário */}
        {(role === "employee") ?
          <ListItem button component={Link} to="/financial/employee/commission" selected={location.pathname === "/financial/employee/commission"}>
            <ListItemIcon>
              <AttachMoneyIcon />
            </ListItemIcon>
            <ListItemText primary="Minhas Comissões" />
          </ListItem>
          : null}
        {/* Fim - Comissões: Funcionário */}

        {/* Início - Financeiro: Gestor */}
        {(role === "manager") ?
          <>
            <ListItem button onClick={handleClickFinancial}>
              <ListItemIcon>
                <AttachMoneyIcon />
              </ListItemIcon>
              <ListItemText primary="Financeiro" />
              {openFinancial ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openFinancial} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={styles.subListItem} component={Link} to="/financial/cashflow" selected={location.pathname === "/financial/cashflow"}>
                  <ListItemIcon>
                    <TrendingUpOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Fluxo de Caixa" />
                </ListItem>
                <ListItem button className={styles.subListItem} component={Link} to="/financial/accounts/payable" selected={location.pathname === "/financial/accounts/payable"}>
                  <ListItemIcon>
                    <LibraryBooksOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Contas a Pagar" />
                </ListItem>
                <ListItem button className={styles.subListItem} component={Link} to="/financial/commission" selected={location.pathname === "/financial/commission"}>
                  <ListItemIcon>
                    <ClearAllIcon />
                  </ListItemIcon>
                  <ListItemText primary="Comissões" />
                </ListItem>
                <ListItem button className={styles.subListItem} component={Link} to="/financial/debtors" selected={location.pathname === "/financial/debtors"}>
                  <ListItemIcon>
                    <EmojiPeopleOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Devedores" />
                </ListItem>
              </List>
            </Collapse>
          </>
          : null}
        {/* Fim - Financeiro: Gestor */}

        {/* Início - Produtos: Funcionário e Gestor */}
        {(role === "customer") ?
          <ListItem button component={Link} to="/products/reservation" selected={location.pathname === "/products/reservation"}>
            <ListItemIcon>
              <ShoppingBasketOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Reserva de Produtos" />
          </ListItem>
          : null}
        {/* Fim- Produtos */}

        {/* Início - Produtos: Funcionário e Gestor */}
        {(role !== "customer") ?
          <>
            <ListItem button onClick={handleClickProducts}>
              <ListItemIcon>
                <ShoppingBasketOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Produtos" />
              {openProducts ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openProducts} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={styles.subListItem} component={Link} to="/products/available" selected={location.pathname === "/products/available"}>
                  <ListItemIcon>
                    <CheckOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Itens Disponíveis" />
                </ListItem>
                <ListItem button className={styles.subListItem} component={Link} to="/products/reserved" selected={location.pathname === "/products/reserved"}>
                  <ListItemIcon>
                    <BlockOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Itens Reservados" />
                </ListItem>
              </List>
            </Collapse>
          </>
          : null}
        {/* Fim- Produtos */}


        {/* Início - Cadastros: GESTOR */}
        {(role === "manager") ?
          <>
            <Divider />
            <ListItem button onClick={handleClickManager}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Gerenciar" />
              {openManager ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openManager} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={styles.subListItem} component={Link} to="/create/users" selected={location.pathname === "/create/users"}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Usuários" />
                </ListItem>
                <ListItem button className={styles.subListItem} component={Link} to="/create/products" selected={location.pathname === "/create/products"}>
                  <ListItemIcon>
                    <MoveToInboxOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Produtos" />
                </ListItem>
                <ListItem button className={styles.subListItem} component={Link} to="/create/occupation" selected={location.pathname === "/create/occupation"}>
                  <ListItemIcon>
                    <FilterNoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Funções" />
                </ListItem>
              </List>
            </Collapse>
          </>
          : null}
        {/* Fim - Cadastros: GESTOR*/}

      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        elevation={0}
        position="fixed"
        className={classes.appBar}
        color="primary"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>

          <Grid
            justify="space-between"
            alignItems="center"
            container
          >
            <Grid item>
              {(loading) ?
                <Skeleton animation="wave" width="150px" height="30px" />
                :
                <div className={styles.companyName}>
                  {(enterprise !== null)
                    ?
                    <strong>{enterprise.name}</strong>
                    :
                    <strong>Salon Manager</strong>
                  }
                </div>
              }
            </Grid>

            <Grid item>
              <div>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleProfile}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={profile}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={profileOpen}
                  onClose={handleProfileClose}
                >
                  <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
              </div>
            </Grid>
          </Grid>

        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <div className="drawer">
              {drawer}
            </div>
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            <div className={styles.drawer}>
              {drawer}
            </div>
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
}