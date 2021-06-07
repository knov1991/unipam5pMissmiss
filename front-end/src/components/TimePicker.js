import React from "react";
import { TimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import ptBR from 'date-fns/locale/pt-BR';
import DateFnsUtils from '@date-io/date-fns';

export default function TimePickerComponent({...props }) {

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptBR}>
      <TimePicker
        {...props}
        ampm={false}
        cancelLabel="Cancelar"
        inputVariant="outlined"
        autoOk
      />
    </MuiPickersUtilsProvider>
  );
}