import React, { useContext, useEffect, useState } from "react";
import { Container, DialogActions, DialogContent, TextField } from "@material-ui/core";
import { Skeleton } from '@material-ui/lab';
import { useFormik } from 'formik';
import * as yup from 'yup';

import PrimaryButton from "../components/Button";
import NavBar from "../components/Navbar";
import DialogBox from '../components/DialogBox';
import SearchBar from '../components/SearchBar';
import PageHeader from "../components/PageHeader";
import { TelephoneMask } from '../components/inputMasks';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import styles from '../styles/pages/Products.module.css';
import api from '../services/api';

export default function ProductsReservation() {
  const { user, enterprise } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalR, setOpenModalR] = useState(false);
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState('');

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = "Reserva de Produtos/ Salon Manager"
    setLoading(true)
    setTimeout(async () => {
      const response = await api.get(`/product/${enterprise._id}/all`);

      setProducts(response.data.products);
      setLoading(false)
    }, 500)

  }, [status, enterprise._id]);

  const validationSchema = yup.object({
    customerName: yup.string()
      .required(true),
    quantity: yup.string()
      .required(true),
    phoneNumber: yup.string()
      .required(true)
  });


  const reservation = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      custumerName: '',
      quantity: '',
      phoneNumber: '',
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      values.phoneNumber = phoneNumber;

      handleReservation(values);
    },
  });

  async function handleReservation(values) {
    try {
      await api.post(`/reservation/${enterprise._id}/${productData._id}`, { ...values });
      setSnack({ message: 'Reserva realizada com sucesso!', type: 'success', open: true });
      reservation.resetForm();
      setStatus(status + 1);
      handleCancel();

    } catch (res) {
      setSnack({ message: 'Encontramos um erro ao realizar sua solicitação. Entre em contato com o estabelecimento!', type: 'error', open: true });
    }
  }

  function handleCancel() {
    setOpenModalR(false);
    reservation.resetForm();
  }

  // FORMATAÇÃO PARA REAL
  function formatMoney(money) {
    return money.toLocaleString('pt-br',
      {
        style: 'currency', currency: 'BRL'
      }
    )
  }

  function defineInitalValues(values) {
    reservation.values.customerName = user.name;
    reservation.values.phoneNumber = user.phoneNumber;
  }

  return (
    <NavBar>
      <Container>
        <div>
          <PageHeader
            title="Reserva de Produtos"
            subtitle={`${user.name}, aqui você pode escolher um produto e reservá-lo.`}
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
                            <PrimaryButton
                              onClick={() => {
                                defineInitalValues();
                                setProductData(items);
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
              title={`Reservando ${productData.name}`}
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
                        InputProps={{
                          readOnly: true
                        }}
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
                    <p>
                      {
                        (reservation.values.quantity > productData.quantity)
                          ? `Limite ultrapassado (Max. ${productData.quantity})` :
                          `Restam ${productData.quantity - reservation.values.quantity} und.`
                      }
                    </p>
                  </div>
                </DialogContent>
                <DialogActions>
                  <PrimaryButton onClick={handleCancel}>Cancelar</PrimaryButton>
                  <PrimaryButton
                    disabled={
                      productData.quantity - reservation.values.quantity < 0 ||
                      reservation.values.quantity === '' ||
                      reservation.values.quantity < 1
                    }
                    type="submit"
                  >
                    Confirmar
                  </PrimaryButton>
                </DialogActions>
              </form>
            </DialogBox>
            {/* DIALOG BOX: RESERVA: FIM */}

          </div>
        </div>
      </Container>
    </NavBar >
  );
}