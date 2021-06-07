import React, { useContext, useState, useEffect } from 'react';
import {
  Container, Table, TableContainer, TextField, Paper,
  TableCell, TableRow, TableBody, TableHead, TablePagination,
  makeStyles, Grid, useTheme, DialogContent, DialogActions, InputAdornment
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

import styles from '../styles/pages/Product.module.css';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  container: {
    boxShadow: 'none',
  }
});

export default function Product() {
  const classes = useStyles();

  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext)

  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [productData, setProductData] = useState('')
  const [products, setProducts] = useState([]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, products.length - page * rowsPerPage);

  useEffect(() => {
    document.title = "Gerenciar Produtos / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/product/${enterprise._id}/all`)

      setProducts(response.data.products);
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
    description: yup.string()
      .required(true),
    quantity: yup.string()
      .required(true),
    value: yup.string()
      .required(true),
  });

  const create = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      name: '',
      description: '',
      quantity: '',
      value: '',
      image: null
    },
    onSubmit: (values) => {
      handleCreate(values.name, values.description, values.quantity, values.value, values.image);
    },
  });

  const edit = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      name: '',
      description: '',
      quantity: '',
      value: '',
      image: null,
      cacheImage: null
    },
    onSubmit: (values) => {
      handleEditConfirm(values.name, values.description, values.quantity, values.value, values.image);
    },
  });


  async function handleCreate(name, description, quantity, value, image) {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("quantity", quantity);
      formData.append("value", value);
      formData.append("image", image);

      const config = {
        headers: {
          'content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        }
      };

      await api.post(`/product/${enterprise._id}`, formData, config);
      setSnack({ message: 'Produto cadastrado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      create.resetForm();
      handleCancel();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleEdit(values) {
    edit.values.name = values.name;
    edit.values.description = values.description;
    edit.values.quantity = values.quantity;
    edit.values.value = values.value;
    edit.values.image = values.image;
    edit.values.cacheImage = values.image;
  }

  async function handleEditConfirm(name, description, quantity, value, image) {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("quantity", quantity);
      formData.append("value", value);
      formData.append("image", image);

      const config = {
        headers: {
          'content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        }
      };

      await api.put(`/product/${enterprise._id}/${productData.id}`, formData, config);
      setSnack({ message: 'Produto editado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      edit.resetForm();
      handleCancel();
    } catch (err) {
      console.log(err)
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/product/${enterprise._id}/${id}`);
      setSnack({ message: 'Produto excluído com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      handleCancel()
    }
    catch {
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

  // FORMATAÇÃO PARA REAL
  function formatMoney(money) {
    return money.toLocaleString('pt-br',
      {
        style: 'currency', currency: 'BRL'
      }
    )
  }

  function productStatus(value){
    if(value > 0){
      return 'Em estoque'
    }

    return 'Fora de estoque'
  }

  return (
    <Navbar>
      <Container>
        <PageHeader
          title="Produtos"
          subtitle="Aqui você poderá criar um novo ou gerenciar os produtos existentes."
        />

        <ManagerBackground
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          button={
            <>
              <PrimaryButton onClick={() => setOpenModalRegister(true)} variant="contained">Novo Produto</PrimaryButton>
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
              <TableContainer className={classes.container} component={Paper}>
                <Table className={classes.table} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" scope="row">Nome</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {(rowsPerPage > 0 ? products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : products).filter((items) => {

                      if (search === '') {
                        return items;
                      } else if (items.name.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';

                    }).map(items => (
                      <TableRow key={items._id}>
                        <TableCell style={{ width: 250 }} component="th" scope="row">{items.name}</TableCell>
                        <TableCell style={{ width: 300 }} >{items.description}</TableCell>
                        <TableCell>{formatMoney(items.value)}</TableCell>
                        <TableCell>{items.quantity}</TableCell>
                        <TableCell>{productStatus(items.quantity)}</TableCell>
                        <TableCell align="right">
                          <PrimaryButton
                            onClick={
                              () => {
                                setProductData(items)
                                setOpenModalView(true)
                              }
                            }>
                            <VisibilityIcon />
                          </PrimaryButton>
                          <PrimaryButton
                            onClick={
                              () => {
                                handleEdit(items);
                                setProductData({
                                  id: items._id,
                                  name: items.name
                                });
                                setOpenModalEdit(true)
                              }
                            }>
                            <EditIcon />
                          </PrimaryButton>
                          <PrimaryButton onClick={
                            () => {
                              setProductData({
                                id: items._id,
                                name: items.name
                              });
                              setOpenModalDelete(true)
                            }
                          }>
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
                colSpan={5}
                component="div"
                count={products.length}
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

        {/* DIALOG BOX: VISUALIZAR PRODUTO: INICIO */}
        <DialogBox
          open={openModalView}
          onClose={() => handleCancel()}
          title={`${productData.name} - Informações`}
        >
          <div className={styles.box}>
            <DialogContent>
              <div className={styles.productData}>
                <div className={styles.upload}>
                  <img src={productData.image !== undefined ? `${process.env.REACT_APP_BASE_URL}/files/${productData.image}` : "../product_default.png"} alt="Sem Imagem" />
                </div>
                <div className={styles.dataBody}>
                  <strong>Descrição</strong>
                  <p>- {productData.description}</p>
                  <strong>Quantidade</strong>
                  <p>- Há {productData.quantity} {productData.quantity > 1 ? 'itens' : 'item'} em estoque</p>
                  <strong>Preço</strong>
                  <p>- {
                    productData.value !== undefined &&
                    formatMoney(productData.value)}
                  </p>
                </div>
              </div>
            </DialogContent>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => setOpenModalView(false)}>Fechar</PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: VISUALIZAR PRODUTO: FIM */}

        {/* DIALOG BOX: CADASTRAR PRODUTO: INÍCIO */}
        <DialogBox
          open={openModalRegister}
          onClose={() => handleCancel()}
          title="Cadastro de produto"
        >
          <form onSubmit={create.handleSubmit} encType="multipart/form-data">
            <DialogContent>
              <SubcategoryForm
                title="Imagem"
              />
              <div className={styles.createForm}>
                <Grid container item xs={12}>
                  <div className={styles.upload}>
                    <img src={create.values.image !== null ? URL.createObjectURL(create.values.image) : "../product_default.png"} alt="Imagem do Produto" />
                  </div>
                </Grid>
                <Grid container spacing={2}>
                  <Grid container item xs={12}>
                    <div className={styles.btn}>
                      <input
                        accept="image/*"
                        className={classes.input}
                        id="contained-button-file"
                        type="file"
                        name="image"
                        onChange={(event) => {
                          create.setFieldValue("image", event.currentTarget.files[0]);
                        }}
                        hidden
                      />
                      <label htmlFor="contained-button-file">
                        <PrimaryButton variant="contained" component="span">
                          Enviar Imagem
                      </PrimaryButton>
                      </label>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <SubcategoryForm
                      title="Dados do produto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Nome"
                      variant="outlined"
                      type="text"
                      value={create.values.name}
                      onChange={create.handleChange}
                      error={create.touched.name && Boolean(create.errors.name)}
                      helperText={create.touched.name && create.errors.name}
                      autoComplete="off"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Descrição"
                      variant="outlined"
                      type="text"
                      value={create.values.description}
                      onChange={create.handleChange}
                      error={create.touched.description && Boolean(create.errors.description)}
                      helperText={create.touched.description && create.errors.description}
                      multiline
                      rows={8}
                      autoComplete="off"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="value"
                      label="Preço"
                      variant="outlined"
                      type="text"
                      value={create.values.value}
                      onChange={create.handleChange}
                      error={create.touched.value && Boolean(create.errors.value)}
                      helperText={create.touched.value && create.errors.value}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputComponent: NumberFormats,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="quantity"
                      label="Quantidade disponível"
                      variant="outlined"
                      type="number"
                      value={create.values.quantity}
                      onChange={create.handleChange}
                      error={create.touched.quantity && Boolean(create.errors.quantity)}
                      helperText={create.touched.quantity && create.errors.quantity}
                      autoComplete="off"
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
        {/* DIALOG BOX: CADASTRAR PRODUTO: FIM */}

        {/* DIALOG BOX: EDITAR PRODUTO: INÍCIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando ${productData.name}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Imagem"
              />
              <div className={styles.createForm}>
                <Grid container item xs={12}>
                  <div className={styles.upload}>
                    <img
                      src={
                        edit.values.image !== undefined
                          ? edit.values.cacheImage !== edit.values.image
                            ? URL.createObjectURL(edit.values.image)
                            : `${process.env.REACT_APP_BASE_URL}/files/${edit.values.image}`
                          : "../product_default.png"}
                      alt="Imagem do Produto"
                    />
                  </div>
                </Grid>
                <Grid container spacing={2}>
                  <Grid container item xs={12}>
                    <div className={styles.btn}>
                      <input
                        accept="image/*"
                        className={classes.input}
                        id="contained-button-file"
                        type="file"
                        name="image"
                        onChange={(event) => {
                          edit.setFieldValue("image", event.currentTarget.files[0]);
                        }}
                        hidden
                      />
                      <label htmlFor="contained-button-file">
                        <PrimaryButton variant="contained" component="span">
                          Enviar Imagem
                      </PrimaryButton>
                      </label>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <SubcategoryForm
                      title="Dados do produto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Nome"
                      variant="outlined"
                      type="text"
                      value={edit.values.name}
                      onChange={edit.handleChange}
                      error={edit.touched.name && Boolean(edit.errors.name)}
                      helperText={edit.touched.name && edit.errors.name}
                      autoComplete="off"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Descrição"
                      variant="outlined"
                      type="text"
                      value={edit.values.description}
                      onChange={edit.handleChange}
                      error={edit.touched.description && Boolean(edit.errors.description)}
                      helperText={edit.touched.description && edit.errors.description}
                      multiline
                      rows={8}
                      autoComplete="off"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="value"
                      label="Preço"
                      variant="outlined"
                      type="text"
                      value={edit.values.value}
                      onChange={edit.handleChange}
                      error={edit.touched.value && Boolean(edit.errors.value)}
                      helperText={edit.touched.value && edit.errors.value}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputComponent: NumberFormats,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="quantity"
                      label="Quantidade disponível"
                      variant="outlined"
                      type="number"
                      value={edit.values.quantity}
                      onChange={edit.handleChange}
                      error={edit.touched.quantity && Boolean(edit.errors.quantity)}
                      helperText={edit.touched.quantity && edit.errors.quantity}
                      autoComplete="off"
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
        {/* DIALOG BOX: EDITAR PRODUTO: FIM */}

        {/* DIALOG BOX: DELETAR PRODUTO: INÍCIO */}
        <DialogBox
          open={openModalDelete}
          onClose={() => handleCancel()}
          title={`Você deseja excluir ${productData.name}?`}
        >
          <div className={styles.delete}>
            <p>Após a confirmação o produto será removido permanentemente.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => handleDelete(productData.id)}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: DELETAR PRODUTO: FIM */}
      </Container >
    </Navbar >
  );
}