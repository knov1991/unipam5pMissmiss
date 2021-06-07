import React from 'react';
import { Link } from 'react-router-dom';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PrimaryButton from './Button';

export default function ActionButton({ ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <PrimaryButton
        onClick={handleClick}
        startIcon={props.icon}
      >
        {props.text}
      </PrimaryButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
      >
        {props.actions.map(action => {
          return (
            <MenuItem
              component={Link}
              onClick={() => {action.onClick(); handleClose()}}
            >
              {action.text}
            </MenuItem>)
        })}
      </Menu>
    </div>
  );
};