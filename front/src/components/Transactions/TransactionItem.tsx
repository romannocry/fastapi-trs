import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, CardGroup, CardTitle, CardBody, ButtonToolbar, ButtonGroup, Button, Collapse, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import NavBar from '../Navbar/NavBar';
import { AiFillEdit } from 'react-icons/ai';
import { Link } from 'react-router-dom';



interface Transaction {
    uuid: string;
    ledgerUUID: string;
    user_info: string;
    created_by: string;
    payload: any;
    payload_hist: Object; 
    created_at: Date; 
    updated_at: Date; 
  }
  

function TransactionItem(transaction: any) {
    const [TransactionItem, setLedgerItem] = useState<Transaction>(transaction.transaction);

    useEffect(() => {      
        console.log(TransactionItem)   

    }, [/* field */]); // This effect runs whenever 'field' changes
    
    const renderValue = (value: any) => {
        if (typeof value === 'object') {
          // Handle objects (you might want to recursively render nested objects)
          return JSON.stringify(value);
        }
      
        return String(value); // Convert other types to strings
      };
    
    return (
        
      <tr>
        <td>{TransactionItem.uuid}</td>
        <td>
        {Object.entries(TransactionItem.payload).map(([key, value]) => (
                <div key={key}>
                <strong>{key}:</strong> {renderValue(value)}
                </div>
            ))}
        </td>
        <td>{TransactionItem.ledgerUUID}</td>
        <td>

        <ButtonToolbar >
                <ButtonGroup size="sm">
                <Button outline><Link to={`/ledger/${TransactionItem.ledgerUUID}/create-transaction`}><AiFillEdit/></Link></Button>
                <Button  outline>List</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </td>
      </tr>

            
        );
        }
        
        export default TransactionItem;
        
        /**
         * 
         * 
         *         
         * 
        <Row className="mb-1 gx-0" style={{borderRadius:'8px', fontSize: '14px', boxShadow: ''}}>
        <Col sm="12">
            <Card body style={{padding:5, borderColor:'rgb(240,240,240)'}}>
            <Row>
            <Col sm="3">{TransactionItem.uuid}</Col>

            <Col sm="3">
            {Object.entries(TransactionItem.payload).map(([key, value]) => (
                <div key={key}>
                <strong>{key}:</strong> {renderValue(value)}
                </div>
            ))}
            </Col>
            <Col sm="3">{TransactionItem.ledgerUUID}</Col>
            <Col sm="3" className="d-flex align-items-center">
                
            <ButtonToolbar >
                <ButtonGroup size="sm">
                <Button outline><Link to={`/ledger/${TransactionItem.ledgerUUID}/create-transaction`}><AiFillEdit/></Link></Button>
                <Button  outline>List</Button>
                </ButtonGroup>
            </ButtonToolbar>                
            </Col>
            </Row>
            </Card>
        </Col>
        </Row>

         */