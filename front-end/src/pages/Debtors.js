import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles,  Grid, useTheme, DialogActions,
  DialogContent
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useFormik } from 'formik';
import * as yup from 'yup';

import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import PrimaryButton from '../components/Button';
import ManagerBackground from '../components/ManagerBackgroud';
import DialogBox from '../components/DialogBox';
import FormContainer from '../components/FormContainer';
import SubcategoryForm from '../components/SubcategoryForm';
import { TelephoneMask } from '../components/inputMasks';

import EditIcon from '@material-ui/icons/Edit';
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

export default function Debtors() {
  const classes = useStyles();
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [debtors, setDebtors] = useState([]);
  const [debtorsData, setDebtorsData] = useState('')

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, debtors.length - page * rowsPerPage);

  useEffect(() => {
    document.title = "Financeiro - Devedores / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/debtor/${enterprise._id}/all`)

      setDebtors(response.data.debtor)
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

  const validationSchema = yup.object({
    customerName: yup.string()
      .required(true),
    phoneNumber: yup.string()
      .required(true),
  });

  const create = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      customerName: '',
      phoneNumber: '',
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleCreate(values.customerName, phoneNumber);
    },
  });

  const edit = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      customerName: '',
      phoneNumber: '',
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleEditConfirm(values.customerName, phoneNumber);
    },
  })

  async function handleCreate(customerName, phoneNumber) {
    try {
      await api.post(`/debtor/${enterprise._id}`, { customerName, phoneNumber });
      handleCancel();
      setSnack({ message: 'Devedor cadastrado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      create.resetForm();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleEdit(values) {
    edit.values.customerName = values.customerName;
    edit.values.phoneNumber = values.phoneNumber;
  }

  async function handleEditConfirm(name, description) {
    try {
      await api.put(`/debtor/${enterprise._id}/${debtorsData.id}`, { name, description });
      handleCancel();
      setSnack({ message: 'Devedor editado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalRegister(false);
    setOpenModalEdit(false);
    setDebtorsData({ customerName: '' });
  }

  return (
    <Navbar>
      <Container>
        <PageHeader
          title="Devedores"
          subtitle="Aqui você poderá criar ou gerenciar os clientes devedores do estabelecimento."
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          button={
            <>
              <PrimaryButton onClick={() => setOpenModalRegister(true)} variant="contained">Novo Devedor</PrimaryButton>
            </>
          }
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
                      <TableCell>Gerenciar Débitos</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? debtors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : debtors).filter((items) => {
                      
                      if (search === '') {
                        return items;
                      } else if (items.customerName.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';
                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row" style={{ width: 180 }}>
                          <PrimaryButton 
                            button 
                            variant="contained" 
                            component={Link} to={`/financial/accounts/${items.customerName}/${items._id}`}
                          >
                            Acessar
                          </PrimaryButton>
                        </TableCell>
                        <TableCell>{items.customerName}</TableCell>
                        <TableCell>{items.phoneNumber}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            onClick={() => {
                              handleEdit(items);
                              setOpenModalEdit(true);
                              setDebtorsData({
                                id: items._id,
                                customerName: items.customerName
                              });
                            }}>
                            <EditIcon />
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
                count={debtors.length}
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

        {/* DIALOG BOX: CRIAR DEVEDOR: INÍCIO */}
        <DialogBox
          open={openModalRegister}
          onClose={() => handleCancel()}
          title="Cadastro de devedores"
        >
          <form onSubmit={create.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do cliente devedor"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="customerName"
                      label="Nome"
                      variant="outlined"
                      value={create.values.customerName}
                      onChange={create.handleChange}
                      error={create.touched.customerName && Boolean(create.errors.customerName)}
                      helperText={create.touched.customerName && create.errors.customerName}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="phoneNumber"
                      label="Descrição"
                      variant="outlined"
                      value={create.values.phoneNumber}
                      onChange={create.handleChange}
                      error={create.touched.phoneNumber && Boolean(create.errors.phoneNumber)}
                      helperText={create.touched.phoneNumber && create.errors.phoneNumber}
                      InputProps={{
                        inputComponent: TelephoneMask,
                      }}
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
        {/* DIALOG BOX: CRIAR DEVEDOR: FIM */}

        {/* DIALOG BOX: EDITAR DEVEDOR: INÍCIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando ${debtorsData.customerName}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do cliente devedor"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="customerName"
                      label="Nome"
                      variant="outlined"
                      value={edit.values.customerName}
                      onChange={edit.handleChange}
                      error={edit.touched.customerName && Boolean(edit.errors.customerName)}
                      helperText={edit.touched.customerName && edit.errors.customerName}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="phoneNumber"
                      label="Telefone"
                      variant="outlined"
                      value={edit.values.phoneNumber}
                      onChange={edit.handleChange}
                      error={edit.touched.phoneNumber && Boolean(edit.errors.phoneNumber)}
                      helperText={edit.touched.phoneNumber && edit.errors.phoneNumber}
                      InputProps={{
                        inputComponent: TelephoneMask,
                      }}
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
        {/* DIALOG BOX: EDITAR DEVEDOR: FIM */}
      </Container >
    </Navbar >
  );
}