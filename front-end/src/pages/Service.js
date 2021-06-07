import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, Grid, useTheme, DialogActions,
  DialogContent
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useParams } from "react-router-dom";
import { useFormik } from 'formik';
import * as yup from 'yup';

import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/Button';
import ManagerBackground from '../components/ManagerBackgroud';
import DialogBox from '../components/DialogBox';
import FormContainer from '../components/FormContainer';
import SubcategoryForm from '../components/SubcategoryForm';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import styles from '../styles/pages/Occupation.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function Users() {
  const classes = useStyles();
  const { setSnack } = useContext(SnackContext);
  let { occupation, name } = useParams();

  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState([]);
  const [serviceData, setServiceData] = useState('')

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, services.length - page * rowsPerPage);

  useEffect(() => {
    document.title = `${name} - Serviços / Salon Manager`
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/service/${occupation}/all`)

      setServices(response.data.services)
      setLoading(false)
    }, 500)

  }, [status, name, occupation]);

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
    description: yup.string()
      .required(true),
  });

  const create = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      description: '',
    },
    onSubmit: (values) => {
      handleCreate(values.description);
    },
  });

  const edit = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      description: '',
    },
    onSubmit: (values) => {
      handleEditConfirm(values.description);
    },
  })


  async function handleCreate(description) {
    try {
      await api.post(`/service/${occupation}`, { description });
      handleCancel();
      setSnack({ message: 'Serviço cadastrado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      create.resetForm();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleEdit(id, description) {
    setOpenModalEdit(true);
    setServiceData({ id: id, description: description });
    edit.values.description = description;
  }

  async function handleEditConfirm(description) {
    try {
      await api.put(`/service/${occupation}/${serviceData.id}`, { description });
      handleCancel();
      setSnack({ message: 'Serviço editado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/service/${occupation}/${serviceData.id}`);
      setSnack({ message: 'Serviço excluído com sucessso!', type: 'success', open: true });
      setStatus(status + 1);
      handleCancel();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalRegister(false);
    setOpenModalEdit(false);
    setOpenModalDelete(false);
  }


  return (
    <Navbar>
      <Container>
        <PageHeader
          title={`Serviços de ${name}`}
          subtitle="Aqui você poderá criar um novo ou gerenciar os serviços existentes."
          button={<KeyboardArrowLeft />}
          backLink="/create/occupation"
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          button={
            <>
              <PrimaryButton onClick={() => setOpenModalRegister(true)} variant="contained">Novo Serviço</PrimaryButton>
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
                      <TableCell>Descrição</TableCell>

                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>


                    {(rowsPerPage > 0 ? services.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : services).filter((items) => {

                      if (search === '') {
                        return items;
                      } else if (items.description.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';

                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row">{items.description}</TableCell>
                        <TableCell style={{ width: 230 }} align="right">
                          <PrimaryButton onClick={() => handleEdit(items._id, items.description)}><EditIcon /></PrimaryButton>
                          <PrimaryButton
                            onClick={() => {
                              setServiceData({ id: items._id, description: items.description });
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
                count={services.length}
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

        {/* DIALOG BOX: CRIAR SERVIÇO: INÍCIO */}
        <DialogBox
          open={openModalRegister}
          onClose={() => handleCancel()}
          title="Cadastro de serviço"
        >
          <form onSubmit={create.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do serviço"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="description"
                      label="Descrição"
                      variant="outlined"
                      value={create.values.description}
                      onChange={create.handleChange}
                      error={create.touched.description && Boolean(create.errors.description)}
                      helperText={create.touched.description && create.errors.description}
                      multiline
                      rows={8}
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
        {/* DIALOG BOX: CRIAR SERVIÇO: FIM */}

        {/* DIALOG BOX: EDITAR SERVIÇO: INÍCIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando ${serviceData.description}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do serviço"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="description"
                      label="Descrição"
                      variant="outlined"
                      value={edit.values.description}
                      onChange={edit.handleChange}
                      error={edit.touched.description && Boolean(edit.errors.description)}
                      helperText={edit.touched.description && edit.errors.description}
                      multiline
                      rows={8}
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
        {/* DIALOG BOX: EDITAR SERVIÇO: FIM */}

        {/* DIALOG BOX: DELETAR SERVIÇO: INÍCIO */}
        <DialogBox
          open={openModalDelete}
          onClose={() => handleCancel()}
          title={`Você deseja excluir ${serviceData.description}?`}
        >
          <div className={styles.delete}>
            <p>Após a confirmação o serviço será removido permanentemente.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => handleDelete()}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: DELETAR SERVIÇO: FIM */}

      </Container >
    </Navbar >
  );
}