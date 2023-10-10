import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Collapse, CardDeck, CardGroup } from 'reactstrap';
import NavBar from '../Navbar/NavBar';
import WorkspaceHeader from './WorkspaceHeader';
import LedgerItem from './LedgerItem';

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

function LedgerList(datafromChild:any) {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [backendUrl,setbackEndUrl] = useState("http://localhost:8000")
    const [isOpen, setIsOpen] = useState(false);
    const [listType, setListType] = useState('grid');
    
    const toggle = () => setIsOpen(!isOpen);
    
    useEffect(() => {   
        //console.log("Ledger LIST: "+datafromChild)      
        //console.log(datafromChild)    
        setListType(datafromChild)  
        
    }, [datafromChild]); // This effect runs whenever 'field' changes
    
    useEffect(() => {
        setIsLoading(true);
        fetch(backendUrl + '/api/v1/ledgers?limit=1000', {
            method: 'GET'
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            setLedgers(data)
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
        
        <div className="m-3">
        {ledgers.map((ledger,index) => {
            return (
                <LedgerItem ledger={ledger} key={index}/>
                )     
            })}
            </div>
            
            );
        }
        
        export default LedgerList;
        