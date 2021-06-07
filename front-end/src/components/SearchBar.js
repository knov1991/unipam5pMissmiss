import { InputAdornment, TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';

import styles from '../styles/components/SearchBar.module.css';

export default function SearchBar({...props}) {
  return (
    <div className={styles.productFilter}>
      <form className={styles.searchForm}>
        <div className={styles.inputBlock}>
          <TextField 
            id="search" 
            variant="outlined" 
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            {...props}
          />
        </div>
      </form>
    </div>
  );
}