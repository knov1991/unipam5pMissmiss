import { createContext } from 'react';

import useNavigation from './hooks/useNavigation';

const NavContext = createContext();

function NavProvider({ children }) {
  const {
    openProducts, openManager, openFinancial, loading, handleClickProducts, handleClickManager, handleClickFinancial, stopLoading 
  } = useNavigation();

  return (
    <NavContext.Provider value={{ openProducts, openManager, openFinancial, loading, handleClickProducts, handleClickManager, handleClickFinancial, stopLoading  }}>
      {children}
    </NavContext.Provider>
  );
}

export { NavContext, NavProvider };