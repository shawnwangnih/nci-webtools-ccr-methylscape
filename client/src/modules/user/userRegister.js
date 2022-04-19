import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { FormGroup } from 'react-bootstrap';
import axios from 'axios';

export default function UserRegister() {
  //   const [state, setState] = useState({
  //     firstname: '',
  //     lastname: '',
  //     email: '',
  //     organization: '',
  //   });

  //   const handleChange = (e) => {
  //     const value = e.target.value;
  //     setState({
  //       ...state,
  //     });
  //   };

  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     const userData = {
  //       firstname: state.firstname,
  //       lastname: state.lastname,
  //       email: state.email,
  //       organization: state.organization,
  //     };
  //     axios.post('', userData).then((response) => {
  //       console.log(response.status);
  //       console.log(response.data);
  //     });
  //   };

  return (
    <>
      <Container>
        <Row className="text-white my-3">
          <h1>Register</h1>
        </Row>
      </Container>
      <Container
        fluid="xxl"
        className="d-inline-flex bg-light justify-content-center mb-2 p-2"
      >
        <Form className="m-3">
          <Row>
            <Form.Group className="mb-3" controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last Name"
                //value={state.lastname}
                //onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First Name"
                //value={state.firstname}
                //onChange={this.handleChange}
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              //value={state.email}
              //onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="organization">
            <Form.Label>Organization/ Institution</Form.Label>
            <Form.Control
              type="text"
              placeholder="Organization/ Instituiton"
              //value={state.organization}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}
