import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Row, Col } from 'reactstrap';
import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
import { Collapse, Table, Nav, NavItem, NavLink, Button, ButtonToolbar, ButtonGroup, Input, TabContent, TabPane, Card, CardTitle, CardText} from 'reactstrap';
import {Buffer} from 'buffer';
import WorkspaceHeader from './WorkspaceHeader';
import LedgerList from './LedgerList';

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
    [key: string]: any;
}

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
}


function listAllNodes(obj:any, parentNode = "") {
    let nodes:any = []
    for (const key in obj) {
        const currentNode = parentNode ? `${parentNode}.${key}` : key;

        if (obj[key].type !== "object" || !obj[key].properties) {
            console.log(currentNode);
            nodes.push(currentNode)
        }

        if (obj[key].type === "object" && obj[key].properties) {
            const nodeProp = listAllNodes(obj[key].properties, currentNode);
            nodes = nodes.concat(nodeProp);
        }
    }
    return nodes
}

function getFields(obj:any, nodePath:any) {
    const pathSegments = nodePath.split('.');
    let currentNode = obj;

    for (const segment of pathSegments) {
        if (currentNode[segment] && currentNode[segment].type === "object" && currentNode[segment].properties) {
            currentNode = currentNode[segment].properties;
        } else {
            currentNode = currentNode[segment];
        }

        if (!currentNode) {
            // If the node path is invalid
            return null;
        }
    }

    return currentNode.enum;
}

function convertPathString(pathString:string,elem:any) {

    const path = pathString;
    const value = elem;
    
    const keys = path.split('.');
    const resultObject = {};
    
    let currentObject:any = resultObject;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      currentObject[key] = i === keys.length - 1 ? value : {};
      currentObject = currentObject[key];
    }
    
    //console.log(resultObject);
    return resultObject

}

  
function LedgerConfig() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [backendUrl,setbackEndUrl] = useState("http://localhost:8000")
    const [ledger, setLedger] = useState(Object);
    const [nodes, setNodes] = useState([]);
    //const [matrix, setMatrix] = useState([]);
    const [activeTab,setActiveTab] = useState("2")
    const [selectedNode1, setSelectedNode1] = useState('');
    const [selectedNode2, setSelectedNode2] = useState('');
    const [rowsMatrix, setRowsMatrix] = useState<any>([]);
    const [columnsMatrix, setColumnsMatrix] = useState<any>([]);

    const { ledgerId } = useParams();


    const setActive = (id: any) => {
        setActiveTab(id)
        console.log("set active")
    };

    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes

    useEffect(() => {         
      setRowsMatrix(getFields(ledger,selectedNode1))
      setColumnsMatrix(getFields(ledger,selectedNode2))
    }, [selectedNode1,selectedNode2]); // This effect runs whenever 'field' changes

    const generateB64str = (node1Item: any = "", node2Item:any = "") => {
      let combination = Object.assign({}, convertPathString(selectedNode1, node1Item), convertPathString(selectedNode2, node2Item))
      combination = Buffer.from(JSON.stringify(combination)).toString('base64')
      return combination
  };

    useEffect(() => {
        setIsLoading(true);
        fetch(backendUrl + '/api/v1/ledgers/' + ledgerId, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTc2ODA1MTIsInN1YiI6Ijg2YjM4NTUwLWJlMzMtNGQxYS1hZGQ5LTJjYTk2OGE2YzMyZiJ9.u1VqhlfAZN7Ymz7EMS7N9hnwyKYw38EC9eZVchbVAXU"      
            },
        })
          .then((response) => response.json())
          .then((data) => {
            setLedger(data.ledgerSchema.properties);
            console.log(data.ledgerSchema)
            // get nodes from schema
            const nodes = listAllNodes(data.ledgerSchema.properties)
            setNodes(nodes)

          })
          .catch((err) => {
            console.error(err.message);
            setIsLoading(false); // Hide loading screen
          });
        return () => {
          componentIsMounted.current = false;
        };
      }, []);
    
      const handleNodeChange1 = (event:any) => {
        const selectedValue = event.target.value;
        // Do something with the selected value, e.g., call a function
        console.log("Selected Node:", selectedValue);
        setSelectedNode1(selectedValue)
        // You can call your function here
      };

      const handleNodeChange2 = (event:any) => {
        const selectedValue = event.target.value;
        // Do something with the selected value, e.g., call a function
        console.log("Selected Node:", selectedValue);
        setSelectedNode2(selectedValue)
      };

      const ButtonLink: React.FC<ButtonLinkProps> = ({ to, children }) => {
        return (
          <Link to={to}>
            <button>{children}</button>
          </Link>
        );
      };
      
    return (
        <>
        <Nav tabs>
        <NavItem>
          <NavLink
            className={`${activeTab == "1" ? 'active' : ''}`}
            onClick={() => setActive("1")}
          >
            Settings
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`${activeTab == "2" ? 'active' : ''}`}
            onClick={() => setActive("2")}
          >
            Email links
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Row>
            <Col sm="12">
              <h4>
                Tab 1 Contents
              </h4>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
        <div className="sticky-top">
        <Row className="m-0 p-3 gx-0" style={{backgroundColor:'rgb(255,255,255)'}}>
            <ButtonToolbar>
                <ButtonGroup size="sm" className="me-auto">
                <Input
                    bsSize="sm"
                    className="mb-3"
                    type="select"
                    onChange={handleNodeChange1}
                    value={selectedNode1}
                >
                <option value=""> {/* This is the blank/default option */}
                    Default Select
                </option>
                {nodes.map((node,index) => {
                return (
                    <option key={index}>
                    {node}
                    </option>
                    )     
                })}
                </Input>
                </ButtonGroup>
                
                <ButtonGroup size="sm" className="me-auto">
                <Input
                    bsSize="sm"
                    className="mb-3"
                    type="select"
                    onChange={handleNodeChange2}
                    value={selectedNode2}
                >
                <option value=""> {/* This is the blank/default option */}
                    Default Select
                </option>
                {nodes.map((node,index) => {
                return (
                    <option key={index}>
                    {node}
                    </option>
                    )     
                })}
                </Input>

                </ButtonGroup>
            </ButtonToolbar>
        </Row>
        <hr style={{margin:0}}></hr>
        </div>
        <Table>
          <thead>
            <tr>
            <td></td>
            <td></td>
            <td style={{justifyContent: 'center', alignItems: 'center' }} colSpan={3}>{selectedNode2}</td>
            </tr>
        <tr>
        <td></td>
        <td></td>
        {(columnsMatrix ?? []).map((col: any,index: any) => {
          return (
            <th key={index}>{col}</th>
          ) 
        })}
        </tr>
        </thead>
        <tbody>
         <tr>
        <td rowSpan={rowsMatrix && rowsMatrix.length ? rowsMatrix.length + 1 : 0}>{selectedNode1 }</td>
        </tr> 

        {(rowsMatrix ?? []).map((row: any,index: any) => {
          
          return (
            
            <tr key={index}>
            <td>{row}</td>
            {(columnsMatrix ?? []).map((col: any,index: any) => {
            return (
              <td key={index}><ButtonLink to={`/ledger/${ledgerId}/create-transaction/${generateB64str(row,col)}`}>{row}{col}</ButtonLink></td>
              
              ) 
            })}
            </tr>
            
            ) 
           })}
           </tbody>
        </Table>

        </TabPane>
      </TabContent>
      </>
        );
    }
    
    export default LedgerConfig;
    
    //<WorkspaceHeader onDataFromChild={handleDataFromChild}/>
    /*

        {matrix.map((node,index) => {
            return (
                <li key={index}><Button outline><Link target="_blank" to={`/ledger/${ledgerId}/create-transaction/${node}`}>{JSON.stringify(node)}</Link></Button></li>
                )     
            })}


       {Object.entries(ledger).map(([key, value]) => (
            <li
            key={key}
            ><strong>{key}</strong>: 
            {Object.entries(value as { [key2: string]: unknown }).map(([key2, value]) => (
                <ul><strong>{key2}</strong>: {Array.isArray(value) ? 
                    <ul>
                    {value.map((item, index) => (
                      <li key={index}>{key} : {item}</li>
                    ))}
                  </ul>


                    :
                
                    value as ReactNode
                    }
                    </ul>
            ))}
         </li>
        ))}*/