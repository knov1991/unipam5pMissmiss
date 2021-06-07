import { useContext, useEffect, useState } from "react";
import {
  Container, DialogActions, DialogContent, Hidden, InputAdornment,
  MenuItem, TextField, IconButton
} from "@material-ui/core";
import { Autocomplete, Skeleton } from "@material-ui/lab";
import { useFormik } from 'formik';
import * as yup from 'yup';

import PrimaryButton from "../components/Button";
import NavBar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import PageHeader from "../components/PageHeader";
import DialogBox from "../components/DialogBox";
import SubcategoryForm from "../components/SubcategoryForm";
import { NumberFormats, TelephoneMask } from "../components/inputMasks";
import Calendar from "../components/Calendar";

import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import AddIcon from '@material-ui/icons/Add';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import styles from '../styles/pages/ProductsReserved.module.css';



export default function ProductsReserved() {
  const { enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);
  const [openModalR, setOpenModalR] = useState(false);
  const [openModalC, setOpenModalC] = useState(false);
  const [openModalDebtor, setOpenModalDebtor] = useState(false);
  const [selectedDeadLine, setSelectedDeadLine] = useState(new Date().setDate(new Date().getDate() + 30));

  const [inputDebtors, setInputDebtors] = useState('');

  const [reservation, setReservation] = useState([]);
  const [reservationInfo, setReservationInfo] = useState('');
  const [debtors, setDebtors] = useState([]);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = "Produtos Reservados / Salon Manager"

    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/reservation/${enterprise._id}/all`);

      setReservation(response.data.reservation);
      setLoading(false)
    }, 500)

  }, [status, enterprise._id]);

  const paymentValidation = yup.object({
    payment: yup.string()
      .required(true),
    value: yup.string()
      .required(true),
  });

  const debtorValidation = yup.object({
    customerName: yup.string()
      .required(true),
    phoneNumber: yup.string()
      .required(true)
  });


  const sale = useFormik({
    validationSchema: paymentValidation,
    initialValues: {
      payment: '',
      value: '',
      valuePayed: '',
      amountPaid: '',
      change: '',
      debtor: '',
    },
    onSubmit: (values) => {
      handlePayment(
        values.debtor._id,
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
  async function handlePayment(debtor, value, valuePayed, paymentMethod, deadline) {
    try {
      var wasPaid;
      if (paymentMethod !== 'Prazo') {
        valuePayed = value;
        wasPaid = true
      } else {
        wasPaid = false
      }

      let description = reservationInfo.product;
     
      console.log(debtor, value, valuePayed, paymentMethod, deadline)
      await api.put(`/reservation/${enterprise._id}/${reservationInfo.id}/payment`, {
        description, debtor, value, valuePayed, paymentMethod, deadline, wasPaid
      });
      handleCancel();
      setSnack({ message: `Reserva de ${reservationInfo.customer} foi atentida com sucesso!`, type: 'success', open: true });
      setStatus(status + 1);
      sale.resetForm();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/reservation/${enterprise._id}/${reservationInfo.id}`)
      setStatus(status + 1);
      setSnack({ message: `Reserva de ${reservationInfo.customerName} foi cancelada com sucesso!`, type: 'success', open: true });
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
      setOpenModalR(true);
      setSnack({ message: 'Devedor criado com sucesso!', type: 'success', open: true });
      loadDebtors();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalC(false);
    setOpenModalR(false);
    sale.resetForm();
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
        <div>

          <PageHeader
            title="Produtos Reservados"
            subtitle="Lista de todos os produtos que foram reservados."
          />

          <SearchBar
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <Hidden smUp>
            <div className={styles.productList}>
              {(loading)
                ?
                [1, 2, 3, 4].map((n) =>
                  <Skeleton key={n} animation="wave" width="auto" height="150px" variant="rect" style={{ marginTop: 10, borderRadius: 5 }} />
                )
                :
                <>
                  <div className={styles.productReserved}>
                    <div className={styles.productHeader}>
                      <strong>Cliente</strong>
                      <strong>Produto</strong>
                      <strong>Quantidade</strong>
                      <strong>Valor (UN)</strong>
                      <strong>Total</strong>
                    </div>


                    {reservation.filter((items) => {
                      if (search === '') {
                        return items;
                      } else if (items.product !== null ? items.product.name.toLowerCase().includes(search.toLowerCase()) : '') {
                        return items;
                      } else if (items.customerName.toLowerCase().includes(search.toLowerCase())) {
                        return items;
                      }

                      return '';
                    }).map(items => {
                      if (items.status === false)
                        return (
                          <div key={items._id} className={styles.productReservationData}>
                            <div className={styles.productBody}>
                              <strong>{items.customerName}</strong>
                              <strong>{items.product.name}</strong>
                              <strong>{items.quantity}</strong>
                              <strong>{formatMoney(items.product.value)}</strong>
                              <strong>{formatMoney(items.quantity * items.product.value)}</strong>
                            </div>
                            <div className={styles.productBtn}>
                              <PrimaryButton onClick={() => {
                                setReservationInfo({
                                  id: items._id,
                                  customer: items.customerName,
                                  phoneNumber: items.phoneNumber,
                                  quantity: items.quantity,
                                  product: items.product.name,
                                  value: items.product.value
                                });
                                loadDebtors();
                                setOpenModalR(true);
                              }}>
                                <DoneIcon />
                              </PrimaryButton>
                              <PrimaryButton onClick={() => {
                                setReservationInfo({
                                  id: items._id,
                                  customer: items.customerName,
                                });
                                setOpenModalC(true);
                              }}>
                                <ClearIcon />
                              </PrimaryButton>
                            </div>
                          </div>
                        )
                    })}
                  </div>
                </>
              }
            </div>
          </Hidden>
          <Hidden only="xs">
            <div className={styles.productList}>
              {(loading)
                ?
                [1, 2, 3, 4].map((n) =>
                  <Skeleton key={n} animation="wave" width="auto" height="76px" variant="rect" style={{ marginTop: 10, borderRadius: 5 }} />
                )
                :
                <>
                  <div className={styles.productReserved}>
                    <div className={styles.productInfo}>
                      <strong>Cliente</strong>
                      <strong>Produto</strong>
                      <strong>Quantidade</strong>
                      <strong>Valor (UN)</strong>
                      <strong>Total</strong>
                    </div>
                  </div>

                  {reservation.filter((items) => {
                    if (search === '') {
                      return items;
                    } else if (items.product !== null ? items.product.name.toLowerCase().includes(search.toLowerCase()) : '') {
                      return items;
                    } else if (items.customerName.toLowerCase().includes(search.toLowerCase())) {
                      return items;
                    }

                    return '';
                  }).map(items => {
                    if (items.status === false)
                      return (
                        <div key={items._id} className={styles.productReserved}>
                          <div className={styles.productInfo}>
                            <strong>{items.customerName}</strong>
                            <strong>{items.product.name}</strong>
                            <strong>{items.quantity}</strong>
                            <strong>{formatMoney(items.product.value)}</strong>
                            <strong>{formatMoney(items.quantity * items.product.value)}</strong>
                          </div>
                          <div className={styles.productBtn}>
                            <PrimaryButton onClick={() => {
                              setReservationInfo({
                                id: items._id,
                                customer: items.customerName,
                                phoneNumber: items.phoneNumber,
                                quantity: items.quantity,
                                product: items.product.name,
                                total: items.quantity * items.product.value
                              });
                              loadDebtors();
                              setOpenModalR(true);
                            }}>
                              <DoneIcon />
                            </PrimaryButton>
                            <PrimaryButton onClick={() => {
                              setReservationInfo({
                                id: items._id,
                                customer: items.customerName,
                              });
                              setOpenModalC(true);
                            }}>
                              <ClearIcon />
                            </PrimaryButton>
                          </div>
                        </div>
                      )
                  })}
                </>
              }
            </div>
          </Hidden>

          {/* DIALOG BOX: CONFIRMAR RESERVA: INICIO */}
          <DialogBox
            open={openModalR}
            onClose={() => setOpenModalR(false)}
            title={`Confirmar Reserva de ${reservationInfo.customer}`}
          >
            <form onSubmit={sale.handleSubmit}>
              <DialogContent>
                <SubcategoryForm
                  title="Dados do cliente"
                />

                <div className={styles.clientDetails}>
                  <div className={styles.inputBlock}>
                    <TextField
                      label="Nome do Cliente"
                      type="text"
                      variant="outlined"
                      value={reservationInfo.customer}
                      inputProps={{
                        readOnly: true
                      }}
                      fullWidth
                    />
                  </div>
                  <div className={styles.inputBlock}>
                    <TextField
                      label="Contato"
                      type="text"
                      variant="outlined"
                      value={reservationInfo.phoneNumber}
                      inputProps={{
                        readOnly: true
                      }}
                      fullWidth
                    />
                  </div>
                  <div className={styles.inputBlock}>
                    <TextField
                      label="Quantidade"
                      type="number"
                      variant="outlined"
                      value={reservationInfo.quantity}
                      inputProps={{
                        readOnly: true
                      }}
                      fullWidth
                    />
                  </div>
                </div>
                <div className={styles.whatsappButton}>

                  <PrimaryButton variant="outlined" startIcon={<WhatsAppIcon />} onClick={() =>
                    window.open(`https://api.whatsapp.com/send?phone=55${reservationInfo.phoneNumber}`, '_blank'
                    )}>
                    Enviar mensagem para {reservationInfo.customer} por WhatsApp
                    </PrimaryButton>
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
                      onChange={(val) => {
                        sale.handleChange(val);
                        sale.setFieldValue('value', reservationInfo.total);
                      }}
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
                          name="value"
                          label="Total"
                          variant="outlined"
                          value={sale.values.value}
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
                          setOpenModalR(false);
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
              </DialogContent>
              <DialogActions>
                <PrimaryButton onClick={() => handleCancel()}>Cancelar</PrimaryButton>
                <PrimaryButton
                  disabled={
                    sale.values.payment === ''
                  }
                  type="submit"
                >
                  Confirmar
                </PrimaryButton>
              </DialogActions>
            </form>
          </DialogBox>
          {/* DIALOG BOX: CONFIRMAR RESERVA: FIM */}

          {/* DIALOG BOX: CANCELAR RESERVA: INICIO */}
          <DialogBox
            open={openModalC}
            onClose={() => setOpenModalC(false)}
            title={`Você deseja cancelar a reserva de ${reservationInfo.customerName}?`}
          >
            <div className={styles.cancelText}>
              <p>Após o cancelamento da reserva o produto será devolvido ao estoque.</p>
            </div>

            <DialogActions>
              <PrimaryButton onClick={() => setOpenModalC(false)}>Cancelar</PrimaryButton>
              <PrimaryButton onClick={handleDelete}>Confirmar</PrimaryButton>
            </DialogActions>
          </DialogBox>
          {/* DIALOG BOX: CANCELAR RESERVA: FIM */}

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
                  setOpenModalR(true)
                }}>
                  Fechar
              </PrimaryButton>
                <PrimaryButton type="submit">Confirmar</PrimaryButton>
              </DialogActions>
            </form>
          </DialogBox>
          {/* DIALOG BOX: CRIAR DEVEDOR: FIM */}
        </div>
      </Container>
    </NavBar>
  );
}