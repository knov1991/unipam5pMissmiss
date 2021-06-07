import React, { useContext, useEffect, useState } from "react";
import {
  Container, InputAdornment, MenuItem, TextField, DialogActions,
  DialogContent, IconButton
} from "@material-ui/core";
import { Autocomplete, Skeleton } from '@material-ui/lab';
import { useFormik } from 'formik';
import * as yup from 'yup';

import AddIcon from '@material-ui/icons/Add';

import PrimaryButton from "../components/Button";
import NavBar from "../components/Navbar";
import DialogBox from '../components/DialogBox';
import SearchBar from '../components/SearchBar';
import PageHeader from "../components/PageHeader";
import Calendar from '../components/Calendar';
import SubcategoryForm from '../components/SubcategoryForm';
import { NumberFormats, TelephoneMask } from '../components/inputMasks';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import styles from '../styles/pages/ProductsAvailable.module.css';
import api from '../services/api';

export default function ProductsAvailable() {
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalR, setOpenModalR] = useState(false);
  const [openModalS, setOpenModalS] = useState(false);
  const [openModalDebtor, setOpenModalDebtor] = useState(false);
  const [selectedDeadLine, setSelectedDeadLine] = useState(new Date().setDate(new Date().getDate() + 30));

  const [inputDebtors, setInputDebtors] = useState('');

  const [products, setProducts] = useState([]);
  const [productInfo, setProductInfo] = useState('');
  const [debtors, setDebtors] = useState([]);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = "Produtos Disponíveis / Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/product/${enterprise._id}/all`);

      setProducts(response.data.products);
      setLoading(false)
    }, 500)

  }, [status, enterprise._id]);

  const reservationValidation = yup.object({
    customerName: yup.string()
      .required(true),
    quantity: yup.string()
      .required(true),
    phoneNumber: yup.string()
      .required(true)
  });

  const paymentValidation = yup.object({
    customerName: yup.string()
      .required(true),
    payment: yup.string()
      .required(true),
    value: yup.string()
      .required(true),
    quantity: yup.string()
      .required(true)
  });

  const debtorValidation = yup.object({
    customerName: yup.string()
      .required(true),
    phoneNumber: yup.string()
      .required(true)
  });

  const reservation = useFormik({
    validationSchema: reservationValidation,
    initialValues: {
      customerName: '',
      quantity: '',
      phoneNumber: '',
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleReservation(values.customerName, values.quantity, phoneNumber);
    },
  });

  const sale = useFormik({
    validationSchema: paymentValidation,
    initialValues: {
      customerName: '',
      payment: '',
      value: '',
      valuePayed: '',
      amountPaid: '',
      change: '',
      debtor: '',
      quantity: '',
    },
    onSubmit: (values) => {
      handlePayment(
        values.customerName,
        values.debtor._id,
        values.quantity,
        values.value,
        values.valuePayed,
        values.payment,
        formatDate(selectedDeadLine)
      );
    },
  });

  const debtor = useFormik({
    validationSchema: debtorValidation,
    initialValues: {
      customerName: '',
      phoneNumber: ''
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleCreateDebtor(values.customerName, phoneNumber)
    },
  });

  // Pagamento do produto
  async function handlePayment(customerName, debtor, quantity, value, valuePayed, paymentMethod, deadline) {
    try {
      var wasPaid;
      if (paymentMethod !== 'Prazo') {
        valuePayed = value;
        wasPaid = true
      } else {
        wasPaid = false
      }

      let description = productInfo.name;

      await api.put(`/reservation/${enterprise._id}/${productInfo.id}/sale`, {
        customerName, debtor, quantity, description, value, valuePayed, paymentMethod, deadline, wasPaid
      });
      handleCancel();
      setSnack({ message: 'Pagamento realizado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      sale.resetForm();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Cria Reserva
  async function handleReservation(customerName, quantity, phoneNumber) {
    try {
      await api.post(`/reservation/${enterprise._id}/${productInfo.id}`, { customerName, quantity, phoneNumber });
      setSnack({ message: 'Reserva realizada com sucesso!', type: 'success', open: true });
      reservation.resetForm();
      setStatus(status + 1);
      handleCancel();

    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Cria Devedor
  async function handleCreateDebtor(customerName, phoneNumber) {
    try {
      await api.post(`/debtor/${enterprise._id}`, { customerName, phoneNumber });
      setOpenModalDebtor(false);
      setOpenModalS(true);
      setSnack({ message: 'Devedor criado com sucesso!', type: 'success', open: true });
      loadDebtors();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Carrega os clientes devedores
  async function loadDebtors() {
    try {
      setTimeout(async () => {
        const response = await api.get(`/debtor/${enterprise._id}/all`)
        setDebtors(response.data.debtor);
      }, 1000)

    } catch (err) {
      setSnack({ message: 'Encontramos um erro ao carregar os devedores. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalR(false);
    setOpenModalS(false);
    reservation.resetForm();
    sale.resetForm();
  }

  // FORMATA DATA DO CALENDÁRIO (2021-01-01)
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
    <NavBar>
      <Container>

        <PageHeader
          title="Produtos Disponíveis"
          subtitle="Lista de todos os produtos que estão disponíveis para venda ou reserva."
        />

        <div className={styles.productContainer}>
          <SearchBar
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <div className={styles.productList}>
            {(loading)
              ?
              [1, 2, 3, 4].map((n) =>
                <Skeleton key={n} animation="wave" variant="rect" width="auto" style={{ minHeight: '500px', borderRadius: '5px', marginBottom: '1rem' }}></Skeleton>
              )
              :
              <>
                {products.filter((items) => {
                  if (search === '') {
                    return items;
                  } else if (items.name.toLowerCase().includes(search.toLowerCase())) {
                    return items;
                  }

                  return '';
                }).map(items => {
                  if (items.quantity > 0)
                    return (
                      <div key={items._id} className={styles.product}>
                        <img
                          src={
                            items.image !== undefined
                              ? `${process.env.REACT_APP_BASE_URL}/files/` + items.image
                              : "../product_default.png"}
                          alt={
                            "Imagem de " + items.name
                          }
                        />
                        <div className={styles.productInfo}>
                          <h4>{items.name}</h4>
                          <p>{items.description}</p>
                          <p>Disponível: {items.quantity}</p>
                          <strong>{formatMoney(items.value)}</strong>
                        </div>
                        <div className={styles.productBtn}>
                          <PrimaryButton onClick={() => {
                            setProductInfo({ id: items._id, name: items.name, quantity: items.quantity, value: items.value });
                            loadDebtors();
                            setOpenModalS(true)
                          }}
                            variant="contained"
                          >
                            Vender
                            </PrimaryButton>
                          <PrimaryButton onClick={() => {
                            setProductInfo({ id: items._id, name: items.name, quantity: items.quantity });
                            setOpenModalR(true)
                          }}
                            variant="contained"
                          >
                            Reservar
                          </PrimaryButton>
                        </div>
                      </div>
                    )
                })}
              </>
            }
          </div>

          {/* DIALOG BOX: RESERVA: INICIO */}
          <DialogBox
            open={openModalR}
            onClose={handleCancel}
            title={`Reservando ${productInfo.name}`}
          >
            <form onSubmit={reservation.handleSubmit}>
              <DialogContent>
                <div className={styles.productReservation}>
                  <div className={styles.inputBlock}>
                    <TextField
                      name="customerName"
                      label="Nome do Cliente"
                      type="text"
                      variant="outlined"
                      value={reservation.values.customerName}
                      onChange={reservation.handleChange}
                      error={reservation.touched.customerName && Boolean(reservation.errors.customerName)}
                      helperText={reservation.touched.customerName && reservation.errors.customerName}
                    />
                  </div>
                  <div className={styles.inputBlock}>
                    <TextField
                      name="phoneNumber"
                      label="Contato"
                      type="text"
                      variant="outlined"
                      value={reservation.values.phoneNumber}
                      onChange={reservation.handleChange}
                      error={reservation.touched.phoneNumber && Boolean(reservation.errors.phoneNumber)}
                      InputProps={{
                        inputComponent: TelephoneMask,
                      }}
                    />
                  </div>
                  <div className={styles.inputBlock}>
                    <TextField
                      name="quantity"
                      label="Quantidade"
                      type="number"
                      variant="outlined"
                      value={reservation.values.quantity}
                      onChange={reservation.handleChange}
                      error={reservation.touched.quantity && Boolean(reservation.errors.quantity)}
                      helperText={reservation.touched.quantity && reservation.errors.quantity}
                    />
                  </div>
                  <p>{(reservation.values.quantity > productInfo.quantity) ? `Limite ultrapassado (Max. ${productInfo.quantity})` : `Restam ${productInfo.quantity - reservation.values.quantity} und.`}</p>
                </div>
              </DialogContent>
              <DialogActions>
                <PrimaryButton onClick={handleCancel}>Cancelar</PrimaryButton>
                <PrimaryButton disabled={productInfo.quantity - reservation.values.quantity < 0 || reservation.values.quantity === ''} type="submit">Confirmar</PrimaryButton>
              </DialogActions>
            </form>
          </DialogBox>
          {/* DIALOG BOX: RESERVA: FIM */}

          {/* DIALOG BOX: VENDA: INICIO */}
          <DialogBox
            open={openModalS}
            onClose={handleCancel}
            title={`Vendendo ${productInfo.name}`}
          >
            <form onSubmit={sale.handleSubmit}>
              <DialogContent>
                <SubcategoryForm
                  title="Dados do Cliente"
                />
                <div className={styles.client}>
                  <div className={styles.inputBlock}>
                    <TextField
                      name="customerName"
                      label="Nome do Cliente"
                      variant="outlined"
                      value={sale.values.customerName}
                      onChange={sale.handleChange}
                      error={sale.touched.customerName && Boolean(sale.errors.customerName)}
                      helperText={sale.touched.customerName && sale.errors.customerName}
                      fullWidth
                    />
                  </div>
                </div>
                <SubcategoryForm
                  title="Dados de pagamento"
                />
                <div className={styles.payment}>
                  <div className={styles.inputBlock}>
                    <TextField
                      select
                      name="payment"
                      label="Método de Pagamento"
                      variant="outlined"
                      value={sale.values.payment}
                      onChange={sale.handleChange}
                      error={sale.touched.payment && Boolean(sale.errors.payment)}
                      helperText={sale.touched.payment && sale.errors.payment}
                      fullWidth
                    >
                      <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                      <MenuItem value="Crédito">Cartão de Crédito</MenuItem>
                      <MenuItem value="Débito">Cartão de Débito</MenuItem>
                      <MenuItem value="Prazo">A prazo</MenuItem>
                    </TextField>
                  </div>
                </div>
                <div className={styles.paymentInputsData} noValidate autoComplete="off">
                  {sale.values.payment !== '' && sale.values.custumerName !== ''
                    ?
                    <>
                      <div className={styles.inputBlock}>
                        <TextField
                          name="quantity"
                          label="Quantidade"
                          variant="outlined"
                          type="number"
                          value={sale.values.quantity}
                          onChange={sale.handleChange}
                          error={sale.touched.quantity && Boolean(sale.errors.quantity)}
                          helperText={sale.touched.quantity && sale.errors.quantity}
                          inputProps={{
                            pattern: "[0-9]*",
                          }}
                          fullWidth
                        />
                      </div>

                      <div className={styles.inputBlock}>
                        <TextField
                          name="value"
                          label="Total"
                          variant="outlined"
                          value={productInfo.value * sale.values.quantity}
                          onChange={sale.handleChange}
                          error={sale.touched.value && Boolean(sale.errors.value)}
                          helperText={sale.touched.value && sale.errors.value}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            inputComponent: NumberFormats,
                            readOnly: true
                          }}
                          fullWidth
                        />
                      </div>
                    </>
                    :
                    null
                  }
                  {sale.values.payment === 'Dinheiro'
                    ?
                    <>
                      <div className={styles.inputBlock}>
                        <TextField
                          name="amountPaid"
                          label="Valor Pago"
                          variant="outlined"
                          value={sale.values.amountPaid}
                          onChange={sale.handleChange}
                          error={sale.touched.amountPaid && Boolean(sale.errors.amountPaid)}
                          helperText={sale.touched.amountPaid && sale.errors.amountPaid}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            inputComponent: NumberFormats,
                          }}
                          fullWidth
                        />
                      </div>
                      <div className={styles.inputBlock}>
                        <TextField
                          name="change"
                          label="Troco"
                          variant="outlined"
                          value={(sale.values.amountPaid !== '' ? sale.values.amountPaid - sale.values.value : '')}
                          InputProps={{
                            readOnly: true,
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            inputComponent: NumberFormats,
                          }}
                          fullWidth
                        />
                      </div>
                    </>
                    :
                    null
                  }
                </div>
                {sale.values.payment === 'Prazo'
                  ?
                  <>
                    <SubcategoryForm
                      title="Dados da conta a pagar"
                    />
                    <div className={styles.inputsDebtor}>
                      <div className={styles.inputBlock}>
                        <Autocomplete
                          options={debtors}
                          value={sale.values.debtor}
                          onChange={(val, newValue) => {
                            sale.setFieldValue('debtor', newValue)
                            setInputDebtors(newValue)
                          }}
                          getOptionLabel={(option) => option.customerName}
                          inputValue={inputDebtors}
                          onInputChange={(event, newInputValue) => {
                            setInputDebtors(newInputValue)
                          }}
                          renderInput={(params) =>
                            <TextField
                              {...params}
                              label="Devedor"
                              variant="outlined"
                            />
                          }
                          disableClearable
                        />
                      </div>
                      <div className={styles.inputBlock}>
                        <IconButton color="primary" onClick={() => {
                          setOpenModalS(false);
                          setOpenModalDebtor(true)
                        }}
                        >
                          <AddIcon />
                        </IconButton>
                      </div>
                    </div>
                    <div className={styles.inputsDebtorData}>
                      <div className={styles.inputBlock}>
                        <Calendar
                          label="Próximo pagamento"
                          value={selectedDeadLine}
                          size="medium"
                          fullWidth
                          onChange={val => {
                            setSelectedDeadLine(val);
                          }}
                        />
                      </div>
                      <div className={styles.inputBlock}>
                        <TextField
                          name="valuePayed"
                          label="Valor Pago"
                          variant="outlined"
                          value={sale.values.valuePayed}
                          onChange={sale.handleChange}
                          error={sale.touched.valuePayed && Boolean(sale.errors.valuePayed)}
                          helperText={sale.touched.valuePayed && sale.errors.valuePayed}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            inputComponent: NumberFormats,
                          }}
                          fullWidth
                        />
                      </div>
                    </div>
                  </>
                  :
                  null
                }

                {sale.values.value < sale.values.valuePayed &&
                  <div className={styles.warning}>
                    <p>Valor pago não pode ser maior que valor do produto.</p>
                  </div>
                }

                <div className={styles.warning}>
                  <p>{(sale.values.quantity > productInfo.quantity) ? `Limite ultrapassado (Max. ${productInfo.quantity})` : `Restam ${productInfo.quantity - sale.values.quantity} und.`}</p>
                </div>

              </DialogContent>
              <DialogActions>
                <PrimaryButton onClick={handleCancel}>Cancelar</PrimaryButton>
                <PrimaryButton
                  disabled={
                    sale.values.quantity < 0 ||
                    sale.values.quantity === '' || sale.values.quantity < 1 ||
                    sale.values.payment === ''
                  }
                  type="submit"
                >
                  Confirmar
                    </PrimaryButton>
              </DialogActions>
            </form>
          </DialogBox>
          {/* DIALOG BOX: VENDA: FIM */}
        </div>
        {/* DIALOG BOX: CRIAR DEVEDOR: INICIO */}
        <DialogBox
          open={openModalDebtor}
          onClose={() => setOpenModalDebtor(false)}
          title="Novo devedor"
        >
          <form onSubmit={debtor.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do devedor"
              />
              <div className={styles.createDebtor}>
                <div className={styles.inputBlock}>
                  <TextField
                    name="customerName"
                    label="Nome do cliente"
                    variant="outlined"
                    value={debtor.values.customerName}
                    onChange={debtor.handleChange}
                    error={debtor.touched.customerName && Boolean(debtor.errors.customerName)}
                    helperText={debtor.touched.customerName && debtor.errors.customerName}
                    fullWidth
                  />
                </div>
                <div className={styles.inputBlock}>
                  <TextField
                    name="phoneNumber"
                    label="Telefone"
                    variant="outlined"
                    value={debtor.values.phoneNumber}
                    onChange={debtor.handleChange}
                    error={debtor.touched.phoneNumber && Boolean(debtor.errors.phoneNumber)}
                    helperText={debtor.touched.phoneNumber && debtor.errors.phoneNumber}
                    InputProps={{
                      inputComponent: TelephoneMask,
                    }}
                    fullWidth
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => {
                setOpenModalDebtor(false);
                setOpenModalS(true)
              }}>
                Fechar
              </PrimaryButton>
              <PrimaryButton type="submit">Confirmar</PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: CRIAR DEVEDOR: FIM */}
      </Container>
    </NavBar >
  );
}