import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, Grid, useTheme, DialogActions,
  DialogContent
} from '@material-ui/core';
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

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import styles from '../styles/pages/Occupation.module.css';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  },
});

export default function Occupation() {
  const classes = useStyles();
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [occupations, setOccupations] = useState([]);
  const [occupationData, setOccupationData] = useState('')

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, occupations.length - page * rowsPerPage);

  useEffect(() => {
    document.title = "Gerenciar Funções / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/occupation/${enterprise._id}/all`)

      setOccupations(response.data.occupations)
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
    name: yup.string()
      .required(true),
  });

  const create = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      name: '',
      description: '',
    },
    onSubmit: (values) => {
      handleCreate(values.name, values.description);
    },
  });

  const edit = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      name: '',
      description: '',
    },
    onSubmit: (values) => {
      handleEditConfirm(values.name, values.description);
    },
  })

  async function handleCreate(name, description) {
    try {
      await api.post(`/occupation/${enterprise._id}`, { name, description });
      handleCancel();
      setSnack({ message: 'Função cadastrada com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      create.resetForm();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleEdit(values) {
    edit.values.name = values.name;
    edit.values.description = values.description;
  }

  async function handleEditConfirm(name, description) {
    try {
      await api.put(`/occupation/${enterprise._id}/${occupationData.id}`, { name, description });
      handleCancel();
      setSnack({ message: 'Função editada com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/occupation/${enterprise._id}/${id}`);
      setSnack({ message: 'Função excluída com sucessso!', type: 'success', open: true });
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
          title="Funções"
          subtitle="Aqui você poderá criar uma nova ou gerenciar as funções existentes."
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          button={
            <>
              <PrimaryButton onClick={() => setOpenModalRegister(true)} variant="contained">Nova Função</PrimaryButton>
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
                      <TableCell>Gerenciar Serviços</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? occupations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : occupations).filter((items) => {
                      if (search === '') {
                        return items;
                      } else if (items.name.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';
                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row" style={{ width: 180 }}>
                          <PrimaryButton button variant="contained" component={Link} to={`/service/${items.name}/${items._id}`}>Acessar</PrimaryButton>
                        </TableCell>
                        <TableCell>{items.name}</TableCell>
                        <TableCell>{items.description}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            onClick={() => {
                              handleEdit(items);
                              setOpenModalEdit(true);
                              setOccupationData({
                                id: items._id,
                                name: items.name
                              });
                            }}>
                            <EditIcon /></PrimaryButton>
                          <PrimaryButton
                            onClick={
                              () => {
                                setOccupationData({
                                  id: items._id,
                                  name: items.name
                                })
                                setOpenModalDelete(true)
                              }}>
                            <DeleteIcon />
                          </PrimaryButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {emptyRows > 0 && (
                      <TableRow style={{ height: 69 * emptyRows }}>
                        <TableCell colSpan={4} />
                      </TableRow>
                    )}

                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                colSpan={4}
                component="div"
                count={occupations.length}
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

        {/* DIALOG BOX: CRIAR FUNÇÃO: INÍCIO */}
        <DialogBox
          open={openModalRegister}
          onClose={() => handleCancel()}
          title="Cadastro de função"
        >
          <form onSubmit={create.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados da função"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="name"
                      label="Nome"
                      variant="outlined"
                      value={create.values.name}
                      onChange={create.handleChange}
                      error={create.touched.name && Boolean(create.errors.name)}
                      helperText={create.touched.name && create.errors.name}
                      fullWidth
                    />
                  </Grid>
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
        {/* DIALOG BOX: CRIAR FUNÇÃO: FIM */}

        {/* DIALOG BOX: EDITAR FUNÇÃO: INÍCIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando ${occupationData.name}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados da função"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="name"
                      label="Nome"
                      variant="outlined"
                      value={edit.values.name}
                      onChange={edit.handleChange}
                      error={edit.touched.name && Boolean(edit.errors.name)}
                      helperText={edit.touched.name && edit.errors.name}
                      fullWidth
                    />
                  </Grid>
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
        {/* DIALOG BOX: EDITAR FUNÇÃO: FIM */}

        {/* DIALOG BOX: DELETAR FUNÇÃO: INÍCIO */}
        <DialogBox
          open={openModalDelete}
          onClose={() => handleCancel()}
          title={`Você deseja excluir ${occupationData.description}?`}
        >
          <div className={styles.delete}>
            <p>Após a confirmação a função e os serviços relacionados serão removidos permanentemente.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => handleDelete(occupationData.id)}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: DELETAR FUNÇÃO: FIM */}

      </Container >
    </Navbar >
  );
}