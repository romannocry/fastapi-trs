import React,{ useState } from 'react';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


import Home from './components/Home/Home';
import Ledgers from './components/Ledgers/Ledgers';
import LedgerTransactionList from './components/Transactions/LedgerTransactionList';
//import "react-toggle/style.css" // for ES6 modules
import { BrowserRouter as Router, Routes, HashRouter, Link, Route, NavLink } from "react-router-dom";
import { Container } from 'reactstrap';

import CreateModel from './components/Ledgers/old/CreateModel';
import CreateTransaction from './components/Transactions/CreateTransaction';
import LedgerConfig from './components/Ledgers/LedgerConfig';
import Layout from './components/Testing/layout';

function App() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  return (
    <Container fluid style={{width:'100%'}} >

       <Router>
          <Routes>
          <Route path="/layout" element={<Layout/>}/>
          <Route path="/ledgers" element={<Ledgers/>}/>
          <Route path="/ledger/create" element={<CreateModel/>}/>
          <Route path="/ledger/edit/:ledgerId" element={<LedgerConfig/>}/>
          <Route path="/ledger/:ledgerId/transactions" element={<LedgerTransactionList/>}/>
          <Route path="/ledger/:ledgerId/create-transaction">
            <Route path="" element={<CreateTransaction />} />
            <Route path=":payload" element={<CreateTransaction />} />
          </Route>  

          <Route path="/" element={<Home/>}/>

        </Routes>
    </Router>
    </Container> 

  );
}

export default App;
