import React, { useState, useEffect, useRef } from 'react';
import { JsonForms } from '@jsonforms/react';
import { person } from '@jsonforms/examples';
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
import Container from 'react-bootstrap/Container';


function CreateTransaction()  {


const initialData = {}//person.data;
const [data, setData] = useState(initialData);

  const [schema, setSchema] = useState<any>({});
  const [test, setTest] = useState<any>({});
  const [model, setModel] = useState<any>({});
 //   const [data, setData] = useState<any>({});
    const componentIsMounted = useRef(true);
    const { objectModelId } = useParams();
    const { payload = null} = useParams();
    const { type = null } = useParams();
    const typeRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    //console.log("loading Form")
    useEffect(() => {
      setIsLoading(true);
     
      fetch('http://localhost:8000/api/v1/ledgers/'+objectModelId, {
        method: 'GET',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
        },
     })
     .then((response) => response.json())
     .then((data) => {
        console.log(data.ledgerSchema)
        var dataset = data.ledgerSchema
        //dataset = schema2
        setSchema(dataset)

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
        try {
        //submitting a payload on click
        const encodedData = Buffer.from(payload, 'base64').toString('ascii')
        setData(JSON.parse(encodedData))    
        const MySwal = withReactContent(Swal)
        fetch('http://localhost:8000/api/v1/transactions/'+objectModelId+'/'+payload, {
          method: 'POST',
          headers: {
           'Content-Type': 'application/json',
           'Authorization': JSON.stringify({'id':1,'username':'romannn','email':'babe'})        
          },
       })
       .then((response) => {
        if (!response.ok) {
          //throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
      })
      .then((data) => {
        // Check if the response has a 'detail' field
        console.log("***")
        console.log(data)
        console.log("***")
        if (data.detail) {
          // Display the detail message using Swal
          MySwal.fire({
            icon: 'error',
            title: 'API Error',
            text: data.detail,
            timer: 6000, timerProgressBar: true,
            didClose: () => {console.log('redirect')}
          });
        } else if (data.updated) {
          MySwal.fire({
            icon: 'info',
            title: 'Input modified',
            timer: 6000, timerProgressBar: true,
            didClose: () => {console.log("redirect")},
            //didOpen: () => {MySwal.showLoading(null);},
            confirmButtonText: 'Close',
            showConfirmButton: true,
          });

        } else {
          // Handle the success case
          console.log('Success:', data);
          MySwal.fire({
            icon: 'success',
            title: 'Thank for your input, you can close this window',
            timer: 6000, timerProgressBar: true,
            didClose: () => {console.log("redirect")},
            //didOpen: () => {MySwal.showLoading(null);},
            confirmButtonText: 'Close',
            showConfirmButton: true,
          });
          
        }
       })
       .catch((err) => {
          console.log(err.message);
          
       });
      } catch (error) {
        console.log(error)
      }
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
      fetch('http://localhost:8000/api/v1/transactions/'+objectModelId+'/'+encodedData, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
        },
        //body: JSON.stringify(trs_model)

     })
     .then(response => {
      if (!response.ok) {
        console.log("")
        //throw new Error('Network response was not ok');
      }
      return response.json(); // Parse the JSON response
    })
    .then(data => {
      // Check if the response has a 'detail' field
      if (data.detail) {
        // Display the detail message using Swal
        MySwal.fire({
          icon: 'error',
          title: 'API Error',
          text: data.detail,
          timer: 6000, timerProgressBar: true,
          didClose: () => {console.log('redirect')}
        });
      } else if (data.updated) {
        MySwal.fire({
          icon: 'info',
          title: 'Input modified',
          timer: 6000, timerProgressBar: true,
          didClose: () => {console.log("redirect")},
          //didOpen: () => {MySwal.showLoading(null);},
          confirmButtonText: 'Close',
          showConfirmButton: true,
        });

      } else {
        // Handle the success case
        console.log('Success:', data);
        MySwal.fire({
          icon: 'success',
          title: 'Thank for your input, you can close this window',
          timer: 6000, timerProgressBar: true,
          didClose: () => {console.log("redirect")},
          //didOpen: () => {MySwal.showLoading(null);},
          confirmButtonText: 'Close',
          showConfirmButton: true,
        });
        
      }
    })
    .catch(error => {
      // Handle network errors or other issues
      console.error('Fetch Error:', error);
      console.log(error.response)
      // Display a generic error message using Swal
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while processing your request.',
      });
    });
  
  

        return () => {
           
        };
      
    };


  return (
    <Container>
      
      
      <JsonForms
        schema={schema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data, errors }) => setData(data)}
      />

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