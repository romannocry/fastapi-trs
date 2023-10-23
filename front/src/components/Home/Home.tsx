import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Collapse } from 'reactstrap';
import NavBar from './../Navbar/NavBar';
import UserTransactionList from '../Transactions/UserTransactionList';
import Ledgers from '../Ledgers/Ledgers'

function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    
    
    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    useEffect(() => {
        
    }, []);
    
    return (
        <>
        <Row>
        <Col sm="auto" lg="auto" className="d-none d-md-block">
        <NavBar/>
        </Col>
        <Col className="p-0">
        <Ledgers/>
        
        <UserTransactionList/>
        </Col>
        </Row>
        
        
        </>
        );
    }
    
    export default Home;
    