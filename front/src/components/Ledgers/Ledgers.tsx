import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Collapse } from 'reactstrap';
import WorkspaceHeader from './WorkspaceHeader';
import LedgerList from './LedgerList';

const API_URL = import.meta.env.VITE_BACKEND_API_URL

interface Ledger {
    uuid: string;
    name: string;
    description: string;
    ledgerSchema: Object;
    allow_multiple: boolean;
    allow_change: boolean;
    allow_change_until_date: Date; 
    created_at: Date; 
    updated_at: Date; 
    access_rights: Array<Object>; 
    triggers: Array<Object>; 
    group: string;
    quizMode: boolean;
    
}

function Ledgers() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    
    const [isOpen, setIsOpen] = useState(false);
    
    const toggle = () => setIsOpen(!isOpen);
    const [dataFromChild, setDataFromChild] = useState(null);
    
    const handleDataFromChild = (data:any) => {
        // Handle the data received from the child
        console.log('Data from child:', data);
        setDataFromChild(data);
    };
    
    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    useEffect(() => {
        setIsLoading(true);
        fetch(API_URL + 'ledgers/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
            },
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
        })
        .catch((err) => {
            console.error(err.message);
            setIsLoading(false); // Hide loading screen
        });
        return () => {
            componentIsMounted.current = false;
        };
    }, []);
    
    return (
        <LedgerList datafromChild={dataFromChild}/>
        );
    }
    
    export default Ledgers;
    
    //<WorkspaceHeader onDataFromChild={handleDataFromChild}/>
