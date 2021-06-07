import { ThemeProvider } from "@material-ui/core";

import Routes from "./routes";
import UiTheme from "./theme";

import { AuthProvider } from './contexts/AuthContext';
import { NavProvider } from "./contexts/NavContext";
import { SnackProvider } from "./contexts/SnackContext";

import './styles/global.css';

function App() {
  return (
    <ThemeProvider theme={UiTheme}>

      <SnackProvider>
        <AuthProvider>
          <NavProvider>
            <Routes />
          </NavProvider>
        </AuthProvider>
      </SnackProvider>

    </ThemeProvider>
  );
}

export default App;
