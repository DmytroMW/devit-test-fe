import React, { useState } from 'react';
import axios from 'axios';
import { SERVER_BASE_URL } from './config';
import './App.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';

const App = () => {
  const [concurrency, setConcurrency] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [results, setResults] = useState([]);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const sendRequest = async (index) => {
    try {
      const response = await axios.post(`${SERVER_BASE_URL}api`, { index });
      setResults((prevResults) => [
        ...prevResults,
        { data: response.data, status: 'result-success' },
      ]);
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setResults((prevResults) => [
          ...prevResults,
          {
            data: `Too many requests. Lost index: ${index}`,
            status: 'result-error',
          },
        ]);
      } else {
        setResults((prevResults) => [
          ...prevResults,
          { data: 'An error occurred.', status: 'result-error' },
        ]);
      }
    }
  };

  const handleChange = (input) => {
    setConcurrency(input);

    if (input > 100 || isNaN(input)) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const handleStart = async () => {
    setIsRunning(true);
    let count = 1;
    while (count <= 1000) {
      const promises = [];
      for (let i = 0; i < concurrency; i++) {
        if (count <= 1000) {
          promises.push(sendRequest(count++));
        }
      }
      Promise.all(promises);
      await delay(1000);
    }

    setIsRunning(false);
  };

  return (
    <>
      <Container className="col-md-8 col-sm-10 col-xs-12 m-auto mt-5">
        <InputGroup>
          <InputGroup.Text>Concurrency limit</InputGroup.Text>
          <Form.Control
            aria-label="concurrency limit"
            type="number"
            value={concurrency}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={0}
            max={100}
            required
            disabled={isRunning}
            isInvalid={isInvalid}
          />
          <Button onClick={handleStart} disabled={isRunning || isInvalid}>
            Start
          </Button>
          <Form.Control.Feedback type="invalid">
            maximum number could be 100
          </Form.Control.Feedback>
        </InputGroup>
        <ListGroup className="mt-4">
          {!!results.length &&
            results.map((result, index) => (
              <ListGroup.Item className={result.status} key={index}>
                {result.data}
              </ListGroup.Item>
            ))}
        </ListGroup>
      </Container>
    </>
  );
};

export default App;
