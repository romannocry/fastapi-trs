  import React, { useState, useEffect, useRef } from 'react';
  import { BrowserRouter, HashRouter, Link, Route, useParams } from "react-router-dom";
  import {Buffer} from 'buffer';
  import InputLabel from '@mui/material/InputLabel';
  import MenuItem from '@mui/material/MenuItem';
  import FormControl from '@mui/material/FormControl';
  import Select, { SelectChangeEvent } from '@mui/material/Select';
  import Tabs from '@mui/material/Tabs';
  import Tab from '@mui/material/Tab';
  import Typography from '@mui/material/Typography';
  import Box from '@mui/material/Box';
  import Card from '@mui/material/Card';
  import CardHeader from '@mui/material/CardHeader';
  import Avatar from '@mui/material/Avatar';
  import { red } from '@mui/material/colors';
  import IconButton, { IconButtonProps } from '@mui/material/IconButton';
  import MoreVertIcon from '@mui/icons-material/MoreVert';
  import ContentCopyIcon from '@mui/icons-material/ContentCopy';
  import { apiURL, appURL } from '../../config';
  import Matrix from './Matrix';
  //Goal of Model Links is to give the links to:
  // - fast fill up to 2 attributes without seeing the form - close on post
  // - fast fill up to 2 attributes and arrive on the form page for full completion
  // - full form without fast fill

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


  const ModelSettings = (props:any) => {
    const [firstDim, setFirstDim] = useState<any>([]);
    const [secondDim, setSecondDim] = useState<any>([]);
    const [model, setModel] = useState<any>({});
    const [modelProps, setModelprops] = useState<any>([]);
    const componentIsMounted = useRef(true);
    const { objectModelId } = useParams();
    const encodedString = Buffer.from('your string here').toString('base64');
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };


      console.log("loading model")
      useEffect(() => {
      
        fetch(apiURL+'/api/models/'+objectModelId, {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': JSON.stringify({'id':1,'username':'roman','email':'babe'})        
          },
      })
      .then((response) => response.json())
      .then((data) => {
          console.log(data);
          setModel(data)
          let enum_options: any[] = []


          Object.keys(data.object_model['properties']).map((key, index) => {
            if ('enum' in data.object_model['properties'][key]) {
              console.log("enum value found in attribute "+key)
              enum_options.push({'key':key,'value':data.object_model['properties'][key]})
            }

          })
          console.log(enum_options)
          setModelprops(enum_options)
      })
      .catch((err) => {
          console.log(err.message);
      });
          return () => {
          componentIsMounted.current = false;
          };
      }, []);

      const setFirstDimension = (event: SelectChangeEvent) => {
        var selected = modelProps.filter((obj: { key: string; }) => {
          return obj.key === event.target.value
        })
        setFirstDim(selected[0].value.enum)
        console.log(selected[0].value.enum)
      };
      const setSecondDimension = (event: SelectChangeEvent) => {
        var selected = modelProps.filter((obj: { key: string; }) => {
          return obj.key === event.target.value
        })
        setSecondDim(selected[0].value.enum)
        console.log(selected[0].value.enum)
      };

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Links" {...a11yProps(0)} />
            <Tab label="Second Tab" {...a11yProps(1)} />
            <Tab label="Third Tab" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
        <Card>
        <CardHeader
          action={
            <IconButton aria-label="settings" onClick={() => {navigator.clipboard.writeText(appURL+'/transaction/'+objectModelId)}}>
            <ContentCopyIcon />
            </IconButton>
          }
          title={apiURL+'/transaction/'+objectModelId}
        />
      </Card>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">First data point</InputLabel>
            <Select
            labelId="demo-simple-select-label" id="select1" value={firstDim} label="Field 1" onChange={setFirstDimension}>
            {modelProps.map((item: any,index: any) => {
            return(
            <MenuItem  key={index} value={item.key}>{item.key}</MenuItem>
            )
            })}

            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Second data point</InputLabel>
            <Select
            labelId="demo-simple-select-label" id="select2" value={secondDim} label="Field 2" onChange={setSecondDimension}>
            {modelProps.map((item: any,index: any) => {
            return(
            <MenuItem  key={index} value={item.key}>{item.key}</MenuItem>
            )
            })}
            </Select>
          </FormControl>
          
          <Matrix d1={firstDim} d2={secondDim}/>

        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>
      </Box>

    );
  }

  export default ModelSettings;

  /*
      <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">First data point</InputLabel>
            <Select
              labelId="demo-simple-select-label" id="select1" value={firstDim} label="Field 1" onChange={setFirstDimension}>
              {modelProps.map((item: any,index: any) => {
                return(
                <MenuItem  key={index} value={item.key}>{item.key}</MenuItem>
                )
              })}

            </Select>
            </FormControl>
            <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Second data point</InputLabel>
              <Select
                labelId="demo-simple-select-label" id="select2" value={secondDim} label="Field 2" onChange={setSecondDimension}>
                {modelProps.map((item: any,index: any) => {
                  return(
                  <MenuItem  key={index} value={item.key}>{item.key}</MenuItem>
                  )
                })}

              </Select>
              </FormControl>
              {JSON.stringify(firstDim)}
              {JSON.stringify(secondDim)}
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


      <div>
          <>
          <h1>Model</h1>
          <h4>{JSON.stringify(modelProps)}</h4>
          <h4>{typeof(modelProps)}</h4>
          <h4>{typeof(test)}</h4>
          {modelProps.map((item: any,index: any) => {
          return (
            <li key={index}>{item.key}</li>
          )     
          })}
          <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Second data point</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={secondSelection}
            label="Field 2"
            onChange={handleChange2}
          >
            {modelProps.map((item: any,index: any) => {
              return(
              <MenuItem  key={index} value={item.key}>{item.key}</MenuItem>
              )
            })}

          </Select>
          </FormControl>
          </>
      </div>


        <>
          <h1>Model</h1>
          <h4>{JSON.stringify(modelProps)}</h4>
          {modelProps.map((model:any) => {
          return (
            <div key={model.key}>
              <h2>k: {model.key}</h2>
              <h2>v: {model.value}</h2>

              <hr />
            </div>
            );
          })}
          <h1>Links of direct form</h1>
          <h4><a target='_blank' href={'http://localhost:3000/forms/' +objectModelId}>http://localhost:3000/forms/{objectModelId}</a></h4>
          <h1>Fast Voting (valid when 2 attributes of enum type)</h1>
          <h4>Select 1 or 2 </h4>
          <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">First data point</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={firstSelection}
            label="Field1"
            onChange={handleChange1}
          >

          </Select>
          </FormControl>

          <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Second data point</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={secondSelection}
            label="Field 2"
            onChange={handleChange2}
          >
            {Object.keys(modelProps).map((name) => (
              <MenuItem
                key={name}
                value={name}
              >
                {name}
              </MenuItem>
            ))}
          </Select>
          </FormControl>
          Selection:
          - {firstSelection}
          - {secondSelection}

            {JSON.stringify(modelProps)}
  
          </>
  */