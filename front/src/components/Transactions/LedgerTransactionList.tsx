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

function LedgerTransactionList() {
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

    const gridOptions = {
      rowGrouping: true, // Enable row grouping
    };

    const onBtnExport = () => {
      console.log("BTN")
      gridApi.exportDataAsCsv()
      //gridApiRefState.current.api.exportDataAsCsv();

      //gridApiRefState.api.exportDataAsCsv();
    }

    const getGridData = (params: any) => {
        //console.log("showTransaction")
       // console.log(objectModelId)
       gridApiRef.current = params.api // <= assigned gridApi value on Grid ready
       setGridApi(params.api);
       //console.log(gridApiRef.current)
       //gridOptionsRef.current = params
        // Using Fetch API
        fetch(API_URL+'transactions/ledger/'+ledgerId+'?limit=1000', {
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
        if (!Array.isArray(data) || !data.length) {
          // array does not exist, is not an array, or is empty
              console.log("empty")
              gridApiRef.current.setColumnDefs([])
              gridApiRef.current.setRowData([])
              //console.log("array empty")
              //console.log(gridApi)

        } else {
              //console.log("else")
              let colDefs = Array<{}>();
              //gridOptions.api.getColumnDefs();
              const keys = Object.keys(data[0])
              keys.forEach(key => colDefs.push({field : key, filter: 'agMultiColumnFilter', resizable: true, cellStyle: { fontSize: '10px',margin: '0px' }}));
              console.log(colDefs)
              gridApiRef.current.setColumnDefs(colDefs)
              gridApiRef.current.setRowData(transactionsWithStringifiedProps)
              setGridApiRef(gridApiRef)
        }    
      })
        
      .catch((err) => {
          console.log(err.message);
      });
    };

    useEffect(() => {
      //The 'transactions' state might still be empty here
      //console.log('Inside useEffect:', transactions);


      
    }, [transactions]); // This effect runs whenever 'transactions' changes

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

          var isAlreadyPresent = false

          var renderedNodes = gridApiRef.current.getRenderedNodes()
          // Access a specific row by object's ID
          gridApiRef.current.forEachNode((rowNode: {
            setData(transactionWithParsedProps: any): unknown;
            rowIndex: any; data: Transaction; 
          }) => {
            //console.log(rowNode)
            if (rowNode.data.uuid === transactionWithParsedProps.uuid) {
              // Access the matching row data and node
              // Perform any actions you need with the row data or node
              isAlreadyPresent = true
              console.log('Matching Row Data:', rowNode.rowIndex);
              rowNode.setData(transactionWithParsedProps)
              // flash whole row, so leave column selection out
              gridApiRef.current.flashCells({ rowNodes: [rowNode] });  
            } 
          });

          if (!isAlreadyPresent) {
            console.log("array not empty and previous transaction NOT found")
            gridApiRef.current.updateRowData({add: [transactionWithParsedProps],addIndex:0});
            gridApiRef.current.refreshCells()
            // get row 0
            // flash whole row, so leave column selection out
            console.log("flash new")
            setTimeout(() => {  
              
              gridApiRef.current.flashCells({ rowNodes: [gridApiRef.current.getDisplayedRowAtIndex(0)] });             
          }, 100);
          }

          //if no data in array, initiate Grid with event
          if (!Array.isArray(renderedNodes) || !renderedNodes.length) {
            //console.log(JSON.parse(event.data))
            let colDefs = Array<{}>();
            const keys = Object.keys(transactionWithParsedProps)
            keys.forEach(key => colDefs.push({field : key}));
            gridApiRef.current.setColumnDefs(colDefs)
            gridApiRef.current.setRowData([transactionWithParsedProps])
            var rowNode = gridApiRef.current.getDisplayedRowAtIndex(0);
            //console.log("flash")
            //console.log(rowNode)
            gridApiRef.current.flashCells({ rowNodes: [rowNode] }); 

          }
        }
    }, []);

 
        

    return (

      <>
        <div style={{ backgroundColor:'red', height: '10vh', width: '100vw' }}>
        <Button onClick={onBtnExport} outline>Danger!</Button>
      </div>
        <div className="ag-theme-alpine-dark" style={{ height: '90vh', width: '100vw' }}>

            
            <AgGridReact
                //rowData={rowData}
                //columnDefs={columnDefs}
                pagination={true}
                rowHeight={20} // Set a small value for minimal row height
                //domLayout='autoHeight'
                
                onGridReady={params => {
                    console.log("AgGridWithUseState Grid Ready");
                    //setGridApi(params.api)
                    //gridApiRef.current = params.api;
                    getGridData(params)
                  }}
                >      
            </AgGridReact>
        </div>
        </>
    );
}

export default LedgerTransactionList;
