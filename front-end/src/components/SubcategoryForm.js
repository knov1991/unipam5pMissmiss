import { Divider } from '@material-ui/core';

import styles from '../styles/components/SubcategoryForm.module.css';

export default function SubcategoryForm({title}) {
  return (
    <div className={styles.headerSubtitle}>
      <h3>{title}</h3>
      <Divider />
    </div>
  )
}