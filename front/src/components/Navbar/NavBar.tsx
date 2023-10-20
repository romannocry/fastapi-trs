import { red } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import { Collapse, Nav, NavItem, NavLink, Button} from 'reactstrap';
import { FiList, FiMenu} from 'react-icons/fi';

function NavBar() {
    const [showText, setShowText] = useState(true);

    const toggleTextVisibility = () => {
        console.log("click")
      setShowText(!showText);
    };
    useEffect(() => {         
        
    }, [/* field */]); // This effect runs whenever 'field' changes
    useEffect(() => {
        
    }, []);
    
    return (
        <>
        <Nav vertical className="sticky-top">
        <NavItem>
        <NavLink href="#" className='d-flex align-items-center' >
        <FiMenu className='d-flex align-items-center' onClick={toggleTextVisibility}/>
        </NavLink>
        </NavItem>



        <NavItem>
        <NavLink href="#" className={`${showText ? 'd-none d-lg-inline ' : 'd-lg-none'}`}>
        <FiList/> Link
        </NavLink>
        </NavItem>
        <NavItem>
        <NavLink href="#" className={`${showText ? 'd-none d-lg-inline ' : 'd-lg-none'}`}>
        <FiList/> Link
        </NavLink>
        </NavItem>
        <NavItem>
        <NavLink href="#" className={`${showText ? 'd-none d-lg-inline ' : 'd-lg-none'}`}>
        <FiList/> Another Link
        </NavLink>
        </NavItem>
        <NavItem>
        <NavLink href="#" className={`${showText ? 'd-none d-lg-inline ' : 'd-lg-none'}`}>
        <FiList/> Disabled Link
        </NavLink>
        </NavItem>
        </Nav>
        
        </>
        );
    }
    
    export default NavBar;
    