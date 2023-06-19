import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { BrowserRouter, HashRouter, Link, Route, NavLink } from "react-router-dom";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import BasicCard from './ModelCard';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid'; // Grid version 1
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import DataArrayIcon from '@mui/icons-material/DataArray';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


//Model Card component
const ModelCard = (props:any) => {
  const [modelState, setModelState] = useState(props.model);
  const [expanded, setExpanded] = React.useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  //<ul class="c-table__row" onClick=${() => alert(modelState.index)}>
  return (
    <Card > 
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={modelState.object_name}
        subheader={modelState.object_creation_date.$date}
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {modelState._id.$oid}
        </Typography>

      </CardContent>
      <CardActions disableSpacing>
        <Link to={`/transactions/${modelState._id.$oid}`}>
          <IconButton aria-label="Show dataset">
            <DataArrayIcon />
          </IconButton>
        </Link>
        <Link to={`/transaction/${modelState._id.$oid}`}>
          <IconButton aria-label="Show form">
            <DynamicFormIcon />
          </IconButton>
        </Link>
        <Link to={`/models/${modelState._id.$oid}`}>
          <IconButton aria-label="Show links">
            <ShareIcon />
          </IconButton>
        </Link>
        
      </CardActions>

    </Card>
   
    )
};

export default ModelCard;
/*
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={modelState.object_name}
        subheader={modelState.object_creation_date.$date}
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {modelState._id.$oid}
        </Typography>

      </CardContent>
      <CardActions disableSpacing>
        <Link to={`/transactions/${modelState._id.$oid}`}>
          <IconButton aria-label="Show dataset">
            <DataArrayIcon />
          </IconButton>
        </Link>
        <Link to={`/forms/${modelState._id.$oid}`}>
          <IconButton aria-label="Show form">
            <DynamicFormIcon />
          </IconButton>
        </Link>
        <Link to={`/links/${modelState._id.$oid}`}>
          <IconButton aria-label="Show links">
            <ShareIcon />
          </IconButton>
        </Link>
        
      </CardActions>

    </Card>

    */
/*
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={modelState.object_name}
        subheader="September 14, 2016"
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {modelState._id_$oid}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Method:</Typography>
          <Typography paragraph>
          <Link className="btn btn-primary" to={`/transactions/${modelState._id_$oid}`}>
         Show dataset
        </Link>
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
    */