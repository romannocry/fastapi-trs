import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';



//Matrix component
const Matrix = (props:any) => {
  const [d1, setD1] = useState(props.d1);
  const [d2, setD2] = useState(props.d2);
  useEffect(() => {
    console.log(props)
    setD1(props.d1)
    setD2(props.d2)
  }, []);


  return (
    <>
    a
    {d1}
    <table className="table"> 
      <tbody>
      <tr>
        <td> Q1\Q2</td>
        {d2.map((d2item: any,index: any) => {
        return(
            <td key={index}>{d2item}</td>
          )
        })}
      </tr>
        {d1.map((d1item: any,index: any) => {
        return(
          <tr>
            <td key={index}>{d1item}</td>
            {d2.map((d2item: any,index: any) => {
            return(
                <td key={index}>{d1item} + {d2item}</td>
              )
            })}
          </tr>
        
        )
      })}
      
      </tbody>
      </table>

    </>
    )
};

export default Matrix;

/*

              <table className="table"> 
              <tbody>
              
                {firstDim.map((item: any,index: any) => {
                return(
                  <tr>
                    <td key={index}>{item}</td>
                    
                    {secondDim.map((itemd2: any,index2: any) => {<td key={index2}>{itemd2}</td>})}
                  </tr>
                )
              })}
              
              </tbody>
              </table>
*/