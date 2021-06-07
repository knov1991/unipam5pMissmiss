import { Link } from 'react-router-dom';

import PrimaryButton from '../components/Button';
import error404 from '../assets/images/page_not_found.svg';
import styles from '../styles/pages/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.error}>
          <img src={error404} alt="Erro 404" />
        </div>
        <div className={styles.message}>
          <h2>Vish! Não encotramos o que você procura.</h2>
          <p>O link que você digitou pode estar incorreto, verifique e tente novamente.</p>
        </div>
        <div className={styles.btn}>
          <Link to="/home"><PrimaryButton variant="contained">Voltar pro início</PrimaryButton></Link>
        </div>
      </div>
    </div>
  )
}