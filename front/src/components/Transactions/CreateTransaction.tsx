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
import Container from 'react-bootstrap/Container';
import {useSearchParams, useLocation, useNavigate} from 'react-router-dom';
import { update } from '@jsonforms/core';


function CreateTransaction()  {
  
  const [data, setData] = useState({});
  const [backendUrl,setbackEndUrl] = useState("http://localhost:8000")
  const [schema, setSchema] = useState<any>({});
  const componentIsMounted = useRef(true);
  const { ledgerId } = useParams();
  const { payload = null} = useParams();
  const { type = null } = useParams();
  const typeRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation()
  const navigate = useNavigate()
  
  //console.log("loading Form")
  useEffect(() => {
    setIsLoading(true);
    fetch(backendUrl + '/api/v1/ledgers/' + ledgerId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
        },
    })
      .then((response) => response.json())
      .then((data) => {
        setSchema(data.ledgerSchema);
    
        // Now, fetch transactions using the user ID or any relevant information
        return fetch(backendUrl + '/api/v1/transactions/me/' + ledgerId, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
            },
        });
      })
      .then((transactionResponse) => transactionResponse.json())
      .then((transactionData) => {
        // Handle transaction data as needed
        console.log(transactionData);
        if (transactionData[0]){
          setData(transactionData[0].payload)
        }
        setIsLoading(false); // Hide loading screen
      })
      .catch((err) => {
        console.error(err.message);
        setIsLoading(false); // Hide loading screen
      });
    return () => {
      componentIsMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (typeRef.current) return;
    typeRef.current = true;
    console.log("attribute detected")
    handleTransaction(payload)
  }, [type]);
  
  
  const handleTransaction = (urlPayload?: any) =>{     
    const MySwal = withReactContent(Swal)
    //check whether we are getting a payload from the params or input
    try {
      //ternary operator to define the payload between input or params
      let isUrlPayload = urlPayload ? true : false
      //get b64 payload
      let payload_b64 = isUrlPayload ? urlPayload : Buffer.from(JSON.stringify(data)).toString('base64')
      //get json payload
      let payload_json = isUrlPayload ? JSON.parse(Buffer.from(urlPayload, 'base64').toString('ascii')) : data
      // check if object empty
      let isPayloadEmpty = Object.keys(payload_json).length === 0
      //set data - only useful if we want to display the current payload in database
      setData(payload_json)
      
      console.log('isurlpayload: '+isUrlPayload)
      console.log('isPayloadEmpty: '+isPayloadEmpty)
      console.log(payload_b64)
      console.log(payload_json)

      //Post transaction with payload if data not empty
      if (!isPayloadEmpty) {
        fetch(backendUrl+'/api/v1/transactions/'+ledgerId+'/'+payload_b64, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
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
          if (data.detail) {
            // Display the detail message using Swal
            
            MySwal.fire({
              icon: 'error',
              title: 'API Error',
              text: data.detail,
              //timer: 6000, timerProgressBar: true,
              didClose: () => {console.log('close')}
            });
          } else if (data.updated) {
            setIsUpdate(true)
            MySwal.fire({
              icon: 'info',
              title: 'Input modified',
              text: 'Your modification has been taken into account',
              //timer: 6000, timerProgressBar: true,
              didClose: () => {console.log("close")},
              //didOpen: () => {MySwal.showLoading(null);},
              confirmButtonText: 'Close',
              showConfirmButton: true,
            });
            
          } else {
            // Handle the success case
            console.log('Success:', data);
            setIsSuccess(true)
            
          }
        })
        .catch((err) => {
          console.log(err.message);
          
        });
      }
      //no need for else
      
    } catch (error: any) {
      /*if (inputPayloadEmpty) {
        const { pathname } = location;
        const updatedUrl = pathname.substring(0,pathname.lastIndexOf('/'))
        // Use navigate to replace the current URL without the specified parameter
        window.history.replaceState(null, '', updatedUrl);
        //navigate(updatedUrl)        
      }*/
      MySwal.fire({
        icon: 'error',
        title: 'Input Error',
        text: error.message,
        //timer: 6000, timerProgressBar: true,
        didClose: () => {console.log('redirect')}
      });
      
    }
    return () => {
      //componentIsMounted.current = false;
    };
    
  };
  
  return (
    
    <div>
    {isSuccess ? (
      <div className="body">
      {/*<h2 className="text__loading">loading</h2> */}
      <span className="trigger scale"></span>
      <a href="#" className="button"><span className="checkmark"></span>
      </a>
      <h1 className="text__success">success ! you can close this page !</h1>
      </div>
      
      ) : (
        
        <>
        <JsonForms
        schema={schema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data, errors }) => setData(data)}
        />
        {!isUpdate ? (
        <Button variant="contained" endIcon={<SendIcon />} onClick={() => handleTransaction()}>
        Validate
        </Button>
        ):(<></>)}
        
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
        //onClick={handleClose}
        >
        <CircularProgress color="inherit" />
        </Backdrop>
        </>
        )}
        </div>
        
        
        
        );
      }
      
      export default CreateTransaction;