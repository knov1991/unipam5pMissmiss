import React from 'react';
import ptBR from 'date-fns/locale/pt-BR';
import DateFnsUtils from '@date-io/date-fns'; 
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

export default function Calendar({...props}) {
  
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptBR}>
      <DatePicker 
        {...props}
        variant="inline"
        inputVariant="outlined"
        color="primary"
        disableToolbar={true}
        format="dd/MM/yyyy"
        autoOk
      />
    </MuiPickersUtilsProvider>
  )
}