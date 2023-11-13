import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useState } from 'react';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


import Home from './components/Home/Home';
import Ledgers from './components/Ledgers/Ledgers';
import LedgerTransactionList from './components/Transactions/LedgerTransactionList';
import LedgerTransactionView from './components/Transactions/LedgerTransactionsView';
//import "react-toggle/style.css" // for ES6 modules
import { BrowserRouter as Router, Routes, HashRouter, Link, Route, NavLink } from "react-router-dom";
import { Container } from 'reactstrap';

import LedgerCreator from './components/Ledgers/LedgerCreator';
import CreateTransaction from './components/Transactions/CreateTransaction';
import LedgerConfig from './components/Ledgers/LedgerConfig/LedgerConfig';
import Layout from './components/Testing/layout';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Container fluid style={{width:'100%'}} >

<Router>
   <Routes>
   <Route path="/layout" element={<Layout/>}/>
   <Route path="/ledgers" element={<Ledgers/>}/>
   <Route path="/ledger/create" element={<LedgerCreator/>}/>
   <Route path="/ledger/:ledgerId/edit" element={<LedgerConfig/>}/>
   <Route path="/ledger/:ledgerId" element={<CreateTransaction/>}/>
   <Route path="/ledger/:ledgerId/transactions" element={<LedgerTransactionList/>}/>
   <Route path="/ledger/:ledgerId/transactions/:viewType" element={<LedgerTransactionView/>}/>
   <Route path="/ledger/:ledgerId/create-transaction">
     <Route path="" element={<CreateTransaction />} />
     <Route path=":payload" element={<CreateTransaction />} />
   </Route>  
   <Route path="/transaction/:transactionId/edit" element={<LedgerTransactionList/>}/>

   <Route path="/" element={<Home/>}/>

 </Routes>
</Router>
</Container> 

  </React.StrictMode>,
)
