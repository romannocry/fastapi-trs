import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
import io from 'socket.io-client';
import { initiateSocket } from '../Socket/socket';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { GridApi } from 'ag-grid-community';
import { apiURL } from '../config';
import { wsURL } from '../config';



function ShowTransactions() {
    console.log("loading transactions")
    const { objectModelId } = useParams();
    const [transactions, setTransactions] = useState([]);
    const [gridApi, setGridApi] = useState({});
    const [gridApiRefState, setGridApiRef] = useState({});
    //const [gridApi, setGridApi] = useState<any>({});
    const socketRef = useRef(false);
    const gridApiRef = useRef<any>({});

    const getGridData = (params: any) => {
        //console.log("showTransaction")
       // console.log(objectModelId)
       gridApiRef.current = params.api // <= assigned gridApi value on Grid ready
       //console.log(gridApiRef.current)
       //gridOptionsRef.current = params
        // Using Fetch API
        fetch(apiURL+'/api/transactions/'+objectModelId, {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
          },
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        //console.log( JSON.parse(data).data);
        setTransactions(data)
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
              keys.forEach(key => colDefs.push({field : key}));
              gridApiRef.current.setColumnDefs(colDefs)
              gridApiRef.current.setRowData(data)
              
        }    
      })
        
      .catch((err) => {
          console.log(err.message);
      });
    };

    useEffect(() => {
        if (socketRef.current) return;
        socketRef.current = true;
        console.log(transactions);
        var ws = new WebSocket(wsURL+'/feed/transactions/'+objectModelId);
        ws.onmessage = function(event) {
          //console.log(gridOptionsRef.current)
          //console.log(gridApiRef.current)
          console.log(event)
          var eventData = JSON.parse(event.data);
          var renderedNodes = gridApiRef.current.getRenderedNodes()
    
          //if no data in array, initiate Grid with event
          if (!Array.isArray(renderedNodes) || !renderedNodes.length) {
            //console.log(JSON.parse(event.data))
            let colDefs = Array<{}>();
            const keys = Object.keys(eventData)
            keys.forEach(key => colDefs.push({field : key}));
            gridApiRef.current.setColumnDefs(colDefs)
            gridApiRef.current.setRowData([eventData])
            var rowNode = gridApiRef.current.getDisplayedRowAtIndex(0);
            console.log("flash")
            console.log(rowNode)
            gridApiRef.current.flashCells({ rowNodes: [rowNode] }); 

          } else {
    
            var lookup = renderedNodes.findIndex(x => x.data._id_$oid === eventData._id_$oid)
            console.log(renderedNodes)
            console.log(eventData._id_$oid)
            if (lookup != -1) {
              console.log("array not empty and previous transaction found")
              var rowNode = gridApiRef.current.getDisplayedRowAtIndex(lookup);
              console.log(rowNode)
              rowNode.setData(eventData)
              // flash whole row, so leave column selection out
              gridApiRef.current.flashCells({ rowNodes: [rowNode] });  
            } else {
              console.log("array not empty and previous transaction NOT found")
              gridApiRef.current.updateRowData({add: [eventData],addIndex:0});
              gridApiRef.current.refreshCells()
              // get row 0
              // flash whole row, so leave column selection out
              console.log("flash new")
              setTimeout(() => {  
                
                gridApiRef.current.flashCells({ rowNodes: [gridApiRef.current.getDisplayedRowAtIndex(0)] });             
            }, 100);

            }
    
          }
        }
    }, []);

 
        

    return (
        <div className="ag-theme-alpine-dark" style={{height: 700}}>
            <AgGridReact
                //rowData={rowData}
                //columnDefs={columnDefs}
                pagination={true} 
                onGridReady={params => {
                    console.log("AgGridWithUseState Grid Ready");
                    //setGridApi(params.api)
                    //gridApiRef.current = params.api;
                    getGridData(params)
                  }}
                >      
            </AgGridReact>
        </div>
    );
}

export default ShowTransactions;
