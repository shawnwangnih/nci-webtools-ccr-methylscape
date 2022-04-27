import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import { FormControl, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { formState, organizationsSelector } from './user.state';

export default function UserRegister() {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useRecoilState(formState)
  const resetForm = useResetRecoilState(formState);
  const organizations = useRecoilValue(organizationsSelector);

  async function handleChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
  }

  //   function validate() {
  //     let firstNameError = "";
  //     let lastNameError = "";
  //     let emailError = "";
  //     if (!this.form.firstname) {
  //       firstNameError = "First Name field is required";
  //     }
  //     if (!this.form.lastname) {
  //         lastNameError = "Last Name field is required";
  //       }
  //     const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  //     if (!this.form.email || reg.test(this.form.email) === false) {
  //       emailError = "Email Field is Invalid ";
  //     }

  //     if (emailError || firstNameError || lastNameError) {
  //       this.setState({ firstNameError, emailError, lastNameError });
  //       return false;
  //     }
  //     return true;
  //   }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setAlerts([]);
      const { status, data } = await axios.post('api/users', form);
      console.log({ status, data });
      console.log(form);
      setAlerts([
        {
          type: 'success',
          message: 'Your registration request has been submitted.',
        },
      ]);

      resetForm();
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
            <Form.Group className="" controlId="accounttype">
              <Form.Label>Account Type</Form.Label>
              <Form.Check
                inline
                type="radio"
                id="nih"
                label="NIH"
                name="accountType"
                checked={form.accountType === 'NIH'}
                value="NIH"
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                id="login.gov"
                label="Login.gov"
                name="accountType"
                checked={form.accountType === 'Login.gov'}
                value="Login.gov"
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
            <hr />
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
          </Form.Group>
          <Form.Group className="mb-3" controlId="organization">
            <Form.Label>Organization/Institution</Form.Label>
            <Form.Select
              name="organizationId"
              value={form.organizationId}
              onChange={handleChange}
              required
            >
              <option value="" hidden>Select your Organization/Instituiton</option>
              {organizations.map(o => (
                <option key={`organization-${o}`} value={o.id}>{o.name}</option>
              ))}
            </Form.Select>
            {+form.organizationId === 1 && (
              <Form.Control
                type="text"
                name="organizationOther"
                placeholder="Enter Organization/Instituiton"
                value={form.organizationOther}
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
