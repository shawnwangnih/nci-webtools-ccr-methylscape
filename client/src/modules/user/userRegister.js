import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import { FormControl, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import Feedback from 'react-bootstrap/esm/Feedback';
import { noConflict } from 'lodash';

export default function UserRegister() {
  const [alerts, setAlerts] = useState([]);
  const [showHideInput, setShowHideInput] = useState('');
  const [emailValidation, setEmailValidation] = useState([]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    accounttype: 'NIH',
  });

  function organizationSelect(e) {
    const orgSelect = e.target.value;
    console.log(orgSelect);
    setShowHideInput(orgSelect);

    setForm({
      ...form,
      organization: e.target.value,
    });
  }

  function validateEmail(email) {
    // const pattern =
    //   /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
    const pattern = /@(nih|nci.nih).gov\s*$/;
    const result = pattern.test(email);
    if (form.accounttype === 'NIH') {
      if (result === true) {
        setEmailValidation({
          emailError: false,
          email: email,
        });
      } else {
        setEmailValidation({
          emailError: true,
        });
      }
    }
  }

  async function handleChange(e) {
    const { name, value } = e.target;
    // if (e.target.name === 'email') {
    //   if (form.accounttype === 'NIH') {
    //     validateEmail(e.target.value);
    //   }
    // }

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    validateEmail(form.email);
    try {
      setAlerts([]);
      console.log(emailValidation.emailError);
      if (emailValidation.emailError === false) {
        const { status, data } = await axios.post('api/users', form);
        console.log({ status, data });
        console.log(form);
        setAlerts([
          {
            type: 'success',
            message: 'Your registration request has been submitted.',
          },
        ]);

        setForm({
          firstName: '',
          lastName: '',
          email: '',
          organization: '',
          accounttype: 'NIH',
        });
        setShowHideInput('');
      } else {
        setAlerts([
          {
            type: 'danger',
            message: 'Please have valid NIH email',
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      const message = error.response.data;
      const message2 = 'Cannot register this user! - ';
      setAlerts([{ type: 'danger', message2, message }]);
    }
  }

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
          {alerts.map(({ type, message }, i) => (
            <Alert
              key={i}
              variant={type}
              onClose={() => setAlerts([])}
              dismissible
            >
              {message}
            </Alert>
          ))}
          <Row>
            <Form.Group controlId="accounttype">
              <Form.Label>Account Type</Form.Label>
              <Form.Check
                inline
                type="radio"
                id="nih"
                label="NIH"
                name="accounttype"
                defaultChecked={true}
                //checked={form.accounttype === 'NIH'}
                value="NIH"
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                id="login.gov"
                label="Login.gov"
                name="accounttype"
                //checked={form.accounttype === 'Login.gov'}
                value="login.gov"
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Row>
            <small>
              If you dont have a login.gov account, click{' '}
              <a href="https://secure.login.gov/sign_up/enter_email">
                <b>here</b>
              </a>{' '}
              to sign up.
            </small>
            <hr className="my-2" />
          </Row>

          <Row>
            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <FormControl
                type="text"
                name="lastName"
                placeholder="Last Name"
                maxLength={255}
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
                maxLength={255}
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
            {emailValidation.emailError ? (
              <span style={{ color: 'red' }}>
                Please Enter valid NIH email address
              </span>
            ) : (
              ''
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="organization">
            <Form.Label>Organization/Institution</Form.Label>
            {/* <Form.Control
              type="text"
              name="organization"
              placeholder="Enter Organization/Instituiton"
              value={form.organization}
              onChange={handleChange}
              required
            /> */}
            <Form.Select
              name="organization"
              value={form.organization}
              onChange={organizationSelect}
            >
              <option value="">Select your Organization/Instituiton</option>
              <option value="NIH">NIH</option>
              <option value="other">Other</option>
            </Form.Select>
            {showHideInput === 'other' && (
              <Form.Control
                type="text"
                name="organization"
                placeholder="Enter Organization/Instituiton"
                //value={form.organization}
                onChange={handleChange}
                required
                className="mt-2"
              />
            )}
          </Form.Group>
          <Row className="d-grid gap-2 col-6 mx-auto">
            <Button variant="primary" type="submit" className="btn-lg">
              Submit
            </Button>
          </Row>
        </Form>
      </Container>
    </>
  );
}
