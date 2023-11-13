import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useParams } from "react-router-dom";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from 'reactstrap';

const API_URL = import.meta.env.VITE_BACKEND_API_URL
const WS_URL = import.meta.env.VITE_BACKEND_WS_URL

interface Transaction {
  uuid: string;
  legderUUID: string;
  user_info: string;
  created_by: string;
  payload: string;
  payload_hist: string; 
}

function LedgerTransactionView() {
    const { ledgerId } = useParams();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [gridApiRefState, setGridApiRef] = useState<any>(null)
    const [gridData, setGridData] = useState([]);
    const [gridApi, setGridApi] = useState<any>(null); // Adjust the type as needed

    //const [gridApi, setGridApi] = useState<any>({});
    const socketRef = useRef(false);
    const gridApiRef = useRef<any>({});

    // Function to append a new transaction
    const appendTransaction = (newTransaction: Transaction) => {
      setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    };

    useEffect(() => {
        // Using Fetch API
        fetch(API_URL+'transactions/'+ledgerId+'?limit=1000', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
            },
        })
        .then((response) => response.json())
        .then((data) => {
          const transactions: Transaction[] = data;
          // Stringify payload and payload_hist properties
          const transactionsWithStringifiedProps = transactions.map(transaction => ({
            ...transaction,
            payload: JSON.stringify(transaction.payload),
            payload_hist: JSON.stringify(transaction.payload_hist),
          }));
          console.log(transactionsWithStringifiedProps)
  
  
          setTransactions(transactionsWithStringifiedProps)
        })
          
        .catch((err) => {
            console.log(err.message);
        });

    }, []); // This effect runs whenever 'transactions' changes

    useEffect(() => {
        if (socketRef.current) return;
        socketRef.current = true;
        console.log(transactions);

        var ws = new WebSocket(WS_URL+'transactions/ws/'+ledgerId);
        
        ws.onopen = () => ws.send("token");

        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onmessage = function(event) {
          //console.log(gridOptionsRef.current)
          //console.log(gridApiRef.current)
          console.log(event)
          var transactionData = JSON.parse(event.data);
          // Convert payload and payload_hist objects to strings
          const transactionWithParsedProps = {
            ...transactionData,
            payload: JSON.stringify(transactionData.payload),
            payload_hist: JSON.stringify(transactionData.payload_hist),
          };

          // Update 'transactions' state with a callback
          setTransactions((prevTransactions) => {
            // Check if the transaction already exists
            const transactionExists = prevTransactions.some(

              (transaction) => transaction.uuid === transactionWithParsedProps.uuid
            );
            // If the transaction doesn't exist, append it to the array
            if (!transactionExists) {
              console.log("If the transaction doesn't exist, append it to the array")
              return [...prevTransactions, transactionWithParsedProps];
            }

            // If the transaction exists, return the unchanged array
            return prevTransactions;
          });
        }
    }, []);

 
        

    return (

      <>
    Public View
    {JSON.stringify(transactions)}
        </>
    );
}

export default LedgerTransactionView;
