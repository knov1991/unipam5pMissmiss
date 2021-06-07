import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, Grid, useTheme, DialogActions,
  DialogContent, MenuItem, InputAdornment
} from '@material-ui/core';

import { Skeleton } from '@material-ui/lab';
import { useFormik } from 'formik';
import * as yup from 'yup';

import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/Button';
import ManagerBackground from '../components/ManagerBackgroud';
import DialogBox from '../components/DialogBox';
import FormContainer from '../components/FormContainer';
import SubcategoryForm from '../components/SubcategoryForm';
import { NumberFormats } from '../components/inputMasks';
import Calendar from '../components/Calendar';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import modalStyles from '../styles/components/DialogBox.module.css';
import styles from '../styles/pages/AccountsPayable.module.css';

import api from '../services/api';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  }
});

export default function AccountsPayable() {
  const classes = useStyles();
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [includeModal, setIncludeModal] = useState(false);
  const [selectedLimitDate, setSelectedLimitDate] = useState(new Date());

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [selectAccounts, setSelectAccounts] = useState('notPayed');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, accounts.length - page * rowsPerPage);

  useEffect(() => {
    document.title = "Financeiro - Contas a Pagar / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/accountPayable/${enterprise._id}/${selectAccounts}`)
      setAccounts(response.data.accountPayables)
      setLoading(false)
    }, 500)

  }, [status, selectAccounts, enterprise._id]);

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
    type: yup.string()
      .required(true),
    value: yup.number()
      .required(true),
  });

  const create = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      type: '',
      value: ''
    },
    onSubmit: (values) => {
      handleCreate(values.type, values.value, selectedLimitDate);
    },
  });

  const edit = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      type: '',
      value: ''
    },
    onSubmit: (values) => {
      handleEditConfirm(values.type, values.value, selectedLimitDate);
    },
  })

  async function handleCreate(type, value, date) {
    let limitDate = formatDate(date);

    try {
      await api.post(`/accountPayable/${enterprise._id}`, { type, value, limitDate });
      setSnack({ message: 'Conta registrada com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      create.resetForm();
      handleCancel();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleEditConfirm(type, value, date) {
    let limitDate = formatDate(date);

    try {
      await api.put(`/accountPayable/${enterprise._id}/${currentAccount.id}`, { type, value, limitDate });
      setSnack({ message: 'Conta alterada com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      edit.resetForm();
      handleCancel();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/accountPayable/${enterprise._id}/${currentAccount._id}`);
      setSnack({ message: 'Conta excluída com sucessso!', type: 'success', open: true });
      setStatus(status + 1);
      handleCancel();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

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

  // SALVA DADOS PRA EDIÇÃO
  function setEditFormItems(id, type, value, limitDate) {
    setCurrentAccount({ id: id, type: type })
    edit.values.type = type;
    edit.values.value = value;

    var dateArray = limitDate.split("-");
    var year = dateArray[0];
    var month = parseInt(dateArray[1], 10) - 1;
    var date = dateArray[2];
    var finalDate = new Date(year, month, date);

    setSelectedLimitDate(finalDate)
  }

  // FECHA E LIMPA VÁRIAVEIS 
  function handleCancel() {
    setOpenModalRegister(false);
    setOpenModalEdit(false);
    setOpenModalDelete(false);
    setCurrentAccount({ type: '' })
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
  function formatStatus(status) {
    if (status === true) {
      return 'Pago';
    }

    return 'Não Pago';
  }

  return (
    <Navbar>
      <Container>
        <PageHeader
          title="Contas a Pagar"
          subtitle="Aqui você poderá criar ou gerenciar as contas a pagar do estabelecimento."
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          button={
            <>
              <PrimaryButton onClick={() => setOpenModalRegister(true)} variant="contained">Nova Conta a Pagar</PrimaryButton>
            </>
          }
        >
          <div className={styles.inputFilter}>
            <TextField
              select
              name="value"
              label="Visualizar contas"
              variant="outlined"
              size="small"
              value={selectAccounts}
              onChange={(e) => {
                setStatus(e.target.value);
                setSelectAccounts(e.target.value)
              }}
              defaultValue="Não Pagas"
              fullWidth
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="notPayed">Não Pagas</MenuItem>
              <MenuItem value="payed">Pagas</MenuItem>
            </TextField>
          </div>
        </ManagerBackground>
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
                      <TableCell>Título</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Data de Vencimento</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? accounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : accounts).filter((items) => {

                      if (search === '') {
                        return items;
                      } else if (items.type.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';

                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row">{items.type}</TableCell>
                        <TableCell>{formatMoney(items.value)}</TableCell>
                        <TableCell>{formatDateDayFrist(items.limitDate)}</TableCell>
                        <TableCell>{formatStatus(items.status)}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            disabled={items.status === true}
                            onClick={() => {
                              setCurrentAccount(items);
                              setIncludeModal(true)
                            }}>
                            <AttachMoneyIcon />
                          </PrimaryButton>
                          <PrimaryButton
                            disabled={items.status === true}
                            onClick={() => {
                              setEditFormItems(items._id, items.type, items.value, items.limitDate);
                              setOpenModalEdit(true)
                            }}>
                            <EditIcon />
                          </PrimaryButton>
                          <PrimaryButton
                            disabled={items.status === true}
                            onClick={() => {
                              setCurrentAccount(items);
                              setOpenModalDelete(true)
                            }}>
                            <DeleteIcon />
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
                count={accounts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage="Linhas por página"
                labelDisplayedRows={({ from, to, count }) => `Exibindo ${from} a ${to} de ${count} itens`}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </>
          }
        </FormContainer>

        {/* DIALOG BOX: CRIAR CONTAS A PAGAR: INÍCIO */}
        <DialogBox
          open={openModalRegister}
          onClose={() => handleCancel()}
          title="Cadastro de Contas a Pagar"
        >
          <form onSubmit={create.handleSubmit}>
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
                      value={create.values.type}
                      onChange={create.handleChange}
                      error={create.values.type && Boolean(create.errors.type)}
                      helperText={create.touched.type && create.errors.type}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="value"
                      label="Valor"
                      variant="outlined"
                      value={create.values.value}
                      onChange={create.handleChange}
                      error={create.touched.value && Boolean(create.errors.value)}
                      helperText={create.touched.value && create.errors.value}
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

        {/* DIALOG BOX: EDITAR CONTAS A PAGAR: INÍCIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando ${currentAccount.type}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados da conta"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="type"
                      label="Título"
                      variant="outlined"
                      value={edit.values.type}
                      onChange={edit.handleChange}
                      error={edit.values.type && Boolean(edit.errors.type)}
                      helperText={edit.touched.type && edit.errors.type}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="value"
                      label="Valor"
                      variant="outlined"
                      value={edit.values.value}
                      onChange={edit.handleChange}
                      error={edit.touched.value && Boolean(edit.errors.value)}
                      helperText={edit.touched.value && edit.errors.value}
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
        {/* DIALOG BOX: EDITAR CONTAS A PAGAR: FIM */}

        {/* DIALOG BOX: DELETAR CONTAS A PAGAR: INÍCIO */}

        <DialogBox
          open={openModalDelete}
          onClose={() => handleCancel()}
          title={`Você deseja excluir ${currentAccount.type}?`}
        >
          <div className={styles.delete}>
            <p>Após a confirmação a conta será removida permanentemente.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => handleDelete()}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>

        {/* DIALOG BOX: DELETAR CONTAS A PAGAR: FIM */}

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