import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';

import styles from '../styles/components/CashFlowCards.module.css';

export default function CashFlowCards({...props}) {
  return (
    <Card className={styles.card} variant="outlined">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {props.title}
        </Typography>
        <Typography className={styles.cardText} variant="h4" component="h2">
          {props.value}
        </Typography>
      </CardContent>
    </Card>
  )
}