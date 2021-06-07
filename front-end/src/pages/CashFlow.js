import React, { useContext, useEffect, useState } from "react";
import {
  Container, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, makeStyles, DialogActions,
  useTheme, IconButton, TablePagination, TableContainer, TextField, Grid, InputAdornment, DialogContent, Card, CardActions, CardContent
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useFormik } from 'formik';
import * as yup from 'yup';

import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';

import NavBar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Calendar from "../components/Calendar";
import PrimaryButton from "../components/Button";
import CashFlowCards from "../components/CashFlowCards";
import DialogBox from "../components/DialogBox";
import { NumberFormats } from "../components/inputMasks";
import SubcategoryForm from "../components/SubcategoryForm";

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';
import modalStyles from '../styles/components/DialogBox.module.css';

import styles from '../styles/pages/CashFlow.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function CashFlow() {
  const classes = useStyles();

  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);
  const [selectedInitialDate, setSelectedInitialDate] = useState(new Date());
  const [selectedLastDate, setSelectedLastDate] = useState(new Date());
  const [selectedLimitDate, setSelectedLimitDate] = useState(new Date());
  const [includeModal, setIncludeModal] = useState(false);
  const [openModalAccountsPayable, setOpenModalAccountsPayable] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [revenues, setRevenues] = useState([]);
  const [outlays, setOutlays] = useState([]);
  const [accountsPayable, setAccountsPayable] = useState([]);
  const [movementStatus, setMovementStatus] = useState();
  const [currentAccount, setCurrentAccount] = useState([]);

  const [accountPage, setAccountPage] = useState(0);
  const [revenuePage, setRevenuePage] = useState(0);
  const [outlayPage, setOutlayPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const emptyAccount = rowsPerPage - Math.min(rowsPerPage, accountsPayable.length - accountPage * rowsPerPage);
  const emptyRevenue = rowsPerPage - Math.min(rowsPerPage, revenues.length - revenuePage * rowsPerPage);
  const emptyOutlay = rowsPerPage - Math.min(rowsPerPage, outlays.length - outlayPage * rowsPerPage);

  useEffect(() => {
    document.title = "Financeiro - Fluxo de Caixa / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      let initial = formatDate(selectedInitialDate);
      let last = formatDate(selectedLastDate);

      const revenue = await api.get(`/movement/${enterprise._id}/revenue?initial=${initial}&last=${last}`)
      setRevenues(revenue.data.revenues)

      const outlay = await api.get(`/movement/${enterprise._id}/outlay?initial=${initial}&last=${last}`)
      setOutlays(outlay.data.outlays)

      const accounts = await api.get(`/accountPayable/${enterprise._id}/period?last=${last}`)
      setAccountsPayable(accounts.data.accountPayables)

      const status = await api.get(`/movement/${enterprise._id}/status?initial=${initial}&last=${last}`)
      setMovementStatus({
        outlay: status.data.outlay.length > 0 ? status.data.outlay[0].total : 0,
        revenue: status.data.revenue.length > 0 ? status.data.revenue[0].total : 0,
        pending: status.data.pending.length > 0 ? status.data.pending[0].total : 0,
        money: status.data.money.length > 0 ? status.data.money[0].total : 0,
        credit: status.data.credit.length > 0 ? status.data.credit[0].total : 0,
        debit: status.data.debit.length > 0 ? status.data.debit[0].total : 0
      })
      setLoading(false)

    }, 500)
  }, [status, enterprise._id, selectedInitialDate, selectedLastDate]);

  // CONTEÚDO DE PÁGINAÇÃO DA TABELA: INICIO
  const useStyles1 = makeStyles((theme) => ({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }));

  const handleChangePageAccounts = (event, newPage) => {
    setAccountPage(newPage);
  };

  const handleChangeRowsPerPageAccounts = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setAccountPage(0);
  };

  const handleChangePageRevenue = (event, newPage) => {
    setRevenuePage(newPage);
  };

  const handleChangeRowsPerPageRevenue = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setRevenuePage(0);
  };

  const handleChangePageOutlay = (event, newPage) => {
    setOutlayPage(newPage);
  };

  const handleChangeRowsPerPageOutlay = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setOutlayPage(0);
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

  const accountPayablevalidation = yup.object({
    type: yup.string()
      .required(true),
    value: yup.number()
      .required(true),
  });

  const accountPayable = useFormik({
    validationSchema: accountPayablevalidation,
    initialValues: {
      type: '',
      value: ''
    },
    onSubmit: (values) => {
      handleCreateAccount(values.type, values.value, selectedLimitDate);
    },
  });

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

  async function handleCreateAccount(type, value, date) {
    let limitDate = formatDate(date);

    try {
      await api.post(`/accountPayable/${enterprise._id}`, { type, value, limitDate });
      setSnack({ message: 'Conta registrada com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      handleCancel();
    } catch (res) {
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

  // FORMATA O STATUS
  function formatStatus(status, date) {
    var day = date
    var today = formatDate(new Date())

    if (status === false && day === today)
      return 'Dia de Pagamento'

    if (status === false && day > today)
      return 'A Vencer'

    return 'Vencido'
  }


  // FECHA E LIMPA VÁRIAVEIS 
  function handleCancel() {
    setOpenModalAccountsPayable(false);
    accountPayable.resetForm();
  }

  return (
    <NavBar>
      <Container>
        <PageHeader
          title="Fluxo de Caixa"
          subtitle="Aqui você poderá acompanhar as movimentações do estabelecimento."
        />

        <div className={styles.header}>
          <div className={styles.content}>
            <div className={styles.calendar}>
              <Calendar
                label="Data início"
                value={selectedInitialDate}
                onChange={val => {
                  setSelectedInitialDate(val);
                  setStatus(status + 1);
                }}
                size="small"
              />
              <Calendar
                label="Data fim"
                value={selectedLastDate}
                onChange={val => {
                  setSelectedLastDate(val);
                  setStatus(status + 1);
                }}
                size="small"
              />
            </div>
          </div>
        </div>

        <div className={styles.cardContainer}>
          {loading
            ?
            <>
              <CashFlowCards
                title="Receitas"
                value={<Skeleton animation="wave" />}
              />

              <CashFlowCards
                title="Despesas"
                value={<Skeleton animation="wave" />}
              />

              <CashFlowCards
                title="Total Líquido"
                value={<Skeleton animation="wave" />}
              />

              <CashFlowCards
                title="Pendente"
                value={<Skeleton animation="wave" />}
              />

            </>
            :
            <>
              <CashFlowCards
                title="Receitas"
                value={formatMoney(movementStatus.revenue)}
              />
              <CashFlowCards
                title="Despesas"
                value={formatMoney(movementStatus.outlay)}
              />
              <CashFlowCards
                title="Total Líquido"
                value={formatMoney(movementStatus.revenue - movementStatus.outlay)}
              />
              <CashFlowCards
                title="Pendente"
                value={formatMoney(movementStatus.pending)}
              />
            </>

          }

        </div>
        <div className={styles.cardContainerPayment}>
          {loading
            ?
            <>
              <CashFlowCards
                title="Dinheiro"
                value={<Skeleton animation="wave" />}
              />

              <CashFlowCards
                title="Cartão de crédito"
                value={<Skeleton animation="wave" />}
              />

              <CashFlowCards
                title="Cartão de debito"
                value={<Skeleton animation="wave" />}
              />

            </>
            :
            <>
              <CashFlowCards
                title="Dinheiro"
                value={formatMoney(movementStatus.money)}
              />

              <CashFlowCards
                title="Cartão de crédito"
                value={formatMoney(movementStatus.credit)}
              />

              <CashFlowCards
                title="Cartão de débito"
                value={formatMoney(movementStatus.debit)}
              />
            </>
          }
        </div>

        <div className={styles.tablesDetails}>
          <div className={styles.table}>
            <Typography className={styles.tableTitle} variant="h6" id="tableTitle" component="div">
              Receitas
            </Typography>
            {loading
              ?
              <TableSkeleton height={53} style={{ marginBottom: 5 }} />
              :
              <>
                <TableContainer className={classes.container}>
                  <Table
                    className={classes.table}
                    aria-labelledby="tableTitle"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Título</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0 ? revenues.slice(revenuePage * rowsPerPage, revenuePage * rowsPerPage + rowsPerPage) : revenues).map(items => (
                        <TableRow key={items._id}>
                          <TableCell component="th" scope="row">{items.description}</TableCell>
                          <TableCell align="right">{formatMoney(items.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>

                    {emptyRevenue > 0 && (
                      <TableRow style={{ height: 53 * emptyRevenue }}>
                        <TableCell colSpan={2} />
                      </TableRow>
                    )}

                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 15]}
                  colSpan={2}
                  component="div"
                  count={revenues.length}
                  rowsPerPage={rowsPerPage}
                  page={revenuePage}
                  labelRowsPerPage="Linhas"
                  labelDisplayedRows={({ from, to, count }) => `Exibindo ${from} a ${to} de ${count} itens`}
                  onChangePage={handleChangePageRevenue}
                  onChangeRowsPerPage={handleChangeRowsPerPageRevenue}
                  ActionsComponent={TablePaginationActions}
                />
              </>
            }
          </div>
          <div className={styles.table}>
            <Typography className={styles.tableTitle} variant="h6" id="tableTitle" component="div">
              Despesas
            </Typography>

            {loading
              ?
              <TableSkeleton height={53} style={{ marginBottom: 5 }} />
              :
              <>
                <TableContainer className={classes.container}>
                  <Table
                    className={classes.table}
                    aria-labelledby="tableTitle"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Título</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0 ? outlays.slice(outlayPage * rowsPerPage, outlayPage * rowsPerPage + rowsPerPage) : outlays).map(items => (
                        <TableRow key={items._id}>
                          <TableCell component="th" scope="row">{items.description}</TableCell>
                          <TableCell align="right">{formatMoney(items.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>

                    {emptyOutlay > 0 && (
                      <TableRow style={{ height: 53 * emptyOutlay }}>
                        <TableCell colSpan={2} />
                      </TableRow>
                    )}

                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 15]}
                  colSpan={2}
                  component="div"
                  count={outlays.length}
                  rowsPerPage={rowsPerPage}
                  page={outlayPage}
                  labelRowsPerPage="Linhas"
                  labelDisplayedRows={({ from, to, count }) => `Exibindo ${from} a ${to} de ${count} itens`}
                  onChangePage={handleChangePageOutlay}
                  onChangeRowsPerPage={handleChangeRowsPerPageOutlay}
                  ActionsComponent={TablePaginationActions}
                />
              </>
            }
          </div>
        </div>

        <div className={styles.accountsPayable}>
          <div className={styles.tableHeader}>
            <Typography className={styles.tableTitle} variant="h6" id="tableTitle" component="div">
              Contas a Pagar
            </Typography>

            <div>
              <PrimaryButton variant="contained" onClick={() => setOpenModalAccountsPayable(true)}>Nova conta a pagar</PrimaryButton>
            </div>
          </div>
          {loading
            ?
            <TableSkeleton height={69} style={{ marginBottom: -5 }} />
            :
            <>
              <TableContainer className={classes.container}>
                <Table
                  className={classes.table}
                  aria-labelledby="tableTitle"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Data de Vencimento</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0 ? accountsPayable.slice(accountPage * rowsPerPage, accountPage * rowsPerPage + rowsPerPage) : accountsPayable).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row">{items.type}</TableCell>
                        <TableCell>{formatDateDayFrist(items.limitDate)}</TableCell>
                        <TableCell>{formatStatus(items.status, items.limitDate)}</TableCell>
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
                  </TableBody>

                  {emptyAccount > 0 && (
                    <TableRow style={{ height: 69 * emptyAccount }}>
                      <TableCell colSpan={5} />
                    </TableRow>
                  )}

                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                colSpan={5}
                component="div"
                count={accountsPayable.length}
                rowsPerPage={rowsPerPage}
                page={accountPage}
                labelRowsPerPage="Linhas"
                labelDisplayedRows={({ from, to, count }) => `Exibindo ${from} a ${to} de ${count} itens`}
                onChangePage={handleChangePageAccounts}
                onChangeRowsPerPage={handleChangeRowsPerPageAccounts}
                ActionsComponent={TablePaginationActions}
              />
            </>
          }
        </div>

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

        {/* DIALOG BOX: CRIAR CONTAS A PAGAR: INÍCIO */}
        <DialogBox
          open={openModalAccountsPayable}
          onClose={() => handleCancel()}
          title="Cadastro de Contas a Pagar"
        >
          <form onSubmit={accountPayable.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados da Conta"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="type"
                      label="Título"
                      variant="outlined"
                      value={accountPayable.values.type}
                      onChange={accountPayable.handleChange}
                      error={accountPayable.values.type && Boolean(accountPayable.errors.type)}
                      helperText={accountPayable.touched.type && accountPayable.errors.type}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="value"
                      label="Valor"
                      variant="outlined"
                      value={accountPayable.values.value}
                      onChange={accountPayable.handleChange}
                      error={accountPayable.touched.value && Boolean(accountPayable.errors.value)}
                      helperText={accountPayable.touched.value && accountPayable.errors.value}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputComponent: NumberFormats,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Calendar
                      label="Data de Vencimento"
                      value={selectedLimitDate}
                      onChange={val => {
                        setSelectedLimitDate(val);
                      }}
                      size="medium"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </div>
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
              <PrimaryButton type="submit">Confirmar</PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: CRIAR CONTAS A PAGAR: FIM */}
      </Container>
    </NavBar >
  )

  function TableSkeleton({ ...props }) {
    return (
      <>
        <Skeleton animation="wave" width="auto" height="56px" variant="rect" style={props.style} />

        {[1, 2, 3, 4, 5].map((n) =>
          <Skeleton key={n} animation="wave" width="auto" height={props.height} variant="rect" style={props.style} />
        )}

        <Skeleton animation="wave" width="auto" height="30px" variant="rect" style={props.style} />

      </>
    )
  }
}