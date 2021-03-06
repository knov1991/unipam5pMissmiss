import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Table, TableContainer, TextField,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, MenuItem, Grid, useTheme, DialogActions,
  DialogContent, Select, InputLabel, FormControl
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
import { TelephoneMask } from '../components/inputMasks';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import styles from '../styles/pages/Users.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  }
});

export default function Users() {
  const classes = useStyles();
  const { user, enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [userData, setUserData] = useState('')

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, users.length - page * rowsPerPage);

  useEffect(() => {
    document.title = "Gerenciar Usu??rios / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const responseUser = await api.get(`/user/${enterprise._id}/all`)
      setUsers(responseUser.data.users)
      const responseOccupations = await api.get(`/occupation/${enterprise._id}/all`)
      setOccupations(responseOccupations.data.occupations)
      setLoading(false)
    }, 500)

  }, [status, enterprise._id]);

  // CONTE??DO DE P??GINA????O DA TABELA: INICIO
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
  // CONTE??DO DE P??GINA????O DA TABELA: FIM

  const validationSchema = yup.object({
    username: yup.string()
      .required(true),
    password: yup.string()
      .min(8, 'A senha deve ter no m??nimo 8 caracteres!')
      .required(true),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password'), null], 'As senhas n??o conferem!')
      .required(true),
    name: yup.string()
      .required(true),
    type: yup.string()
      .required(true),
  });

  const create = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      type: '',
      commission: '',
      phoneNumber: '',
      occupation: []
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleCreate(values.username, values.name, values.password, values.type, values.commission, phoneNumber, values.occupation);
    },
  });

  const edit = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      type: '',
      commission: '',
      phoneNumber: '',
      occupation: []
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleEditConfirm(values.username, values.name, values.password, values.type, values.commission, phoneNumber, values.occupation);
    },
  })

  async function handleCreate(username, name, password, type, commission, phoneNumber, occupation) {
    try {
      await api.post(`/user/${enterprise._id}`, { username, name, password, type, commission, phoneNumber, occupation });
      setSnack({ message: 'Usu??rio cadastrado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      create.resetForm();
      handleCancel();
    } catch (res) {
      let err = res.response.data.error;

      if (err === "User already exists") {
        setSnack({ message: 'Usu??rio j?? cadastrado no sistema!', type: 'error', open: true });
      }

      else if (err === "Invalid type") {
        setSnack({ message: 'Tipo de usu??rio inv??lido!', type: 'error', open: true });
      }

      else if (err === "Type employee don't have comission property" || err === "Type customer don't have comission property") {
        setSnack({ message: 'Esse usu??rio n??o necessita de comiss??o!', type: 'error', open: true });
      }

      else if (err === "Occupation cannot be null") {
        setSnack({ message: '?? necess??rio atribuir uma fun????o ao usu??rio!', type: 'error', open: true });
      }

      else {
        setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
      }
    }
  }

  function handleEdit(values) {
    edit.values.username = values.username;
    edit.values.name = values.name;
    edit.values.commission = values.commission;
    edit.values.type = values.type;

    var occupations = [];

    for (var i = 0; i < values.occupation.length; i++) {
      const id = values.occupation[i]._id;

      occupations.push(id)
    }

    edit.values.occupation = occupations;
    edit.values.phoneNumber = values.phoneNumber;
  }

  async function handleEditConfirm(username, name, password, type, commission, phoneNumber, occupation) {
    try {
      await api.put(`/user/${enterprise._id}/${userData.id}`, { username, name, password, type, commission, phoneNumber, occupation });
      setSnack({ message: 'Usu??rio editado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      edit.resetForm();
      handleCancel();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/user/${enterprise._id}/${userData.id}`);
      setSnack({ message: 'Usu??rio exclu??do com sucessso!', type: 'success', open: true });
      setStatus(status + 1);
      handleCancel();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalView(false);
    setOpenModalRegister(false);
    setOpenModalEdit(false);
    setOpenModalDelete(false);  
    create.resetForm();
    edit.resetForm();
  }

  // CONVERTE O TIPO DE USU??RIO 
  function userType(type) {
    if (type === 'manager') {
      return 'Gestor';
    }
    else if (type === 'customer') {
      return 'Cliente';
    }
    else {
      return 'Funcion??rio';
    }
  }

  // CONVERTE A COMISS??O DO USU??RIO
  function userCommission(type, commission) {
    if (type !== 'employee') {
      return 'Sem comiss??o';
    }
    else if (commission === 0 || commission === null) {
      return 'Sem comiss??o'
    }
    else {
      return 'Comiss??o de ' + commission + '%';
    }
  }

  function readOccupation(values) {
    var occupations = [];

    if (values !== undefined) {
      for (var i = 0; i < values.length; i++) {
        const name = values[i].name;

        occupations.push(name)
      }
    }

    if (occupations.length === 0 || values === undefined) {
      return 'N??o possui fun????o atribu??da.'
    }

    if (occupations.length > 1) {
      return `${occupations}`
    }
    else {
      return occupations
    }
  }

  function mphone(value) {
    if (value !== undefined && value !== '' && value !== null) {
      var r = value.replace(/\D/g, "");
      r = r.replace(/^0/, "");
      if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
      } else {
        r = r.replace(/^(\d*)/, "($1");
      }
      return r;
    }
    else {
      return 'N??o possui telefone atribu??do.'
    }
  }

  return (
    <Navbar>
      <Container>
        <PageHeader
          title="Usu??rios"
          subtitle="Aqui voc?? poder?? criar um novo ou gerenciar os usu??rios existentes."
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          button={
            <>
              <PrimaryButton onClick={() => setOpenModalRegister(true)} variant="contained">Novo Usu??rio</PrimaryButton>
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
                      <TableCell>Nome</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Comiss??o</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : users).filter((items) => {

                      if (search === '') {
                        return items;
                      } else if (items.name.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      } else if (userType(items.type).toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';

                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell component="th" scope="row">{items.name} {(items._id === user._id) ? '(Voc??)' : null}</TableCell>
                        <TableCell>{userType(items.type)}</TableCell>
                        <TableCell>{userCommission(items.type, items.commission)}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            onClick={() => {
                              setUserData(items);
                              setOpenModalView(true)
                            }}>
                            <VisibilityIcon />
                          </PrimaryButton>
                          <PrimaryButton
                            onClick={() => {
                              handleEdit(items);
                              setUserData({
                                id: items._id,
                                name: items.name
                              });
                              setOpenModalEdit(true)
                            }}>
                            <EditIcon />
                          </PrimaryButton>
                          <PrimaryButton
                            disabled={user._id === items._id}
                            onClick={() => {
                              setUserData({
                                id: items._id,
                                name: items.name
                              });
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
                count={users.length}
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

        {/* DIALOG BOX: VISUALIZAR FUNCION??RIO: IN??CIO */}
        <DialogBox
          open={openModalView}
          onClose={() => handleCancel()}
          title={`${userData.name} - Perfil`}
        >
          <div className={styles.box}>
            <DialogContent>
              <div className={styles.employeeData}>
                <div className={styles.dataBody}>
                  <strong>Comiss??o</strong>
                  <p>- {userCommission(userData.type, userData.commission)}</p>
                  <strong>Telefone</strong>
                  <p>- {mphone(userData.phoneNumber)}</p>
                  <strong>Usu??rio de acesso</strong>
                  <p>- {userData.username}</p>
                  <strong>Fun????es</strong>
                  <p>- {readOccupation(userData.occupation)}</p>
                </div>
              </div>
            </DialogContent>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: VISUALIZAR FUNCION??RIO: FIM */}

        {/* DIALOG BOX: CRIAR FUNCION??RIO: IN??CIO */}
        <DialogBox
          open={openModalRegister}
          onClose={() => handleCancel()}
          title="Cadastro de funcion??rio"
        >
          <form onSubmit={create.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do usu??rio"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="username"
                      label="Usu??rio"
                      variant="outlined"
                      value={create.values.username}
                      onChange={create.handleChange}
                      error={create.touched.username && Boolean(create.errors.username)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="password"
                      label="Senha"
                      type="password"
                      variant="outlined"
                      value={create.values.password}
                      onChange={create.handleChange}
                      error={create.touched.password && Boolean(create.errors.password)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="confirmPassword"
                      label="Confirme a Senha"
                      type="password"
                      variant="outlined"
                      value={create.values.confirmPassword}
                      onChange={create.handleChange}
                      error={create.touched.confirmPassword && Boolean(create.errors.confirmPassword)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="type"
                      label="N??vel de Acesso"
                      value={create.values.type}
                      onChange={create.handleChange}
                      error={create.touched.type && Boolean(create.errors.type)}
                      variant="outlined"
                      fullWidth
                      select
                    >
                      <MenuItem value="customer">Cliente</MenuItem>
                      <MenuItem value="employee">Funcion??rio</MenuItem>
                      <MenuItem value="manager">Gestor</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </div>
              <SubcategoryForm
                title="Dados pessoais"
              />
              <div className={styles.secondDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Nome"
                      variant="outlined"
                      value={create.values.name}
                      onChange={create.handleChange}
                      error={create.touched.name && Boolean(create.errors.name)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="demo-mutiple-chip-label">Fun????es</InputLabel>
                      <Select
                        multiple
                        labelId="demo-mutiple-chip-label"
                        id="demo-mutiple-chip"
                        label="Fun????es"
                        name="occupation"
                        value={create.values.occupation}
                        onChange={create.handleChange}
                        error={create.touched.occupation && Boolean(create.errors.occupation)}
                        disabled={(create.values.type === "customer")}
                      >
                        {occupations.map((items) => (
                          <MenuItem key={items._id} value={items}>
                            {items.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="commission"
                      label="Comiss??o"
                      type="number"
                      variant="outlined"
                      value={create.values.commission}
                      onChange={create.handleChange}
                      error={create.touched.commission && Boolean(create.errors.commission)}
                      disabled={(create.values.type !== "employee")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="phoneNumber"
                      label="Telefone (Opcional)"
                      type="text"
                      variant="outlined"
                      value={create.values.phoneNumber}
                      onChange={create.handleChange}
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
        {/* DIALOG BOX: CRIAR FUNCION??RIO: FIM */}

        {/* DIALOG BOX: EDITAR FUNCION??RIO: IN??CIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando ${userData.name}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do usu??rio"
              />
              <div className={styles.firstDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      name="username"
                      label="Usu??rio"
                      variant="outlined"
                      value={edit.values.username}
                      onChange={edit.handleChange}
                      error={edit.touched.username && Boolean(edit.errors.username)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="password"
                      label="Senha"
                      type="password"
                      variant="outlined"
                      value={edit.values.password}
                      onChange={edit.handleChange}
                      error={edit.touched.password && Boolean(edit.errors.password)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="confirmPassword"
                      label="Confirme a Senha"
                      type="password"
                      variant="outlined"
                      value={edit.values.confirmPassword}
                      onChange={edit.handleChange}
                      error={edit.touched.confirmPassword && Boolean(edit.errors.confirmPassword)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="type"
                      label="N??vel de Acesso"
                      value={edit.values.type}
                      onChange={edit.handleChange}
                      error={edit.touched.type && Boolean(edit.errors.type)}
                      variant="outlined"
                      fullWidth
                      select
                    >
                      <MenuItem value="customer">Cliente</MenuItem>
                      <MenuItem value="employee">Funcion??rio</MenuItem>
                      <MenuItem value="manager">Gestor</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </div>
              <SubcategoryForm
                title="Dados pessoais"
              />
              <div className={styles.secondDataBox}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Nome"
                      variant="outlined"
                      value={edit.values.name}
                      onChange={edit.handleChange}
                      error={edit.touched.name && Boolean(edit.errors.name)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="demo-mutiple-chip-label">Fun????es</InputLabel>
                      <Select
                        multiple
                        labelId="demo-mutiple-chip-label"
                        id="demo-mutiple-chip"
                        label="Fun????es"
                        name="occupation"
                        value={edit.values.occupation}
                        onChange={edit.handleChange}
                        error={edit.touched.occupation && Boolean(edit.errors.occupation)}
                      >
                        {occupations.map((items) => (
                          <MenuItem key={items._id} value={items._id}>
                            {items.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="commission"
                      label="Comiss??o"
                      type="text"
                      variant="outlined"
                      value={edit.values.commission}
                      onChange={edit.handleChange}
                      error={edit.touched.commission && Boolean(edit.errors.commission)}
                      disabled={(edit.values.type !== "employee")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="phoneNumber"
                      label="Telefone (Opcional)"
                      type="text"
                      variant="outlined"
                      value={edit.values.phoneNumber}
                      onChange={edit.handleChange}
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
        {/* DIALOG BOX: EDITAR FUNCION??RIO: FIM */}

        {/* DIALOG BOX: DELETAR FUNCION??RIO: IN??CIO */}
        <DialogBox
          open={openModalDelete}
          onClose={() => handleCancel()}
          title={`Voc?? deseja excluir ${userData.name}?`}
        >
          <div className={styles.delete}>
            <p>Ap??s a confirma????o o usu??rio ser?? removido permanentemente.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => handleDelete()}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>

        {/* DIALOG BOX: DELETAR FUNCION??RIO: FIM */}

      </Container >
    </Navbar >
  );
}