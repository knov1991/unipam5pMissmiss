import { Hidden, InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import styles from '../styles/components/ManagerBackground.module.css';


export default function ManagerBackground({ ...props }) {
  return (
    <div className={styles.background}>
      <div className={styles.headerUtility}>
        <div className={styles.search}>
          <Hidden smDown>
            <TextField
              id="search"
              variant="outlined"
              margin="dense"
              {...props}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Hidden>
          <Hidden mdUp>
            <TextField
              id="search"
              variant="outlined"
              margin="dense"
              fullWidth
              {...props}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Hidden>
          {props.children}
        </div>
        <div className={styles.btn}>
          {props.button}
        </div>
      </div>
    </div>
  );
}