import { useState } from 'react';

export default function useNavigation() {
  const [openProducts, setOpenProducts] = useState(false);
  const [openManager, setOpenManager] = useState(false);
  const [openFinancial, setOpenFinancial] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClickProducts = () => {
    setOpenProducts(!openProducts);
  };

  const handleClickManager = () => {
    setOpenManager(!openManager);
  };

  const handleClickFinancial = () => {
    setOpenFinancial(!openFinancial);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  return { openProducts, openManager, openFinancial, loading, handleClickProducts, handleClickManager, handleClickFinancial, stopLoading };
}