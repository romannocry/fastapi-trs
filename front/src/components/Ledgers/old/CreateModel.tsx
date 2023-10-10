import React, { useState, Fragment } from 'react';
import { JsonForms } from '@jsonforms/react';
import { person } from '@jsonforms/examples';
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Highlight, { defaultProps } from "prism-react-renderer";
import theme from 'prism-react-renderer/themes/nightOwl'
import Grid from '@mui/material/Grid'; // Grid version 
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import {Link, Routes, Route, useNavigate} from 'react-router-dom';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { apiURL } from '../../config';



function CreateModel() {
    // Declare a new state variable, which we'll call "count"
    //const schema = person.schema;
    //const uischema = person.uischema;
    const settingSchema = {
      "type":"object",
      "properties":{
        "name":{
          "type":"string",
          "description":"Name of your dataset"
        },
        "description":{
          "type":"string"
        },
        "allow_multiple":{
          "type":"boolean"
        },
        "allow_change":{
          "type":"boolean"
        },
        "allow_change_until_date": {
          "type": "string",
          "format": "date-time"
        },
      },
      "required":[
        "name",
        "description"
      ]
    }
    

    const newschema = {
      "type":"object",
      "properties":{
        "A drop downlist example": {
          "type": 'string',
          "enum": ['SG', 'NON SG']
        },

        "rating":{
          "type":"integer"
        },
        "SMC Choice": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "oneOf": [
              {
                "const": "IDX",
                "title": "Indexation"
              },
              {
                "const": "FSI",
                "title": "FSI"
              },
              {
                "const": "QMM",
                "title": "Quantitative Market Making"
              }
            ]
          }
        },
        "date": {
          "type": "string",
          "format": "date",
          "description": "schema-based date picker"
        }
      },
      "required":[
        "rating"
      ]
    }
    const initialData = person.data;
    const [trsModel, setTrsModel] = useState<any>({});
    const [data, setData] = useState(initialData);
    const [settings, setSettings] = useState<any>({});
    const [settingsSchema, setSettingsSchema] = useState(settingSchema);
    const [InitialSchema, setUiSchema] = useState(newschema);
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal)

    const handleSubmit = () =>{
      console.log("creating model")
      console.log(settings)
      let trs_model = {
        'object_name': settings.name,
        'object_description': settings.description,
        'allow_change': settings.allow_change,
        'allow_change_until_date': settings.allow_change_until_date,
        'allow_multiple': settings.allow_multiple,
        'object_model': InitialSchema
      }

      //console.log(trs_model)

      fetch(apiURL+'/api/models', {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
        
        },
        body: JSON.stringify(trs_model)

     })
     .then((response) => response.json())
     .then((data) => {
      console.log('Success:', data);
      let timerInterval   
      MySwal.fire({
          //position: 'top-end',
          icon: 'success',
          title: 'You are being redirected to your datasets settings page',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            MySwal.showLoading(null);
          },
          didClose: () => {
            //navigate('/models/'+data.$oid);
          }
        })
     })
     .catch((err) => {
        console.log(err.message);
        MySwal.fire({
          //position: 'top-end',
          icon: 'error',
          title: err.message,
          showConfirmButton: false,
          timerProgressBar: true,
        })     });
        return () => {
        //componentIsMounted.current = false;
        };
      
    };

    const handleSettingsSchemaChange = (value: any, event: any) =>{
      console.log("updating settings")
      console.log(value)
      setSettingsSchema(JSON.parse(value))
      //console.log(JSON.parse(e.target.value))
      //setUiSchema(JSON.parse(e.target.value))
      
    };
    const handleUserSchemaChange = (value: any, event: any) =>{
      console.log("updating user schema")
      setUiSchema(JSON.parse(value))
      //console.log(JSON.parse(e.target.value))
      //setUiSchema(JSON.parse(e.target.value))
      
    };


    return (
      <div>
        <Grid container spacing={2}>
          <Grid xs={6} md={4}>
            a
          </Grid>
          <Grid xs={6} md={8}>
          <Button variant="contained" endIcon={<SendIcon />} onClick={() => handleSubmit()}>
            Create Model
          </Button>
          </Grid>
          <Grid xs={6} md={4}>
          <Editor
            height="90vh"
            defaultLanguage="json"
            defaultValue={JSON.stringify(InitialSchema, null, '\t')}
            onChange={handleUserSchemaChange}
          />
          </Grid>
          <Grid xs={6} md={8}>
          <Divider>Initial Settings</Divider>
          <JsonForms
              schema={settingsSchema}
              //uischema={uischema}
              data={settings}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ data, errors }) => setSettings(data)}
            />
            <br></br>
          <Divider>User dataset Settings</Divider>

          <JsonForms
              schema={InitialSchema}
              //uischema={uischema}
              data={data}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ data, errors }) => setData(data)}
            />
          </Grid>
        </Grid>
      </div>


    );
  }
  
  export default CreateModel;
  