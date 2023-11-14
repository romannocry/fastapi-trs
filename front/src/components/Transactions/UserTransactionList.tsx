import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, CardGroup, CardTitle, CardBody, ButtonToolbar, ButtonGroup, Button, Collapse, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import NavBar from '../Navbar/NavBar';
import LedgerItem from './TransactionItem';
import TransactionItem from './TransactionItem';
import { Table } from 'reactstrap';

const API_URL = import.meta.env.VITE_BACKEND_API_URL

interface Transaction {
    uuid: string;
    legderUUID: string;
    user_info: string;
    created_by: string;
    payload: string;
    payload_hist: string; 
  }
  

function UserTransactionList() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [listType, setListType] = useState('grid');
    
    const toggle = () => setIsOpen(!isOpen);
    
    useEffect(() => {   
        //console.log("Ledger LIST: "+datafromChild)      
        //console.log(datafromChild)    
        
    }, []); // This effect runs whenever 'field' changes
    
    useEffect(() => {
        setIsLoading(true);
        fetch(API_URL + 'transactions?limit=1000', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
                },
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            setTransactions(data)
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
        <h5>Your transactions</h5>
        <Pagination size="sm">
            <PaginationItem>
                <PaginationLink
                first
                href="#"
                />
            </PaginationItem>
            <PaginationItem>
                <PaginationLink
                href="#"
                previous
                />
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#">
                1
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#">
                2
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#">
                3
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#">
                4
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#">
                5
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink
                href="#"
                next
                />
            </PaginationItem>
            <PaginationItem>
                <PaginationLink
                href="#"
                last
                />
            </PaginationItem>
        </Pagination>

        <Table
        responsive
        size=""
        style={{ fontSize: '12px' }}
        >
        <thead>
            <tr>
            <th>
                #id
            </th>
            <th>
                Payload
            </th>
            <th>
                #id2
            </th>
            <th>
                actions
            </th>
            </tr>
        </thead>
        <tbody>

        {transactions.map((transaction,index) => {
            return (
                <TransactionItem transaction={transaction} key={index}/>
                )     
            })}
        </tbody>
            </Table>
            </div>
            
            );
        }
        
        export default UserTransactionList;
        