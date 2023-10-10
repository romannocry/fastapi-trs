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
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ModelCard from './ModelCard';
import { apiURL } from '../../config';


function ShowModels() {
  
  // Declare a new state variable, which we'll call "count"
  const [models, setModels] = useState([]);
  const componentIsMounted = useRef(true);
  console.log("loading Models List")
  useEffect(() => {
    console.log(apiURL)
    fetch(apiURL+'/api/models', {
      method: 'GET',
      headers: {
       'Content-Type': 'application/json',
       'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
      },
   })
   .then((response) => response.json())
   .then((data) => {
      console.log(data);
      setModels(data)
      // Handle data
   })
   .catch((err) => {
      console.log(err.message);
   });
      return () => {
      componentIsMounted.current = false;
      };
  }, []);


  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
    {models.map((model,index) => {
      return (
        <Grid xs={12} md={4} lg={3} key={index}>
          <ModelCard model={model}/>
        </Grid>
      )     
      })}
  </Grid>
  );
}

export default ShowModels;
