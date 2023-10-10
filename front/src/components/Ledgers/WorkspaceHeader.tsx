import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, ButtonToolbar, ButtonGroup, Button, Collapse } from 'reactstrap';
import NavBar from './../Navbar/NavBar';

interface WorkspaceHeaderProps {
    onDataFromChild: (data: string) => void;
  }
  
//function WorkspaceHeader(onDataFromChild(): any) {
const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onDataFromChild }) => {
    const [view, setView] = useState('list');

    const setGrid = () => {
        setView('grid')
        onDataFromChild(view);
      };

      const setList = () => {
        setView('list')
        onDataFromChild(view);
      };

    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    useEffect(() => {
  
    }, []);
    
    return (
        <div className="sticky-top">
        <Row className="m-0 p-3 gx-0" style={{backgroundColor:'rgb(255,255,255)'}}>
            <ButtonToolbar>
                <ButtonGroup size="sm" className="me-auto">
                <Button disabled>Create new ledger</Button>
                </ButtonGroup>
                <ButtonGroup size="sm">
                <Button disabled className={view === 'grid'  ? 'active' : 'inactive'} onClick={setGrid} outline>Grid</Button>
                <Button className={view === 'list'  ? 'active' : 'inactive'}  onClick={setList} outline>List</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </Row>
        <hr style={{margin:0}}></hr>
        </div>
        );
    }
    
    export default WorkspaceHeader;
    