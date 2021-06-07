import { useContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import Loading from './components/Loading';

import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import CashFlow from './pages/CashFlow';
import Debtors from './pages/Debtors';
import CommissionUsers from './pages/CommissionUsers';
import CommissionUserList from './pages/CommissionUserList';
import EmployeeCommission from './pages/EmployeeCommission';
import AccountsDebtors from './pages/AccountsDebtors';
import AccountsPayable from './pages/AccountsPayable';
import ProductsReservation from './pages/ProductsReservation';
import ProductsAvailable from './pages/ProductsAvailable';
import ProductsReserved from './pages/ProductsReserved';
import Users from './pages/Users';
import Products from './pages/Products';
import Occupation from './pages/Occupation';
import Service from './pages/Service';
import NotFound from './pages/NotFound';

// Rotas permitidas enquanto não estiver autenticado.
function NoAuthRoute({...rest}) {
  const { loading, user } = useContext(AuthContext);

  if (loading) {
    return <Loading/>;
  }

  if(user){
    return <Redirect to="/home" />
  }

  return <Route {...rest} />;
}

// Rotas permitidas enquanto estiver estiver autenticado.
function PrivateRoute({ isPrivate, isManagement, isEmployee, isCustomer, ...rest}) {
  const { loading, user, role } = useContext(AuthContext);

  if (loading) {
    return <Loading/>;
  }

  if (isPrivate && !user) {
    return <Redirect to="/login" />
  }
  else if(isManagement && role !== 'manager') {
    return <Route component={NotFound}/>
  } 
  else if(isEmployee && role !== 'employee' && role !== 'manager') {
    return <Route component={NotFound}/>
  }
  else if(isCustomer && role !== 'customer') {
    return <Route component={NotFound}/>
  }

  return <Route {...rest} />;
}

export default function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <NoAuthRoute path="/login" component={ SignIn }/>

        <PrivateRoute isPrivate path={["/", "/home"]} exact component={ Home }/>

        <PrivateRoute isPrivate isCustomer path="/products/reservation" component={ ProductsReservation }/>

        <PrivateRoute isPrivate isEmployee path="/schedule" component={ Schedule }/>
        <PrivateRoute isPrivate isEmployee  path="/financial/employee/commission" component={ EmployeeCommission }/>
        <PrivateRoute isPrivate isEmployee path="/products/available" component={ ProductsAvailable }/>
        <PrivateRoute isPrivate isEmployee path="/products/reserved" component={ ProductsReserved }/>

        <PrivateRoute isPrivate isManagement path="/financial/cashflow" component={ CashFlow }/>
        <PrivateRoute isPrivate isManagement path="/financial/accounts/payable" component={ AccountsPayable }/>
        <PrivateRoute isPrivate isManagement path="/financial/accounts/:debtor/:accounts" component={ AccountsDebtors }/>
        <PrivateRoute isPrivate isManagement path="/financial/commission/:name/:user" component={ CommissionUserList }/>
        <PrivateRoute isPrivate isManagement path="/financial/commission" component={ CommissionUsers }/>
        <PrivateRoute isPrivate isManagement path="/financial/debtors" component={ Debtors }/>
        <PrivateRoute isPrivate isManagement path="/create/users" component={ Users }/>
        <PrivateRoute isPrivate isManagement path="/create/products" component={ Products }/>
        <PrivateRoute isPrivate isManagement path="/service/:name/:occupation" component={ Service } />
        <PrivateRoute isPrivate isManagement path="/create/occupation" component={ Occupation }/>
        
        <Route component={NotFound}/>
      </Switch>
    </BrowserRouter>
  )
}