import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, useTheme, DialogActions, TableFooter
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useParams } from "react-router-dom";

import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/Button';
import DialogBox from '../components/DialogBox';
import FormContainer from '../components/FormContainer';

import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import modalStyles from '../styles/components/DialogBox.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function ComissionUserList() {
  const classes = useStyles();
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);
  let { user, name } = useParams();

  const [includeModal, setIncludeModal] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');
  const [commissionTotal, setCommissionTotal] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, accounts.length - page * rowsPerPage);

  useEffect(() => {
    document.title = `Financeiro - Comissões de ${name} / Salon Manager`
    setLoading(true)
    setTimeout(async () => {
      const responseUser = await api.get(`/accountPayable/${enterprise._id}/${user}/commissions`);
      setAccounts(responseUser.data.commissions)

      const responseCommission = await api.get(`/accountPayable/${enterprise._id}/${user}/pending`);
      setCommissionTotal(responseCommission.data.pending[0])

      setLoading(false)
    }, 500)

  }, [status, name, user, enterprise._id]);

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

  // INCLUIR CONTA NO MOVIMENTO DO DIA
  async function includeAccount() {
    try {
      var value = currentAccount.value;
      var description = currentAccount.type;
      var date = formatDate(new Date())

      await api.post(`/movement/${enterprise._id}/${currentAccount._id}`, { value, description, date });
      setSnack({ message: 'Conta incluída no movimento com sucesso!', type: 'success', open: true })
      setIncludeModal(false);
      setStatus(status + 1);
    }
    catch {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }


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
          title={`Comissões de ${name}`}
          subtitle="Aqui contém todos as comissões ainda não pagas do funcionário."
          button={<KeyboardArrowLeft />}
          backLink="/financial/commission"
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
                      <TableCell>Item</TableCell>
                      <TableCell>Valor a receber</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? accounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : accounts).map(items => (
                      <TableRow key={items._id}>
                        <TableCell>{items.type}</TableCell>
                        <TableCell>{formatMoney(items.value)}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => {
                              setCurrentAccount(items)
                              setIncludeModal(true)
                            }}>
                            Pagar
                        </PrimaryButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {emptyRows > 0 && (
                      <TableRow style={{ height: 69 * emptyRows }}>
                        <TableCell colSpan={3} />
                      </TableRow>
                    )}

                  </TableBody>

                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="right">{formatMoney(commissionTotal !== undefined ? commissionTotal.total : 0)}</TableCell>
                  </TableRow>

                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                colSpan={3}
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


        {/* DIALOG BOX: INCLUIR CONTA: INICIO */}

        <DialogBox
          open={includeModal}
          onClose={() => setIncludeModal(false)}
          title={`Você deseja incluir ${currentAccount.type}?`}
        >
          <div className={modalStyles.marginModal}>
            <p>Após a confirmação a conta será incluída ao movimento do dia.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => setIncludeModal(false)}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => includeAccount()}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>

        {/* DIALOG BOX: INCLUIR CONTA: FIM */}
      </Container >
    </Navbar >
  );
}