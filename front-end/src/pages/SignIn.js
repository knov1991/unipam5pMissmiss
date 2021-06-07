import { useContext, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import { AuthContext } from '../contexts/AuthContext';

import { useFormik } from 'formik';
import * as yup from 'yup';

import styles from '../styles/pages/SignIn.module.css';
import logoImg from '../assets/images/logo.png';

export default function SignIn() {
  const { handleLogin, error, entering } = useContext(AuthContext);

  useEffect(() => {
    document.title = "Login / Salon Manager"
  }, []);


  const validationSchema = yup.object({
    username: yup.string()
      .required(true),
    password: yup.string()
      .required(true),
  });

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: (values) => {
      handleSignIn(values);
    },
  });

  async function handleSignIn(values) {
    handleLogin(values);
  }

  return (
    <div className={styles.container}>
      <div className={styles.signInBox}>
        <img src={logoImg} alt="Salon Manager" />
        <form className={styles.signInForm} onSubmit={formik.handleSubmit}>
          <div className={styles.inputBlock}>
            <TextField
              name="username"
              label="Usuário"
              variant="outlined"
              autoComplete="username"
              type="text"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username) && error === 'user'}
              helperText={formik.touched.username && formik.errors.username}
            />
          </div>
          <div className={styles.inputBlock}>
            <TextField
              name="password"
              label="Senha"
              variant="outlined"
              autoComplete="current-password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password) && error === 'password'}
              helperText={formik.touched.password && formik.errors.password}
            />
          </div>

          <button
            className={entering ? styles.buttonSubmitEnterning : styles.buttonSubmit}
            type="submit"
          >
            {entering ? 'Entrando...' : 'Entrar' }
            </button>
        </form>
      </div>
    </div>
  );
}