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

const API_URL = import.meta.env.VITE_BACKEND_API_URL

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


function GeneralSettings(ledger: Ledger) {
  const [isLoading, setIsLoading] = useState(false);
  const componentIsMounted = useRef(true);
  const { ledgerId } = useParams();
  
  useEffect(() => {         
      console.log(ledger)
  }, [/* field */]); // This effect runs whenever 'field' changes
  
return (
  <>
  <Form>
        <FormGroup>
        <Label vallue="" for="name">
        Name
        </Label>
        <Input disabled defaultValue={ledger?.name}/>
        <FormFeedback>
        You will not be able to see this
        </FormFeedback>
        <FormText>
        </FormText>
        </FormGroup>
        <FormGroup>
        <Label for="description">
        Description
        </Label>
        <Input disabled defaultValue={ledger?.description} />
        
        </FormGroup>
        <FormGroup>
        <Label for="group">
        group
        </Label>
        <Input disabled defaultValue={ledger?.group} />
        
        </FormGroup>
  </Form>
  </>
)

}

export default GeneralSettings;
