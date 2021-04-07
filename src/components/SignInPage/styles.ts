import { makeStyles } from '@material-ui/core';
import { REGFORMS } from '../../constants';

const useStyles = makeStyles(() => ({
  signInPageWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    background: REGFORMS.sign_in.background,
    backgroundSize: 'cover',
    height: 'calc(100vh - 269px)',
  },
  container: {
    backgroundColor: '#fff',
    marginBottom: '1vh',
    marginRight: '1vw',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 0',
  },
  form: {
    width: '100%',
    marginTop: '8px',
  },
  submit: {
    margin: '24px 0 16px 0',
  },
  link: {
    color: 'blue',
    textDecoration: 'none',
    marginLeft: '8px',
    '&:hover': {
      border: 'none',
      outline: 'none',
      textDecoration: 'underline',
    },
  },
  spinner: {
    margin: '15px 0px',
  },
  button_wrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancel: {
    marginRight: '15px',
    marginTop: '8px',
  },
  link_button: {
    textDecoration: 'none',
  },
  '@media (max-width: 601px)': {
    signInPageWrapper: {
      height: 'calc(100vh - 297px)',
    },
  },
}));

export default useStyles;
