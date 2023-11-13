import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'reactstrap';
import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
import { Collapse, Nav, NavItem, NavLink, Button, TabContent, TabPane, Card, CardTitle, CardText} from 'reactstrap';

import WorkspaceHeader from './WorkspaceHeader';
import LedgerList from './LedgerList';

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

function LedgerConfigItem() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [activeTab,setActiveTab] = useState("1")
    const { ledgerId } = useParams();

    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes

    
    return (
        <>

      </>
        );
    }
    
    export default LedgerConfigItem;
    
    //<WorkspaceHeader onDataFromChild={handleDataFromChild}/>
