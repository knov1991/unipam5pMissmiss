
import { Link } from 'react-router-dom';
import styles from '../styles/components/PageHeader.module.css';
import PrimaryButton from './Button';

export default function PageHeader({...props}){
  return (
    <div className={styles.header}>
      {props.button !== undefined && 
       <Link to={props.backLink}>
        <PrimaryButton 
          color="primary" 
          startIcon={props.button} 
          variant="contained"
        >
          Voltar a página anterior
        </PrimaryButton>
       </Link>
      }
      <h2>{props.title}</h2>
      <p>{props.subtitle}</p>
    </div>
  );
}