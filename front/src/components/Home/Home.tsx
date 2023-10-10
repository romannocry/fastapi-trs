import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Collapse } from 'reactstrap';
import NavBar from './../Navbar/NavBar';
import UserTransactionList from '../Transactions/UserTransactionList';

function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    
    
    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    useEffect(() => {
        
    }, []);
    
    return (
        <UserTransactionList/>
        );
    }
    
    export default Home;
    