import React, { useContext, useEffect, useState } from 'react';
import {
  Container, InputAdornment, MenuItem, TextField, DialogActions,
  DialogContent, InputLabel, Select, FormControl, IconButton
} from '@material-ui/core';

import { Autocomplete, Skeleton } from '@material-ui/lab';
import { useFormik } from 'formik';
import * as yup from 'yup';

import FaceIcon from '@material-ui/icons/Face';
import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import PaymentIcon from '@material-ui/icons/Payment';
import DateRangeIcon from '@material-ui/icons/DateRange';
import BuildIcon from '@material-ui/icons/Build';
import AddIcon from '@material-ui/icons/Add';
import CircularProgress from '@material-ui/core/CircularProgress';

import TimePickerComponent from '../components/TimePicker';
import Navbar from '../components/Navbar';
import PrimaryButton from '../components/Button';
import Calendar from '../components/Calendar';
import DialogBox from '../components/DialogBox';
import ActionButton from '../components/ActionButton';
import SubcategoryForm from '../components/SubcategoryForm';
import { NumberFormats, TelephoneMask } from '../components/inputMasks';

import { AuthContext } from '../contexts/AuthContext';
import { SnackContext } from '../contexts/SnackContext';

import api from '../services/api';

import styles from '../styles/pages/Schedule.module.css';

export default function Schedule() {
  const { user, enterprise, role } = useContext(AuthContext);
  const { setSnack } = useContext(SnackContext);

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalPayment, setOpenModalPayment] = useState(false);
  const [openModalDebtor, setOpenModalDebtor] = useState(false);
  const [openModalWarning, setOpenModalWarning] = useState(false);
  const [schedule, setSchedule] = useState(user._id);

  const [employeeSchedule, setEmployeeSchedule] = React.useState({ _id: schedule, name: user.name });
  const [inputEmployeeSchedule, setInputEmployeeSchedule] = useState('');
  const [inputDebtors, setInputDebtors] = useState('');

  const [selectedInitialDate, setSelectedInitialDate] = useState(new Date());
  const [selectedLastDate, setSelectedLastDate] = useState(selectedInitialDate);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState(selectedInitialDate);
  const [selectedDeadLine, setSelectedDeadLine] = useState(new Date().setDate(new Date().getDate() + 30));
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(startTime);

  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verify, setVerify] = useState(false);

  const [appointmentInfo, setAppointmentInfo] = useState('');
  const [appointmentWarning, setAppointmentWarning] = useState([]);
  const [appointmentsPayed, setAppointmentsPayed] = useState([]);
  const [appointmentsNotPayed, setAppointmentsNotPayed] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [services, setServices] = useState([]);
  const [debtors, setDebtors] = useState([]);

  useEffect(() => {
    document.title = "Agenda / Salon Manager"
    setLoading(true)
    async function loadData() {
      setTimeout(async () => {

        // CARREGA TODOS OS USUÁRIOS PARA SELEÇÃO DE AGENDA
        const responseSchedule = await api.get(`/user/${enterprise._id}/schedule`);
        setScheduleList(responseSchedule.data.schedules);

        // CARREGA HORÁRIOS NÃO PAGOS
        let initial = formatDate(selectedInitialDate);
        let last = formatDate(selectedLastDate);

        const responseAppointmentsNotPayed = await api.get(`/schedule/${enterprise._id}/appointments/${schedule}/notPayed?initial=${initial}&last=${last}`);
        setAppointmentsNotPayed(responseAppointmentsNotPayed.data.appointments);

        // CARREGA HORÁRIOS PAGOS
        const responseAppointmentsPayed = await api.get(`/schedule/${enterprise._id}/appointments/${schedule}/payed?initial=${initial}&last=${last}`);
        setAppointmentsPayed(responseAppointmentsPayed.data.appointments);

        // CARREGA TODOS OS SERVIÇOS
        const responseUser = await api.get(`/user/${enterprise._id}/${schedule}`)

        let user_occupation = responseUser.data.user.occupation;
        var services = [];

        for (var i = 0; i < user_occupation.length; i++) {
          const responseService = await api.get(`/service/${user_occupation[i]}/all`);

          for (var j = 0; j < responseService.data.services.length; j++) {
            services.push({ _id: responseService.data.services[j]._id, description: responseService.data.services[j].description })
          }
        }

        setSelectedAppointmentDate(selectedInitialDate)
        setServices(services);

        setLoading(false)
      }, 500)
    };

    loadData();
  }, [status, schedule, selectedInitialDate, selectedLastDate, enterprise._id]);

  const createValidation = yup.object({
    customer: yup.string()
      .required(true),
    services: yup.array()
      .required(true)
  });

  const paymentValidation = yup.object({
    payment: yup.string()
      .required(true),
    value: yup.string()
      .required(true)
  });

  const debtorValidation = yup.object({
    customerName: yup.string()
      .required(true),
    phoneNumber: yup.string()
      .required(true)
  });

  const create = useFormik({
    validationSchema: createValidation,
    initialValues: {
      customer: '',
      services: [],
    },
    onSubmit: (values) => {
      verifiyAppoitment(values.customer, startTime, endTime, values.services);
    },
  });

  const edit = useFormik({
    validationSchema: createValidation,
    initialValues: {
      customer: '',
      services: [],
    },
    onSubmit: (values) => {
      handleEditConfirm(values.customer, startTime, endTime, values.services)
    },
  });

  const payment = useFormik({
    validationSchema: paymentValidation,
    initialValues: {
      payment: '',
      value: '',
      valuePayed: '',
      amountPaid: '',
      change: '',
      debtor: '',
    },
    onSubmit: (values) => {
      handlePayment(values.debtor._id, values.value, values.valuePayed, values.payment, formatDate(selectedDeadLine))
    },
  });

  const debtor = useFormik({
    validationSchema: debtorValidation,
    initialValues: {
      customerName: '',
      phoneNumber: ''
    },
    onSubmit: (values) => {
      var phoneNumber = values.phoneNumber.replace(/[^0-9]/g, '');

      handleCreateDebtor(values.customerName, phoneNumber)
    },
  });


  async function verifiyAppoitment(customer, startTime, endTime, services) {
    setVerify(true);

    let date = formatDate(selectedAppointmentDate);
    let start = formatDateTime(startTime);
    let end = formatDateTime(endTime);

    const response = await api.get(`/schedule/${enterprise._id}/${schedule}/verify?date=${date}&start=${start}&end=${end}`);

    if (response.data.appointments.length < 1) {
      handleCreate(customer, startTime, endTime, services);
    }
    else {
      setOpenModalCreate(false);
      setOpenModalWarning(true);
      setAppointmentInfo({ customer: customer, startTime: startTime, endTime: endTime, services: services })
      setAppointmentWarning(response.data.appointments);
    }

    setVerify(false);
  }

  // Cadastrar horário
  async function handleCreate(customer, start, end, services) {
    try {
      let date = formatDate(selectedAppointmentDate);
      let startTime = formatDateTime(start);
      let endTime = formatDateTime(end);

      await api.post(`/schedule/${enterprise._id}/${schedule}`, { customer, date, startTime, endTime, services });
      handleCancel();
      setSnack({ message: 'Horário marcado com sucesso!', type: 'success', open: true })
      setStatus(status + 1);
      create.resetForm();
    } catch (res) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true })
    }
  }

  // Salva os dados do horário
  function saveAppointmentData(id, customer, services) {
    setAppointmentInfo({ id: id, customer: customer, services: services })
  }

  // Edita horário
  function handleEdit(id, customer, date, services, startTime, endTime) {
    setAppointmentInfo({ id: id, customer: customer, date: date });

    edit.values.customer = customer;
    edit.values.services = services;

    let start = new Date()
    start.setHours(startTime[0] + startTime[1])
    start.setMinutes(startTime[2] + startTime[3])

    let appointmentDate = new Date()
    appointmentDate.setFullYear(date[0] + date[1] + date[2] + date[3])
    appointmentDate.setMonth(date[5] + date[6] - 1)
    appointmentDate.setDate(date[8] + date[9])

    setSelectedAppointmentDate(appointmentDate)
    setStartTime(start)
    setEndTime(date + 'T' + formatTime(endTime))
  }

  async function handleEditConfirm(customer, start, end, services) {
    let date = formatDate(selectedAppointmentDate);
    let startTime = formatDateTime(start);
    let endTime = formatDateTime(end);

    try {
      await api.put(`/schedule/${enterprise._id}/${appointmentInfo.id}`, { customer, date, startTime, endTime, services });
      handleCancel();
      setSnack({ message: 'Horário editado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      edit.resetForm();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true })
    }
  }

  // Exclui horário
  async function handleDelete() {
    try {
      await api.delete(`/schedule/${enterprise._id}/${appointmentInfo.id}`);
      handleCancel();
      setSnack({ message: 'Horário desmarcado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Cria Devedor
  async function handleCreateDebtor(customerName, phoneNumber) {
    try {
      await api.post(`/debtor/${enterprise._id}`, { customerName, phoneNumber });
      setOpenModalDebtor(false);
      setOpenModalPayment(true);
      setSnack({ message: 'Devedor criado com sucesso!', type: 'success', open: true });
      loadDebtors();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Pagamento de horário
  async function handlePayment(debtor, value, valuePayed, paymentMethod, deadline) {
    try {
      var wasPaid;
      if (paymentMethod !== 'Prazo') {
        valuePayed = value;
        wasPaid = true
      } else {
        wasPaid = false
      }

      let services = appointmentInfo.services;

      let description = services.join(', ');

      await api.put(`/schedule/${enterprise._id}/${appointmentInfo.id}/payment`, { description, debtor, value, valuePayed, paymentMethod, deadline, wasPaid });
      handleCancel();
      setSnack({ message: 'Pagamento realizado com sucesso!', type: 'success', open: true });
      setStatus(status + 1);
      payment.resetForm();
    } catch (err) {
      setSnack({ message: 'Encontramos um erro. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Inicia os valores da data inicio e data fim
  function initialValues(value) {
    let initial = new Date(value);
    let last = new Date(value);

    initial.setHours(initial.getHours());
    initial.setMinutes('00');

    last.setHours(last.getHours() + 1);
    last.setMinutes('00');

    return (
      setStartTime(initial),
      setEndTime(last)
    );
  }

  // Monitora o horário de inicio para parear com o horário fim 
  function dateValues(value) {
    let initial = new Date(value);
    let last = new Date(value);

    initial.setHours(initial.getHours());
    last.setHours(last.getHours() + 1);

    return (
      setStartTime(initial),
      setEndTime(last)
    );
  }

  // Adiciona 1 hora por serviço
  function addHours(value) {
    let initial = new Date(startTime);

    initial.setHours(initial.getHours() + 1);

    let last = new Date(initial);
    var hours = 0;

    if (value.target.value.length > 1) {
      hours = value.target.value.length - 1;
    }

    last.setDate(initial.getDate());
    last.setHours(last.getHours() + hours);

    return setEndTime(last);
  }

  // Carrega os clientes devedores
  async function loadDebtors() {
    try {
      setTimeout(async () => {
        const response = await api.get(`/debtor/${enterprise._id}/all`)
        setDebtors(response.data.debtor);
      }, 1000)

    } catch (err) {
      setSnack({ message: 'Encontramos um erro ao carregar os devedores. Entre em contato com o suporte!', type: 'error', open: true });
    }
  }

  // Fecha e reseta dos fechar um modal
  function handleCancel() {
    setOpenModalCreate(false);
    setOpenModalEdit(false);
    setOpenModalDelete(false);
    setOpenModalPayment(false);
    setOpenModalWarning(false);
    setAppointmentInfo({ customer: '' });
    setAppointmentWarning([]);
    setStartTime(new Date());
    setEndTime(new Date());

    create.resetForm();
    edit.resetForm();
    payment.resetForm();
  }

  // FORMATA DATA DO CALENDÁRIO (2021-01-01)
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  // FORMATA DATA DO CALENDÁRIO EM FORMA DE DIA, MêS E ANO (01/01/2021)
  function formatDateDayFrist(date) {
    var d = new Date(date);
    d = new Date(d.getTime() + d.getTimezoneOffset() * 60000)

    var month = '' + (d.getMonth() + 1);
    var day = '' + (d.getDate());
    var year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join('/');
  }

  // FORMATA DATA EM FORMA LONGA (SEGUNDA-FEIRA, 01 DE MAIO DE 2021)
  function fullDate(date) {
    var d = new Date(date);

    var weekDay = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][d.getDay()];
    var day = d.getDate();
    var month = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][d.getMonth()];
    var year = d.getFullYear();
    return weekDay + ', ' + day + ' de ' + month;
  }

  // REMOVE DATA E RETORNA HORÁRIO DO TIMERPICKER SEM :
  function formatDateTime(date) {
    var d = new Date(date),
      hours = (d.getHours() < 10 ? '0' : '') + d.getHours(),
      minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()

    return hours + minutes;
  }

  // REMOVE DATA E RETORNA TRATATO DA API
  function formatTime(values) {
    let time = values.replace(/[^0-9]/g, '');

    let hours = time[0] + time[1];
    let minutes = time[2] + time[3]

    let newTime = [hours, minutes].join(':');

    return newTime;

  }

  // VERIFICA QUE DIA É HOJE E SE SIM, RETORNA HOJE
  function whatsDay() {
    let dateNotFormated = new Date();

    let tomorrowNotFormated = new Date()
        tomorrowNotFormated.setDate(dateNotFormated.getDate() + 1);

    let selectedDate = formatDate(selectedInitialDate);
    
    let day = formatDate(dateNotFormated);
    let tomorrow = formatDate(tomorrowNotFormated);

    if (day === selectedDate) {
      return 'Hoje, ';
    }

    if(tomorrow === selectedDate){
      return 'Amanhã, ';
    }

    return '';
  }

  return (
    <Navbar>
      <Container>
        <div className={styles.scheduleContainer}>
          <div className={styles.scheduleHeader}>
            <div className={styles.newScheduleBtn}>
              {(user._id === schedule || role === 'manager')
                ?
                <PrimaryButton
                  onClick={() => {
                    initialValues(startTime);
                    setOpenModalCreate(true)
                  }}
                  variant="contained"
                >
                  Novo Horário
                </PrimaryButton>
                :
                null
              }
            </div>

            <div className={styles.scheduleOptions}>
              <div className={styles.scheduleOptionsForm}>
                <div className={styles.inputBlock}>
                  <Autocomplete
                    options={scheduleList}
                    value={employeeSchedule}
                    onChange={(val, newValue) => {
                      setSchedule(newValue._id);
                      setEmployeeSchedule(newValue);
                      setStatus(status + 1);
                    }}
                    inputValue={inputEmployeeSchedule}
                    onInputChange={(event, newInputValue) => {
                      setInputEmployeeSchedule(newInputValue);
                    }}
                    getOptionSelected={(option) => option._id}
                    getOptionLabel={(option) => option.name}
                    loading={loading}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="Agenda"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRangeIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    }
                    size="small"
                    disableClearable
                  >
                    <DateRangeIcon />
                  </Autocomplete>
                </div>
              </div>
              <Calendar
                label="Data início"
                value={selectedInitialDate}
                size="small"
                onChange={val => {
                  setSelectedInitialDate(val);
                  setStatus(status + 1);
                }}
              />
              <Calendar
                label="Data fim"
                value={selectedLastDate}
                size="small"
                onChange={val => {
                  setSelectedLastDate(val);
                  setStatus(status + 1);
                }}
              />
            </div>
          </div>

          {(loading)
            ?
            <>
              <div className={styles.scheduleDate}>
                <Skeleton animation="wave" width="30%" height={55}></Skeleton>
              </div>
              <div>
                {[1, 2, 3].map((n) =>
                  <Skeleton animation="wave" width="auto" height={150} style={{ marginTop: -30, marginBottom: -40 }}></Skeleton>
                )}
              </div>
            </>
            :
            <>
              <div className={styles.scheduleDate}>
                {(formatDate(selectedInitialDate) === formatDate(selectedLastDate))
                  ?
                  <h3>{whatsDay() + fullDate(selectedInitialDate)}</h3>
                  :
                  <h3>{fullDate(selectedInitialDate)} - {fullDate(selectedLastDate)}</h3>
                }
                {(user._id !== schedule && role !== 'manager')
                  ?
                  <p className={styles.scheduleWarning}>Aviso: você está visualizando a agenda de outro funcionário, os recursos foram desabilitados por segurança.</p>
                  :
                  null
                }
                {(user._id !== schedule && role === 'manager')
                  ?
                  <p className={styles.scheduleWarning}>Aviso: você está visualizando a agenda de outro funcionário.</p>
                  :
                  null
                }
              </div>

              {appointmentsPayed.length > 0 &&
                <div className={styles.payedAppointment}>
                  <h2>Horários Marcados</h2>
                </div>
              }

              {appointmentsNotPayed.map(items => (
                <div key={items._id} className={styles.scheduleCard}>
                  <div className={styles.cardTime}>
                    <strong>{formatTime(items.startTime)} - {formatTime(items.endTime)}</strong>
                    {(formatDate(selectedInitialDate) === formatDate(selectedLastDate))
                      ?
                      null
                      :
                      <strong>{formatDateDayFrist(items.date)}</strong>
                    }
                  </div>

                  <div className={styles.cardInfo}>
                    <div className={styles.customer}>
                      <strong><FaceIcon /> {items.customer}</strong>
                    </div>
                  </div>

                  <div className={styles.cardInfo}>
                    <div className={styles.services}>
                      <strong>
                        <ScatterPlotIcon />
                        {
                          (items.services.length > 2)
                            ?
                            `${items.services[0]}, ${items.services[1]}` + ` e outros ${items.services.length - 1}`
                            :
                            (items.services.length > 1)
                              ?
                              items.services[0] + ' e ' + items.services[1]
                              :
                              items.services
                        }
                      </strong>
                    </div>
                  </div>

                  {(user._id === schedule || role === 'manager') ?
                    <div className={styles.cardButtons}>
                      <PrimaryButton startIcon={<PaymentIcon />}
                        onClick={() => {
                          setOpenModalPayment(true);
                          saveAppointmentData(items._id, items.customer, items.services);
                          loadDebtors();
                        }}
                      >
                        Pagamento
                      </PrimaryButton>
                      <ActionButton
                        text="Gerenciar"
                        icon={<BuildIcon />}
                        actions={[
                          {
                            text: 'Editar', onClick: () => {
                              setOpenModalEdit(true);
                              handleEdit(items._id, items.customer, items.date, items.services, items.startTime, items.endTime);
                            }
                          },
                          {
                            text: 'Desmarcar', onClick: () => {
                              setOpenModalDelete(true);
                              saveAppointmentData(items._id, items.customer);
                            }
                          }
                        ]}
                      />
                    </div>
                    :
                    null
                  }
                </div>
              ))}

              {appointmentsNotPayed.length === 0 && appointmentsPayed.length > 0
                ?
                <p>Não encontramos horários agendados para a data selecionada.</p>
                :
                null
              }

              {appointmentsNotPayed.length === 0 && appointmentsPayed.length === 0
                ?
                <div className={styles.notFoundAppointments}>
                  <p>Não encontramos horários agendados para a data selecionada.</p>
                </div>
                :
                null
              }
            </>
          }
        </div>

        {(loading)
          ?
          <>
            <div>
              {[1].map((n) =>
                <Skeleton animation="wave" width="auto" height={150} style={{ marginTop: -30, marginBottom: -40 }}></Skeleton>
              )}
            </div>
          </>
          :
          <>
            {appointmentsPayed.length > 0 &&
              <div className={styles.payedAppointment}>
                <h2>Horários Finalizados</h2>
              </div>
            }

            {appointmentsPayed.map(items => (
              <div key={items._id} className={styles.scheduleCardPayed}>
                <div className={styles.cardTime}>
                  <strong>{formatTime(items.startTime)} - {formatTime(items.endTime)}</strong>
                  {(formatDate(selectedInitialDate) === formatDate(selectedLastDate))
                    ?
                    null
                    :
                    <strong>{formatDateDayFrist(items.date)}</strong>
                  }
                </div>

                <div className={styles.cardInfo}>
                  <div className={styles.customer}>
                    <strong><FaceIcon /> {items.customer}</strong>
                  </div>
                </div>

                <div className={styles.cardInfo}>
                  <div className={styles.services}>
                    <strong>
                      <ScatterPlotIcon />
                      {
                        (items.services.length > 2)
                          ?
                          items.services[0] + items.services[1] + ` e outros ${items.services.length - 1}`
                          :
                          (items.services.length > 1)
                            ?
                            items.services[0] + ' e ' + items.services[1]
                            :
                            items.services
                      }
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </>
        }


        {/* DIALOG BOX: CRIAR HORÁRIO: INÍCIO */}
        <DialogBox
          open={openModalCreate}
          onClose={() => handleCancel()}
          title="Novo Horário"
        >
          <form onSubmit={create.handleSubmit}>
            <DialogContent>
              <div className={styles.warning}>
                {(user._id !== schedule && role === 'manager')
                  ?
                  <p>Aviso: você está marcando um horário na agenda de outro funcionário.</p>
                  :
                  null
                }
              </div>
              <div className={styles.newSheduleForm} noValidate autoComplete="off">
                <SubcategoryForm
                  title="Dados do Cliente"
                />
                <div className={styles.inputBlock}>
                  <TextField
                    name="customer"
                    label="Nome do Cliente"
                    variant="outlined"
                    value={create.values.customer}
                    onChange={create.handleChange}
                    error={create.touched.customer && Boolean(create.errors.customer)}
                    fullWidth
                  />
                </div>
                <SubcategoryForm
                  title="Dados do horário"
                />
                <div className={styles.inputBlock}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="demo-mutiple-chip-label">Serviços</InputLabel>
                    <Select
                      multiple
                      labelId="demo-mutiple-chip-label"
                      id="demo-mutiple-chip"
                      label="Serviços"
                      name="services"
                      value={create.values.services}
                      onChange={val => {
                        create.handleChange(val);
                        addHours(val)
                      }}
                    >
                      {services.map((items) => (
                        <MenuItem key={items._id} value={items.description}>
                          {items.description}
                        </MenuItem>
                      ))}
                      {loading === true &&
                        <MenuItem disabled value="">
                          <em>Carregando...</em>
                        </MenuItem>
                      }
                      {services.length === 0 && loading === false &&
                        <MenuItem disabled value="">
                          <em>Não há nenhuma função atribuída a esse funcionário, adicione para marcar.</em>
                        </MenuItem>
                      }
                    </Select>
                  </FormControl>
                </div>
                <div className={styles.scheduleTimers}>
                  <div className={styles.inputBlock}>
                    <TimePickerComponent
                      name="startTime"
                      label="Hora de ínicio"
                      value={startTime}
                      onChange={(value) => {
                        setStartTime(value);
                        dateValues(value);
                      }}
                      fullWidth
                    />

                  </div>
                  <div className={styles.inputBlock}>
                    <TimePickerComponent
                      name="endTime"
                      label="Hora de término"
                      value={endTime}
                      onChange={setEndTime}
                      fullWidth
                    />
                  </div>
                </div>
                <div className={styles.inputBlock}>
                  <Calendar
                    label="Data"
                    value={selectedAppointmentDate}
                    size="medium"
                    onChange={val => {
                      setSelectedAppointmentDate(val);
                    }}
                  />
                </div>
              </div>
              {(endTime < startTime) ?
                <div className={styles.warning}>
                  <p>Aviso: a hora de término não pode ser menor que hora de inicio.</p>
                </div>
                : null
              }
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
              <PrimaryButton
                disabled={
                  endTime < startTime ||
                  create.values.customer.length === 0 ||
                  create.values.services.length === 0 ||
                  verify === true
                }
                type="submit"
              >
                {verify === false ? 'Confirmar' : 'Verificando...'}
              </PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: CRIAR HORÁRIO: FIM */}

        {/* DIALOG BOX: EDITAR HORÁRIO: INÍCIO */}
        <DialogBox
          open={openModalEdit}
          onClose={() => handleCancel()}
          title={`Editando Horário de ${appointmentInfo.customer}`}
        >
          <form onSubmit={edit.handleSubmit}>
            <DialogContent>
              <div className={styles.warning}>
                {(user._id !== schedule && role === 'manager')
                  ?
                  <p>Aviso: você está editando um horário na agenda de outro funcionário.</p>
                  :
                  null
                }
              </div>
              <div className={styles.editSheduleForm} noValidate autoComplete="off">
                <SubcategoryForm
                  title="Dados do cliente"
                />
                <div className={styles.inputBlock}>
                  <TextField
                    name="customer"
                    label="Nome do Cliente"
                    variant="outlined"
                    value={edit.values.customer}
                    onChange={edit.handleChange}
                    error={edit.touched.customer && Boolean(edit.errors.customer)}
                    helperText={edit.touched.customer && edit.errors.customer}
                    fullWidth
                  />
                </div>
                <SubcategoryForm
                  title="Dados do horário"
                />
                <div className={styles.inputBlock}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="demo-mutiple-chip-label">Serviços</InputLabel>
                    <Select
                      multiple
                      labelId="demo-mutiple-chip-label"
                      id="demo-mutiple-chip"
                      label="Serviços"
                      name="services"
                      value={edit.values.services}
                      onChange={val => {
                        edit.handleChange(val);
                        addHours(val)
                      }}
                    >
                      {services.map((items) => (
                        <MenuItem key={items._id} value={items.description}>
                          {items.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className={styles.scheduleTimers}>
                  <div className={styles.inputBlock}>
                    <TimePickerComponent
                      name="startTime"
                      label="Hora de ínicio"
                      value={startTime}
                      onChange={(value) => {
                        setStartTime(value);
                      }}
                      fullWidth
                    />

                  </div>
                  <div className={styles.inputBlock}>
                    <TimePickerComponent
                      name="endTime"
                      label="Hora de término"
                      value={endTime}
                      onChange={(value) => {
                        setEndTime(value);
                      }}
                      fullWidth
                    />
                  </div>
                </div>
                <div className={styles.inputBlock}>
                  <Calendar
                    label="Data"
                    value={selectedAppointmentDate}
                    size="medium"
                    onChange={val => {
                      setSelectedAppointmentDate(val);
                    }}
                  />
                </div>
              </div>
              {(endTime < startTime) ?
                <div className={styles.warning}>
                  <p>Aviso: a hora de término não pode ser menor que hora de inicio.</p>
                </div>
                : null
              }
              {appointmentInfo.date !== formatDate(selectedAppointmentDate) &&
                <div className={styles.warning}>
                  <p>Aviso: o horário será transferido para {fullDate(selectedAppointmentDate)}</p>
                </div>
              }
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
              <PrimaryButton disabled={endTime < startTime} type="submit">Confirmar</PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: EDITAR HORÁRIO: FIM */}

        {/* DIALOG BOX: DESMARCAR HORÁRIO: INÍCIO */}
        <DialogBox
          open={openModalDelete}
          onClose={() => handleCancel()}
          title={`Você deseja desmarcar o horário de ${appointmentInfo.customer}?`}
        >
          <div className={styles.delete}>
            <p>Após a confirmação o horário será removido permanentemente.</p>
          </div>
          <DialogActions>
            <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
            <PrimaryButton onClick={() => handleDelete()}>Confirmar</PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: EXCLUIR HORÁRIO: FIM */}

        {/* DIALOG BOX: AVISO DE HORÁRIO MARCADO: INÍCIO */}
        <DialogBox
          open={openModalWarning}
          onClose={() => setOpenModalWarning(false)}
          title={`Aviso de conflito de horário`}
        >
          <div className={styles.appointmentAlert}>
            <p>Encontramos {appointmentWarning.length} horário(s) agendado(s) no mesmo período
               do que está sendo agendado. Você deseja realmente prosseguir?</p>
          </div>

          {appointmentWarning.map(items => (
            <div key={items._id} className={styles.scheduleCardModal}>
              <div className={styles.cardTime}>
                <strong>{formatTime(items.startTime)} - {formatTime(items.endTime)}</strong>
              </div>

              <div className={styles.cardInfo}>
                <div className={styles.customer}>
                  <strong><FaceIcon /> {items.customer}</strong>
                </div>
              </div>

              <div className={styles.cardInfo}>
                <div className={styles.services}>
                  <strong>
                    <ScatterPlotIcon />
                    {
                      (items.services.length > 2)
                        ?
                        items.services[0] + items.services[1] + ` e outros ${items.services.length - 1}`
                        :
                        (items.services.length > 1)
                          ?
                          items.services[0] + ' e ' + items.services[1]
                          :
                          items.services
                    }
                  </strong>
                </div>
              </div>
            </div>
          ))}

          <DialogActions>
            <PrimaryButton
              onClick={() => {
                setOpenModalWarning(false);
                setOpenModalCreate(true)
              }}
            >
              Não
              </PrimaryButton>
            <PrimaryButton onClick={() =>
              handleCreate(
                appointmentInfo.customer,
                appointmentInfo.startTime,
                appointmentInfo.endTime,
                appointmentInfo.services
              )
            }>
              Continuar
          </PrimaryButton>
          </DialogActions>
        </DialogBox>
        {/* DIALOG BOX: AVISO DE HORÁRIO MARCADO: FIM */}

        {/* DIALOG BOX: FINALIZAR HORÁRIO(PAGAMENTO): INICIO */}
        <DialogBox
          open={openModalPayment}
          onClose={() => handleCancel()}
          title={`Pagamento de horário de ${appointmentInfo.customer}`}
        >
          <form onSubmit={payment.handleSubmit}>
            <DialogContent>
              {(user._id !== schedule && role === 'manager')
                ?
                <div className={styles.warning}>
                  <p>Aviso: você está finalizando um horário na agenda de outro funcionário.</p>
                </div>
                :
                null
              }
              <SubcategoryForm
                title="Dados de pagamento"
              />
              <div className={styles.payment}>
                <div className={styles.inputBlock}>
                  <TextField
                    select
                    name="payment"
                    label="Método de Pagamento"
                    variant="outlined"
                    value={payment.values.payment}
                    onChange={payment.handleChange}
                    error={payment.touched.payment && Boolean(payment.errors.payment)}
                    helperText={payment.touched.payment && payment.errors.payment}
                    fullWidth
                  >
                    <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                    <MenuItem value="Crédito">Cartão de Crédito</MenuItem>
                    <MenuItem value="Débito">Cartão de Débito</MenuItem>
                    <MenuItem value="Prazo">A prazo</MenuItem>
                  </TextField>
                </div>
              </div>
              <div className={styles.paymentSheduleForm} noValidate autoComplete="off">
                {payment.values.payment !== ''
                  ?
                  <div className={styles.inputBlock}>
                    <TextField
                      name="value"
                      label="Total dos Serviços"
                      variant="outlined"
                      value={payment.values.value}
                      onChange={payment.handleChange}
                      error={payment.touched.value && Boolean(payment.errors.value)}
                      helperText={payment.touched.value && payment.errors.value}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputComponent: NumberFormats,
                      }}
                      fullWidth
                    />
                  </div>
                  :
                  null
                }
                {payment.values.payment === 'Dinheiro'
                  ?
                  <>
                    <div className={styles.inputBlock}>
                      <TextField
                        name="amountPaid"
                        label="Valor Pago"
                        variant="outlined"
                        value={payment.values.amountPaid}
                        onChange={payment.handleChange}
                        error={payment.touched.amountPaid && Boolean(payment.errors.amountPaid)}
                        helperText={payment.touched.amountPaid && payment.errors.amountPaid}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          inputComponent: NumberFormats,
                        }}
                        fullWidth
                      />
                    </div>
                    <div className={styles.inputBlock}>
                      <TextField
                        name="change"
                        label="Troco"
                        variant="outlined"
                        value={(payment.values.amountPaid)
                          ? (payment.values.value <= payment.values.amountPaid)
                            ? payment.values.amountPaid - payment.values.value
                            : ''
                          : ''
                        }
                        InputProps={{
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          inputComponent: NumberFormats,
                        }}
                        fullWidth
                      />
                    </div>
                  </>
                  :
                  null
                }
              </div>
              {payment.values.payment === 'Prazo'
                ?
                <>
                  <SubcategoryForm
                    title="Dados da conta a pagar"
                  />
                  <div className={styles.debtor}>
                    <div className={styles.inputBlock}>
                      <Autocomplete
                        options={debtors}
                        value={payment.values.debtor}
                        onChange={(val, newValue) => {
                          payment.setFieldValue('debtor', newValue)
                          setInputDebtors(newValue)
                        }}
                        getOptionLabel={(option) => option.customerName}
                        inputValue={inputDebtors}
                        onInputChange={(event, newInputValue) => {
                          setInputDebtors(newInputValue)
                        }}
                        renderInput={(params) =>
                          <TextField
                            {...params}
                            label="Devedor"
                            variant="outlined"
                          />
                        }
                        disableClearable
                      />
                    </div>
                    <div className={styles.inputBlock}>
                      <IconButton color="primary" onClick={() => {
                        setOpenModalPayment(false);
                        setOpenModalDebtor(true)
                      }}
                      >
                        <AddIcon />
                      </IconButton>
                    </div>
                  </div>
                  <div className={styles.debtorValues}>
                    <div className={styles.inputBlock}>
                      <Calendar
                        label="Próximo pagamento"
                        value={selectedDeadLine}
                        size="medium"
                        fullWidth
                        onChange={val => {
                          setSelectedDeadLine(val);
                        }}
                      />
                    </div>
                    <div className={styles.inputBlock}>
                      <TextField
                        name="valuePayed"
                        label="Valor Pago"
                        variant="outlined"
                        value={payment.values.valuePayed}
                        onChange={payment.handleChange}
                        error={payment.touched.valuePayed && Boolean(payment.errors.valuePayed)}
                        helperText={payment.touched.valuePayed && payment.errors.valuePayed}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          inputComponent: NumberFormats,
                        }}
                        fullWidth
                      />
                    </div>
                  </div>
                </>
                :
                null
              }

              {payment.values.valuePayed > payment.values.value
                ?
                <div className={styles.warning}>
                  <p>Valor pago não pode ser maior que valor do serviço.</p>
                </div>
                :
                null
              }
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => handleCancel()}>Fechar</PrimaryButton>
              <PrimaryButton
                disabled={
                  payment.values.payment === '' ||
                  payment.values.valuePayed > payment.values.value ||
                  payment.values.value === ''
                }
                type="submit"
              >
                Confirmar
              </PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: FINALIZAR HORÁRIO(PAGAMENTO): FIM */}

        {/* DIALOG BOX: CRIAR DEVEDOR: INICIO */}
        <DialogBox
          open={openModalDebtor}
          onClose={() => setOpenModalDebtor(false)}
          title="Novo devedor"
        >
          <form onSubmit={debtor.handleSubmit}>
            <DialogContent>
              <SubcategoryForm
                title="Dados do devedor"
              />
              <div className={styles.createDebtor}>
                <div className={styles.inputBlock}>
                  <TextField
                    name="customerName"
                    label="Nome do cliente"
                    variant="outlined"
                    value={debtor.values.customerName}
                    onChange={debtor.handleChange}
                    error={debtor.touched.customerName && Boolean(debtor.errors.customerName)}
                    helperText={debtor.touched.customerName && debtor.errors.customerName}
                    fullWidth
                  />
                </div>
                <div className={styles.inputBlock}>
                  <TextField
                    name="phoneNumber"
                    label="Telefone"
                    variant="outlined"
                    value={debtor.values.phoneNumber}
                    onChange={debtor.handleChange}
                    error={debtor.touched.phoneNumber && Boolean(debtor.errors.phoneNumber)}
                    helperText={debtor.touched.phoneNumber && debtor.errors.phoneNumber}
                    InputProps={{
                      inputComponent: TelephoneMask,
                    }}
                    fullWidth
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={() => {
                setOpenModalDebtor(false);
                setOpenModalPayment(true)
              }}>
                Fechar
              </PrimaryButton>
              <PrimaryButton type="submit">Confirmar</PrimaryButton>
            </DialogActions>
          </form>
        </DialogBox>
        {/* DIALOG BOX: CRIAR DEVEDOR: FIM */}

      </Container >
    </Navbar >
  );
}