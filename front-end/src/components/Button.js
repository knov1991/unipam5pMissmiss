import { Button } from '@material-ui/core';

import styles from '../styles/components/Button.module.css';

export default function PrimaryButton({...props}) {
  return (
    <Button 
      color="primary"
      className={styles.button}
      disableRipple
      disableElevation
      {...props}
    >
      {props.children}
    </Button>
  )
}