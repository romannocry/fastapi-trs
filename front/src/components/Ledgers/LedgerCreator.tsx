import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'reactstrap';
import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
import { Collapse, Nav, NavItem, NavLink, Button, TabContent, TabPane, Card, CardTitle, CardText} from 'reactstrap';
import { ButtonToolbar, ButtonGroup, Form, FormGroup, FormFeedback, FormText, Input, Label } from 'reactstrap';
import { Container } from 'reactstrap';
import { useNavigate } from "react-router-dom";

import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { JsonForms } from '@jsonforms/react';
import {
    materialRenderers,
    materialCells,
} from '@jsonforms/material-renderers';
import Ajv from "ajv";
import { AiOutlineAppstoreAdd} from 'react-icons/ai';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';


interface Ledger {
    uuid?: string;
    name: string;
    description: string;
    ledgerSchema: Object;
    allow_multiple: boolean;
    allow_change: boolean;
    allow_change_until_date: Date; 
    created_at?: Date; 
    updated_at?: Date; 
    access_rights: Array<Object>; 
    triggers?: Array<Object>; 
    group: string;
    quizMode?: boolean;
    expiry_date: Date;
    
}


const default_schema = {
    "type":"object",
    "properties":{
        "A drop downlist example": {
            "title":"How is it going?",
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
let newLedger: Ledger = {
    name: '', 
    description: '',
    ledgerSchema: default_schema,
    allow_multiple: false,
    allow_change: false,
    allow_change_until_date: new Date,
    access_rights: [],
    triggers: [],
    group: '',
    quizMode: false,
    expiry_date: new Date
}

function LedgerCreator() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [backendUrl,setbackEndUrl] = useState("http://localhost:8000")
    const [activeTab,setActiveTab] = useState("1")
    const [formData, setFormData] = useState<any>({});
    //const [jsonSchema, setJsonSchema] = useState(newschema);
    const [ledger, setLedger] = useState<Ledger>(newLedger);
    const navigate = useNavigate();

    
    const ToggleCreationStep= () => {
        if (activeTab == "1"){
            setActiveTab("2")
        } else {
            setActiveTab("1")
        }
        console.log("toggle")
        console.log(ledger)
    };
    
    const handleUserSchemaChange = (value: any, event: any) =>{
        console.log("updating schema")
        // Create Ajv instance
        const ajv = new Ajv();        
        try {
            const parsedValue = JSON.parse(value);
            console.log(parsedValue)
            // Validate the schema using ajv
            const isValid = ajv.validateSchema(parsedValue);
            
            if (isValid) {
                console.log("JSON schema is valid");
                //let newVal = event.target.value
                //setJsonSchema(parsedValue)
                setLedger((prevLedger) => ({
                    ...prevLedger,
                    ['ledgerSchema']: parsedValue
                }));
                
            } else {
                console.log("JSON schema is not valid");
                console.log(ajv.errors);
            }
            // Validate the schema using jsonschema
            
        } catch (error) {
            //setUiSchema({});
            console.log(error)
            console.log("Json incorrect")
        }
        
    };
    
    const handleInputChange = (event: any, attribute:any) =>{
        console.log("handling input change")
        console.log(event)
        console.log(event.target.value)
        console.log(attribute)
        
        try {
            //const parsedValue = JSON.parse(value);
            //setJsonSchema(parsedValue)
            console.log("input change")
            setLedger((prevLedger) => ({
                ...prevLedger,
                [attribute]: event.target.value,
            }));
            //setLedger((prevLedger) => ({...prevLedger,[attribute]: event.target.value,}));
            //setJsonSchema(data)
        } catch (error) {
            //setUiSchema({});
            console.log("submit error")
        }
        
    };
    
    const handleDatePickerChange = (event: any, attribute:any) =>{
        
        try {
            console.log("handling date change")
            setLedger((prevLedger) => ({
                ...prevLedger,
                [attribute]: event
            }));
            //setLedger((prevLedger) => ({...prevLedger,[attribute]: event.target.value,}));
            //setJsonSchema(data)
        } catch (error) {
            //setUiSchema({});
            console.log("submit error")
        }
        
    };
    
    const handleSubmit = () =>{
        console.log("handling submit")
        try {
            console.log("submit")
            fetch(backendUrl+'/api/v1/ledgers', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': "Bearer eyJhbGggciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
                  },
                body:JSON.stringify(ledger),
              })
              .then((response) => {
                if (!response.ok) {
                  //throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the JSON response
              })
              .then((data) => {
                console.log(data)
                navigate(`/ledger/${data.uuid}/edit`);

            })

        } catch (error) {
            console.log("submit error")
        }
        
    };
    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    
    
    return (
        <>
        
        <TabContent activeTab={activeTab} style={{marginBottom:'47px'}}>
        <TabPane tabId="1">
        <Row>
        <Form>
        <FormGroup>
        <Label vallue="" for="name">
        Name
        </Label>
        <Input value={ledger?.name} onChange={(e) => handleInputChange(e, "name")} />
        <FormFeedback>
        You will not be able to see this
        </FormFeedback>
        <FormText>
        Example help text that remains unchanged.
        </FormText>
        </FormGroup>
        <FormGroup>
        <Label for="description">
        Description
        </Label>
        <Input value={ledger?.description} onChange={(e) => handleInputChange(e, "description")} />
        
        </FormGroup>
        <FormGroup>
        <Label for="group">
        group
        </Label>
        <Input value={ledger?.group} onChange={(e) => handleInputChange(e, "group")} />
        
        </FormGroup>


        <FormGroup switch>
        <Input
        type="switch"
        checked={ledger?.allow_change}
        onClick={() => {
            setLedger((prevLedger) => ({...prevLedger,['allow_change']: !ledger.allow_change,}));
        }}
        readOnly
        //onChange={(e) => handleInputChange(e, "allow_change")}
        />
        <Label check>allow change</Label>
        </FormGroup>
        
        {ledger?.allow_change && (
            <FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
            label=""
            value={ledger.allow_change_until_date}
            onChange={(e) => handleDatePickerChange(e, "allow_change_until_date")}
            renderInput={(props) => (
                <TextField {...props} helperText="valid mask" />
                )}
                />
                </LocalizationProvider>
                </FormGroup>
                )}
                
                <FormGroup switch>
                <Input
                type="switch"
                checked={ledger?.allow_multiple}
                onClick={() => {
                    setLedger((prevLedger) => ({...prevLedger,['allow_multiple']: !ledger.allow_multiple,}));
                }}
                readOnly
                //onChange={(e) => handleInputChange(e, "allow_change")}
                />
                <Label check>allow multiple</Label>
                </FormGroup>
                <FormGroup switch>
                <Input
                type="switch"
                checked={ledger?.quizMode}
                //onClick={() => {
                //  setLedger((prevLedger) => ({...prevLedger,['quizMode']: !ledger.allow_multiple,}));
                //}}
                readOnly
                disabled
                //onChange={(e) => handleInputChange(e, "allow_change")}
                />
                <Label check>quiz mode</Label>
                </FormGroup>
                <FormGroup>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker 
                label=""
                value={ledger?.expiry_date}
                onChange={(e) => handleDatePickerChange(e, "expiry_date")}
                renderInput={(props) => (
                    <TextField {...props} helperText="valid mask" />
                    )}
                    />
                    </LocalizationProvider>
                    </FormGroup>
                    </Form>        
                    </Row>
                    </TabPane>
                    <TabPane tabId="2">
                    <Row>
                    <Col>
                    <Editor
                    height="90vh"
                    defaultLanguage="json"
                    defaultValue={JSON.stringify(ledger?.ledgerSchema, null, '\t')}
                    onChange={handleUserSchemaChange}
                    />
                    </Col>
                    <Col>
                    Form Preview
                    <JsonForms
                    schema={ledger?.ledgerSchema}
                    //uischema={uischema}
                    data={formData}
                    renderers={materialRenderers}
                    cells={materialCells}
                    //onError={(error) => console.error('JsonForms Error:', error)}
                    //onChange={({ data, errors }) => setJsonSchema(data)}
                    //onChange={({ data, errors }) => handleJsonFormChange(data,errors)}
                    />
                    </Col>
                    </Row>
                    </TabPane>
                    </TabContent>
                    
                    <div className="sticky-bottom" style={{position:'fixed',width:'100vw'}}>
                    <Row className="m-0 p-3 gx-0" style={{backgroundColor:'rgb(255,255,255)'}}>
                    <ButtonToolbar>
                    <ButtonGroup size="sm" className="me-auto">
                    <Button onClick={() => ToggleCreationStep()}  outline>{activeTab == "1" ? "Next" : "Previous"}</Button>
                    
                    </ButtonGroup>
                    <ButtonGroup size="sm">
                    {activeTab == "2" &&
                    <Button className='success' onClick={() => handleSubmit()} ><AiOutlineAppstoreAdd/>Create ledger </Button>
                    }
                    </ButtonGroup>
                    </ButtonToolbar>
                    </Row>
                    </div>
                </>
                
                );
            }
            
            export default LedgerCreator;
            
            //<WorkspaceHeader onDataFromChild={handleDataFromChild}/>
            