import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, CardGroup, CardTitle, CardBody,ButtonToolbar, ButtonGroup, Button, Collapse } from 'reactstrap';
import NavBar from '../Navbar/NavBar';
import WorkspaceHeader from './WorkspaceHeader';
import { FiList } from 'react-icons/fi';
import { AiOutlineForm} from 'react-icons/ai';
import {  BiSolidCog} from 'react-icons/bi';
import { Link } from 'react-router-dom';

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

function LedgerItem(ledger: any) {
    const [ledgerItem, setLedgerItem] = useState<Ledger>(ledger.ledger);

    useEffect(() => {      
        console.log(ledger)   
        
    }, [/* field */]); // This effect runs whenever 'field' changes
 
    
    return (
        
        <Row className="mb-1 gx-0" style={{borderRadius:'8px', fontSize: '14px', boxShadow: ''}}>
        <Col sm="12">
            <Card body style={{padding:5, borderColor:'rgb(240,240,240)'}}>
            <Row>
            <Col sm="3">{ledgerItem.uuid}</Col>
            <Col sm="3">{ledgerItem.name}</Col>
            <Col sm="3">{ledgerItem.description}</Col>

            <Col sm="3" className="d-flex align-items-center">
                
                <ButtonToolbar>
                    <ButtonGroup size="sm">
                    <Button outline><Link to={`/ledger/${ledgerItem.uuid}/transactions`}><FiList/></Link></Button>
                    <Button outline><Link to={`/ledger/${ledgerItem.uuid}/create-transaction`}><AiOutlineForm/></Link></Button>
                    <Button outline><Link to={`/ledger/${ledgerItem.uuid}/edit`}>< BiSolidCog/></Link></Button>
                    </ButtonGroup>
                </ButtonToolbar>                
                </Col>

            </Row>
            </Card>
        </Col>
        </Row>
            
        );
        }
        
        export default LedgerItem;
        