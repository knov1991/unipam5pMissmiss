import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, useTheme,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import PrimaryButton from '../components/Button';
import ManagerBackground from '../components/ManagerBackgroud';
import FormContainer from '../components/FormContainer';

import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { AuthContext } from '../contexts/AuthContext';

import api from '../services/api';

import styles from '../styles/pages/CommissionUser.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function ComissionUsers() {
  const classes = useStyles();
  const { enterprise } = useContext(AuthContext);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, user.length - page * rowsPerPage);

  useEffect(() => {
    document.title = "Financeiro - Comissões / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/user/${enterprise._id}/comission`)

      setUser(response.data.schedules)
      setLoading(false)
    }, 500)

  }, [status, enterprise._id]);

  // CONTEÚDO DE PÁGINAÇÃO DA TABELA: INICIO
  const useStyles1 = makeStyles((theme) => ({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function TablePaginationActions(props) {
    const classes = useStyles1();
    const theme = useTheme();

    const { count, page, rowsPerPage, onChangePage } = props;

    const handleFirstPageButtonClick = (event) => {
      onChangePage(event, 0);
    };

    const handleBackButtonClick = (event) => {
      onChangePage(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
      onChangePage(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
      onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
      <div className={classes.root}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
  // CONTEÚDO DE PÁGINAÇÃO DA TABELA: FIM

  return (
    <Navbar>
      <Container>
        <PageHeader
          title="Comissões"
          subtitle="Aqui você poderá visualizar e acessar todos os funcionários que possuem comissão."
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <FormContainer>
          {(loading) ?
            <>
              <Skeleton animation="wave" width="auto" height="57px" variant="rect" />

              {[1, 2, 3, 4, 5].map((n) =>
                <Skeleton key={n} animation="wave" width="auto" height="69px" variant="rect" style={{ marginTop: 5 }} />
              )}

              <Skeleton animation="wave" width="auto" height="30px" variant="rect" style={{ marginTop: 5 }} />

            </>
            :
            <>
              <TableContainer className={classes.container}>
                <Table className={classes.table} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Gerenciar Comissões</TableCell>
                      <TableCell>Nome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? user.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : user).filter((items) => {
                      
                      if (search === '') {
                        return items;
                      } else if (items.name.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';
                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row" style={{ width: 180 }}>
                          <PrimaryButton 
                            button 
                            variant="contained" 
                            component={Link} to={`/financial/commission/${items.name}/${items._id}`}
                          >
                            Acessar
                          </PrimaryButton>
                        </TableCell>
                        <TableCell>{items.name}</TableCell>
                      </TableRow>
                    ))}

                    {emptyRows > 0 && (
                      <TableRow style={{ height: 69 * emptyRows }}>
                        <TableCell colSpan={2} />
                      </TableRow>
                    )}

                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                colSpan={2}
                component="div"
                count={user.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage="Linhas"
                labelDisplayedRows={({ from, to, count }) => `Exibindo ${from} a ${to} de ${count} itens`}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </>
          }
        </FormContainer>
      </Container >
    </Navbar >
  );
}