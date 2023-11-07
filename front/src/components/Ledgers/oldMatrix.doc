import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


function Tab({ surveyElement, survey }) {
    const [active, setActive] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState({});

    //console.log(surveyElement)
    useEffect(() => console.log('we need to re-generate matrix '), [surveyElement.answers]);

    const generateMatrix = (e) => {
        console.log("generating matrix")
        let question = surveyElement
        setSelectedQuestion(survey.data[e.target.value])
        question.matrix = []
        surveyElement.answers.map((answer1, index1) => {
            let tempRow = []
            survey.data[e.target.value].answers.map((answers2, index2) => { 
                let tempobj = {"survey":survey.name,"storage":survey.datasourceUri,"surveyCreator":survey.surveyCreator,"auth":survey.auth, "closingParams":survey.closingParams, "data":[{"question":surveyElement.question,"answer":answer1},
                {"question":survey.data[e.target.value].question,"answer":answers2}]}
                tempRow.push(btoa(JSON.stringify(tempobj)).replace(/\//g, '%2F'))
            })
            question.matrix.push(tempRow)
        })
        console.log(survey)

    }

    useEffect(() => {
        console.log("use effect tab")
    }, []);


    return (
        <>
        
        <div className="tabs is-toggle">
        <ul>
            <li onClick={() => setActive(0)} className={active == 0 ? 'is-active' : ''}> 
            <a>
                <span className="icon is-small"><i className="fas fa-ruler-vertical" aria-hidden="true"></i></span>
                <span>Horizontal</span>
            </a>
            </li>
            <li onClick={() => setActive(1)} className={active == 1 ? 'is-active' : ''}>
            <a>
                <span className="icon is-small"><i className="fas fa-ruler-horizontal" aria-hidden="true"></i></span>
                <span>Vertical</span>
            </a>
            </li>
            <li onClick={() => setActive(2)} className={active == 2 ? 'is-active' : ''}>
            <a>
                <span className="icon is-small"><i className="fas fa-grip-horizontal" aria-hidden="true"></i></span>
                <span>Matrix</span>
            </a>
            </li>
        </ul>
        </div>
        {active==0 &&
            <div className="content">
            <table className="table"> 
            <tbody>
            {surveyElement.hashes.map((hashElement, index) => (
                <tr key={index}>
                    <td>
                    <a href={'react-floop/#/surveys/receive/'+hashElement} title="Mouseover Description">{surveyElement.answers[index]}</a>
                    </td>
                </tr>                       
            ))}
            </tbody>
            </table>
            </div>
        }
        {active==1 &&
            <div className="control is-fullwidth">
            <table className="table"> 
            <tbody>
            <tr>
            {surveyElement.hashes.map((hashElement, index) => (
                
                    <td key={index}>
                    <p><a href={'react-floop/#/surveys/receive/'+hashElement} title="Mouseover Description">{surveyElement.answers[index]}</a></p>
                    </td>
            ))}
            </tr>
            </tbody>
            </table>
            </div>
        }
        {active==2 &&
        
            <div className="control is-fullwidth">
                <div className="select">
                <select defaultValue={'select'} onChange={e => generateMatrix(e)}>
                    <option value="select" disabled>Select dropdown</option>
                    {survey.data.map((question, index) => (
                    <option key={index} value={index}>{question.question}</option>
                    ))}
                </select>
                </div>
            
                <table className="table"> 
                <tbody>
                <tr>
                    <td></td>
                    <td></td>
                    <td colSpan="6" style={{align:'center'}}>{selectedQuestion.question}</td>
                </tr>
                <tr>
                <td></td>
                <td></td>
                {typeof selectedQuestion.answers !== 'undefined' &&            
                    <>
                    {selectedQuestion.answers.map((answer, index) => (
                        <td key={index}>{answer}</td>
                    ))}
                    </>
                }
                </tr>
                {surveyElement.matrix.map((dimension, index1) => (
                <React.Fragment key={index1}>             
                <tr> 
                {index1 == 0 &&    
                    <td key={index1} rowSpan={surveyElement.answers.length}>{surveyElement.question}</td>
                }
                <td>{surveyElement.answers[index1]}</td>

                    {dimension.map((hash, index2) => (
                    <td key={index2}>
                    <p><a href={'react-floop/#/surveys/receive/'+hash} title="Mouseover Description">{index1+'+'+index2}</a></p>
                    </td>
                    ))}
                </tr>
                </React.Fragment>
                ))}
                </tbody>
                </table>
            </div>
        }
        </>

    );
}

export { Tab };