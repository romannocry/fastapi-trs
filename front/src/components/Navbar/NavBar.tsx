import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Collapse, Nav, NavItem, NavLink, Button} from 'reactstrap';


function NavBar() {

    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    useEffect(() => {

      }, []);
    
    return (
      <>
        <Nav vertical className="sticky-top">
        <NavItem>
            <NavLink href="#">
            Link
            </NavLink>
        </NavItem>
        <NavItem>
            <NavLink href="#">
            Link
            </NavLink>
        </NavItem>
        <NavItem>
            <NavLink href="#">
            Another Link
            </NavLink>
        </NavItem>
        <NavItem>
            <NavLink
            disabled
            href="#"
            >
            Disabled Link
            </NavLink>
        </NavItem>
        </Nav>

        </>
        );
    }
    
    export default NavBar;
    