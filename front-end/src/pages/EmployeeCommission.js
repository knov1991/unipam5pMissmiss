import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, useTheme, Typography
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';

import FormContainer from '../components/FormContainer';

import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import CashFlowCards from '../components/CashFlowCards';

import { AuthContext } from '../contexts/AuthContext';

import styles from '../styles/pages/EmployeeCommission.module.css';

import api from '../services/api';

const useStyles = makeStyles({
  table: {
    width: '100%',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function EmployeeCommission() {
  const classes = useStyles();
  const { user, enterprise } = useContext(AuthContext);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState([]);
  const [commissionTotal, setCommissionTotal] = useState([]);
  const [commissionTotalPayed, setCommissionTotalPayed] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, accounts.length - page * rowsPerPage);

  useEffect(() => {
    document.title = `Financeiro - Minhas Comissões / Salon Manager`
    setLoading(true)
    setTimeout(async () => {
      const responseUser = await api.get(`/accountPayable/${enterprise._id}/${user._id}/commissions`);
      setAccounts(responseUser.data.commissions)

      const responseCommission = await api.get(`/accountPayable/${enterprise._id}/${user._id}/pending`);
      setCommissionTotal(responseCommission.data.pending[0])

      const responseCommissionPayed = await api.get(`/accountPayable/${enterprise._id}/${user._id}/total`);
      setCommissionTotalPayed(responseCommissionPayed.data.total[0])

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

  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  // FORMATAÇÃO PARA REAL
  function formatMoney(money) {
    return money.toLocaleString('pt-br',
      {
        style: 'currency', currency: 'BRL'
      }
    )
  }

  return (
    <Navbar>
      <Container>
        <PageHeader
          title="Minhas Comissões"
          subtitle="Aqui contém suas comissões dos serviços realizados."
        />

        <div className={styles.cardContainer}>
          {loading
            ?
            <>
              <CashFlowCards
                title="Valor a receber"
                value={<Skeleton animation="wave" />}
              />

              <CashFlowCards
                title="Valor recebido em comissões"
                value={<Skeleton animation="wave" />}
              />
            </>
            :
            <>
              <CashFlowCards
                title="Valor a receber"
                value={formatMoney(commissionTotal !== undefined ? commissionTotal.total : 0)}
              />
              <CashFlowCards
                title="Valor recebido em comissões"
                value={formatMoney(commissionTotalPayed !== undefined ? commissionTotalPayed.total : 0)}
              />

            </>

          }

        </div>

        <FormContainer>
          <Typography className={styles.tableTitle} variant="h6" id="tableTitle" component="div">
            Serviços realizados
          </Typography>
          {(loading) ?
            <>
              <Skeleton animation="wave" width="auto" height="57px" variant="rect" />

              {[1, 2, 3, 4, 5].map((n) =>
                <Skeleton key={n} animation="wave" width="auto" height="53px" variant="rect" style={{ marginTop: 5 }} />
              )}

              <Skeleton animation="wave" width="auto" height="30px" variant="rect" style={{ marginTop: 5 }} />

            </>
            :
            <>
              <TableContainer className={classes.container}>
                <Table className={classes.table} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Valor a receber</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? accounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : accounts).map(items => (
                      <TableRow key={items._id}>
                        <TableCell>{items.type}</TableCell>
                        <TableCell>{formatMoney(items.value)}</TableCell>
                      </TableRow>
                    ))}

                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
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
                count={accounts.length}
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