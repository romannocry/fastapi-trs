import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Row, Col } from 'reactstrap';
import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
import { Collapse, Nav, NavItem, NavLink, Button, TabContent, TabPane, Card, CardTitle, CardText} from 'reactstrap';

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

function LedgerConfig() {
    const [isLoading, setIsLoading] = useState(false);
    const componentIsMounted = useRef(true);
    const [backendUrl,setbackEndUrl] = useState("http://localhost:8000")
    const [ledger, setLedger] = useState(Object);
    const [activeTab,setActiveTab] = useState("2")
    const { ledgerId } = useParams();


    const setActive = (id: any) => {
        setActiveTab(id)
        console.log("set active")
    };

    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes

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
            console.log(data)
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
        ))}

        </TabPane>
      </TabContent>
      </>
        );
    }
    
    export default LedgerConfig;
    
    //<WorkspaceHeader onDataFromChild={handleDataFromChild}/>
