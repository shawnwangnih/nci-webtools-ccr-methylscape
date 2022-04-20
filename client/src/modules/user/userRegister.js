import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { FormControl, FormGroup, FormInput } from 'react-bootstrap';
import axios from 'axios';

export default function UserRegister() {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
  });

  async function handleChange(e) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    // const userData = {
    //   firstName: form.firstName,
    //   lastName: form.lastName,
    //   email: form.email,
    //   organization: form.organization,
    // };
    try {
      setAlerts([]);
      const { status, data } = await axios.post('api/users', form);
      console.log({status, data});
      setAlerts([{type: 'success', message: 'Your registration request has been submitted.'}]);
    } catch(error) {
      console.error(error);
      const message = error.response.data;
      setAlerts([{type: 'danger', message}]);
    }
  };

  return (
    <>
      <Container fluid="xxl" className="d-flex justify-content-center">
        <Row className="text-white my-3">
          <h1>User Registration</h1>
        </Row>
      </Container>
      <Container
        fluid="xxl"
        className="d-inline-flex justify-content-center mb-2 p-2"
      >
        <Form className="bg-light p-3" onSubmit={handleSubmit}>
          {alerts.map(({type, message}, i) => 
            <Alert key={i} variant={type} onClose={() => setAlerts([])} dismissible>
              {message}
            </Alert>
          )}
          <Row>
            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <FormControl
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="organization">
            <Form.Label>Organization/Institution</Form.Label>
            <Form.Control
              type="text"
              name="organization"
              placeholder="Enter Organization/Instituiton"
              value={form.organization}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Row className="d-grid gap-2 col-6 mx-auto">
            <Button
              variant="primary"
              type="submit"
              className="btn-lg"
            >
              Submit
            </Button>
          </Row>
        </Form>
      </Container>
    </>
  );
}
