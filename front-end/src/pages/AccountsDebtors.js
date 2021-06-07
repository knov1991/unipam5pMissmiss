import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, Grid, useTheme, DialogActions,
  DialogContent,
  InputAdornment,
  MenuItem
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useFormik } from 'formik';
import { useParams } from "react-router-dom";
import * as yup from 'yup';

import { NumberFormats } from '../components/inputMasks';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/Button';
import DialogBox from '../components/DialogBox';
import FormContainer from '../components/FormContainer';
import SubcategoryForm from '../components/SubcategoryForm';

import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import styles from '../styles/pages/Debtors.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function AccountsDebtors() {
  const classes = useStyles();
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);
  let { accounts, debtor } = useParams();

  const [openModalPayment, setOpenModalPayment] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [accountsDebtor, setAccountsDebtor] = useState([]);
  const [accountsDebtorData, setAccountsDebtorData] = useState('')

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, accountsDebtor.length - page * rowsPerPage);

  useEffect(() => {
    document.title = `Financeiro - Débitos de ${debtor} / Salon Manager`
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/accountReceivable/${enterprise._id}/${accounts}`)

      setAccountsDebtor(response.data.accountReceivable)
      setLoading(false)
    }, 500)

  }, [status, accounts, debtor, enterprise._id]);

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

  const validationSchema = yup.object({
    value: yup.string()
      .required(true),
  });

  const payment = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      payment: '',
      value: ''
    },
    onSubmit: (values) => {
      handlePayment(values.value, values.payment);
    },
  });

  async function handlePayment(value, paymentMethod) {
    try {

      let description = accountsDebtorData.description;
      await api.put(`/accountReceivable/${enterprise._id}/${accountsDebtorData.id}/payment`, { value, description, paymentMethod });
      handleCancel();
      setSnack({ message: `O valor foi adicionado com sucesso a conta de ${debtor}!`, type: 'success', open: true });
      setStatus(status + 1);
      payment.resetForm();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalPayment(false);
  }

  // FORMATA DATA DO CALENDÁRIO EM FORMA DE DIA, MêS E ANO
  function formatDateDayFrist(date) {
    var d = new Date(date);
    d = new Date(d.getTime() + d.getTimezoneOffset() * 60000)

    var month = '' + (d.getMonth() + 1);
    var day = '' + (d.getDate());
    var year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join('/');
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
          title={`Débitos de ${debtor}`}
          subtitle="Aqui contém todos os débitos pendentes com o estabelecimento."
          button={<KeyboardArrowLeft />}
          backLink="/financial/debtors"
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
                      <TableCell>Valor</TableCell>
                      <TableCell>Valor Pago</TableCell>
                      <TableCell>Pendente</TableCell>
                      <TableCell>Próxima Data de Pagamento</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? accountsDebtor.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : accountsDebtor).map(items => (
                      <TableRow key={items._id}>
                        <TableCell>{items.description}</TableCell>
                        <TableCell>{formatMoney(items.value)}</TableCell>
                        <TableCell>{formatMoney(items.valuePayed)}</TableCell>
                        <TableCell>{formatMoney(items.value - items.valuePayed)}</TableCell>
                        <TableCell>{formatDateDayFrist(items.deadline)}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => {
                              setAccountsDebtorData({
                                id: items._id,
                                description: items.description,
                                value: items.value - items.valuePayed,
                              });
                              setOpenModalPayment(true)
                            }}>
                            Pagar
                          </PrimaryButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {emptyRows > 0 && (
                      <TableRow style={{ height: 69 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}

                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                colSpan={4}
                component="div"
                count={accountsDebtor.length}
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

        {/* DIALOG BOX: PAGAR CONTA: INÍCIO */}
        <DialogBox
          open={openModalPayment}
          onClose={() => handleCancel()}
          title={`Pagamento de ${accountsDebtorData.description || 'Desconhecido'}`}
        >
          <form onSubmit={payment.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do Pagamento"
              />
              <div className={styles.payment}>
                <div className={styles.inputBlock}>
                  <TextField
                    select
                    name="payment"
                    label="Método de Pagamento"
                    variant="outlined"
                    value={payment.values.payment}
                    onChange={payment.handleChange}
                    error={payment.touched.payment && Boolean(payment.errors.payment)}
                    helperText={payment.touched.payment && payment.errors.payment}
                    fullWidth
                  >
                    <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                    <MenuItem value="Crédito">Cartão de Crédito</MenuItem>
                    <MenuItem value="Débito">Cartão de Débito</MenuItem>
                  </TextField>
                </div>
                {payment.values.payment &&
                  <div className={styles.inputBlock}>
                    <TextField
                      name="value"
                      label="Valor a Pagar"
                      variant="outlined"
                      value={payment.values.value}
                      onChange={payment.handleChange}
                      error={payment.touched.value && Boolean(payment.errors.value)}
                      helperText={payment.touched.value && payment.errors.value}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputComponent: NumberFormats,
                      }}
                      fullWidth
                    />
                  </div>
                }
              </div>
              {accountsDebtorData &&
                <p className={styles.warning}>
                  {`Valor pendente para pagamento é de ${formatMoney(accountsDebtorData.value)}`}
                </p>
              }
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
              <PrimaryButton type="submit" disabled={payment.values.value > accountsDebtorData.value}>Confirmar</PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: PAGAR CONTA: FIM */}
      </Container >
    </Navbar >
  );
}