import styles from '../styles/components/FormContainer.module.css';

export default function FormContainer({children}) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}