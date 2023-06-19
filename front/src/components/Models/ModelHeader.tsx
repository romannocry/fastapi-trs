import { BrowserRouter, HashRouter, Link, Route, NavLink } from "react-router-dom";
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid'; // Grid version 1
import AddSharpIcon from '@mui/icons-material/AddSharp';

const ColorButton = styled(Button)<ButtonProps>(({ theme }) => ({
    color: theme.palette.getContrastText('#262627'),
    backgroundColor: '#262627',
    '&:hover': {
      backgroundColor: '#262627',
    },
  }));

function ModelHeader() {

  return (
    <Grid container padding={0.5}>
        <Link to={`/models/create`} style={{ textDecoration: 'none' }}>
            <ColorButton variant="outlined"  startIcon={<AddSharpIcon /> }>
            Create Model
            </ColorButton>
        </Link>
    </Grid>

  );
}

export default ModelHeader;
