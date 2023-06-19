import React, { useState, useEffect, useRef } from 'react';
import { JsonForms } from '@jsonforms/react';
import { object, person } from '@jsonforms/examples';
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import {Buffer} from 'buffer';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Backdrop from '@mui/material/Backdrop';
import { apiURL } from '../config';
import { Container } from '@mui/system';


function CreateTransaction()  {
    const [schema, setSchema] = useState({});
    const [model, setModel] = useState({});
    const [data, setData] = useState<any>({});
    const componentIsMounted = useRef(true);
    const { objectModelId } = useParams();
    const { payload = null} = useParams();
    const { type = null } = useParams();
    const typeRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    //console.log("loading Form")
    useEffect(() => {
      setIsLoading(true);
     
      fetch(apiURL+'/api/models/'+objectModelId, {
        method: 'GET',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
        },
     })
     .then((response) => response.json())
     .then((data) => {
        setSchema(data.object_model)
        //setData(JSON.parse(Buffer.from(String(payload), 'base64').toString('ascii')))
        setIsLoading(false)   // Hide loading screen 
     })
     .catch((err) => {
        console.log(err.message);
        setIsLoading(false)   // Hide loading screen 
     });
        return () => {
        componentIsMounted.current = false;
        };
    }, []);

    useEffect(() => {
      if (typeRef.current) return;
      typeRef.current = true;
      handleUrlSubmission(payload,type)
    }, [type]);


    const handleUrlSubmission = (payload: any,type: any) =>{     
      //console.log(payload)
      //console.log(type)

      if (payload !== null) { 
        //submitting a payload on click
        const encodedData = Buffer.from(payload, 'base64').toString('ascii')
        setData(JSON.parse(encodedData))    
        const MySwal = withReactContent(Swal)
        fetch(apiURL+'/api/transaction/'+objectModelId+'/'+payload, {
          method: 'POST',
          headers: {
           'Content-Type': 'application/json',
           'Authorization': JSON.stringify({'id':1,'username':'romannn','email':'babe'})        
          },
       })
       .then((response) => response.json())
       .then((data) => {
          //console.log(data);
          let timerInterval   
          MySwal.fire({
              //position: 'top-end',
              icon: 'success', title: 'Thanks for your input!', showConfirmButton: false,
              timer: 2000, timerProgressBar: true,
              didOpen: () => {MySwal.showLoading(null);},
              didClose: () => {console.log('closing')}
            })
            console.log("return")
       })
       .catch((err) => {
          console.log(err.message);
          MySwal.fire({
            //position: 'top-end',
            icon: 'error',title: err.message,showConfirmButton: false,
            timer: 4000, timerProgressBar: true,
            didOpen: () => {MySwal.showLoading(null);},
            didClose: () => {console.log('closing')}
          })
       });

    } else {
        //no payload - trigger on submit

       }

        return () => {
        //componentIsMounted.current = false;
        };
      
    };

    const handleSubmit = () =>{     
      const MySwal = withReactContent(Swal)
      console.log(data)
      const encodedData = Buffer.from(JSON.stringify(data)).toString('base64');
      console.log(encodedData)
      fetch(apiURL+'/api/transaction/'+objectModelId+'/'+encodedData, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
        },
        //body: JSON.stringify(trs_model)

     })
     .then((response) => response.json())
     .then((data) => {
        console.log(data);
        let timerInterval   
        MySwal.fire({
            //position: 'top-end',
            icon: 'success', title: 'Thanks for your input!', showConfirmButton: false,
            timer: 2000, timerProgressBar: true,
            didOpen: () => {MySwal.showLoading(null);},
            didClose: () => {console.log('closing')}
          })
        
     })
     .catch((err) => {
        console.log(err.message);
     });
        return () => {
        //componentIsMounted.current = false;
        };
      
    };


  return (
    <Container>
          <JsonForms schema={schema} data={data} renderers={materialRenderers} cells={materialCells} onChange={({ data, errors }) => setData(data)}/>
          <Button variant="contained" endIcon={<SendIcon />} onClick={() => handleSubmit()}>
            Validate
          </Button>
          <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
          //onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
    </Container>

  );
}

export default CreateTransaction;

//          {isLoading ? <CircularProgress />: <JsonForms schema={schema} data={data} renderers={materialRenderers} cells={materialCells} onChange={({ data, errors }) => setData(data)}/>}
/*

      switch(type) {
        case 'fast':
          console.log("fast")
          handleUrlSubmission(payload)
          break;
        case 'admin':
          console.log("admin")
          break;
        case 'moderator':
          console.log("moderator")
          break;
        default:
          console.log("default")
          break;
      }

  */