import { useState, useEffect, useContext } from 'react';

import jwtDecode from "jwt-decode";
import { SnackContext } from '../SnackContext';

import api from '../../services/api';

export default function useAuth() {
  const { setSnack } = useContext(SnackContext)

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [enterprise, setEnterprise] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    async function loadData() {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (user && token) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (jwtDecode(token).exp < Date.now() / 1000) {
          handleLogout();
        }

        else {
          setUser(JSON.parse(user));
          setRole(JSON.parse(user).type);
          setEnterprise(JSON.parse(user).enterprise);
          api.defaults.headers['Authorization'] = `Bearer ${token}`;
          setLoading(false);
        }
      }
      setLoading(false);
    }

    loadData();
  }, []);

  async function handleLogin(values) {
    setError(null);
    setEntering(true);

    try {
      const response = await api.post('/user/login', { ...values });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      api.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      setRole(response.data.user.type);
      setEnterprise(response.data.user.enterprise);
    } catch (res) {

      if (!res.response) {
        setSnack({ message: 'Encontramos um erro ao efetuar o login. Entre em contato com o suporte! ', type: 'error', open: true })
      }
      else {
        let err = res.response.data.error;

        if (err === "Invalid 'username'") {
          setSnack({ message: 'Usuário não encontrado!', type: 'error', open: true });
          setError('user');
        } else if (err === "Invalid 'password'") {
          setSnack({ message: 'Senha incorreta!', type: 'error', open: true });
          setError('password');
        } else {
          setSnack({ message: 'Não foi possível realizar sua solicitação, tente novamente mais tarde.', type: 'error', open: true });
        }
      }
    }

    setEntering(false);
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
    setRole(null);
    setEnterprise(null);
    api.defaults.headers.Authorization = undefined;
  }

  return { user, loading, role, enterprise, error, entering, handleLogin, handleLogout };
}