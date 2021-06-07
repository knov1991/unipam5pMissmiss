import React from 'react';
import { Dialog, Grow } from '@material-ui/core';
import styles from '../styles/components/DialogBox.module.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow 
            ref={ref} {...props} 
          />;
});

export default function DialogBox({title, children, footer, ...props}) {
  return (
      <Dialog
        {...props}
        disableBackdropClick
        fullWidth
        TransitionComponent={Transition}
        maxWidth="sm"
      >
      <div className={styles.modal}>
        <div className={styles.modalTitle}>
          <h4>{title}</h4>
        </div>
        <div className={styles.modalBody}>
            {children}
        </div>
        <div className={styles.modalFooter}>
          {footer}
        </div>
      </div>
      
    </Dialog>
  );
}