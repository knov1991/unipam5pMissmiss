import { createMuiTheme } from '@material-ui/core/styles';

const UiTheme = createMuiTheme({
  typography: {
    fontFamily: [
      'Roboto',
      'sans-serif'
    ].join(','),
    fontWeight: 400,
  },
  palette: {
    background: {
      default: '#f2f3f5',
    },
    primary: {
      light: '#a957db',
      main: 'rgb(137, 32, 202)',
      mainGradient: 'linear-gradient(9deg, rgba(180,45,209,1) 0%, rgba(137,32,202,1) 100%)',
      dark: '#671f93',
      contrastText: '#fff',
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff'
    }
  },
});

export default UiTheme;