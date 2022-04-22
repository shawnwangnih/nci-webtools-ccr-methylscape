import React, { useState, useEffect } from 'react';
import { Container, Button, Modal } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [userRole, setUserRole] = useState('User');

  useEffect(() => {
    axios.get('api/users').then((response) => {
      console.log(response.data);
      setUsers(response.data);
    });
  }, []);

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  const rejectUser = (cell) => {
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    axios.delete(`api/users/${id}`).then((res) => {
      const del = users.filter((user) => id !== user.id);
      setUsers(del);
      console.log(res);
    });
  };

  const hideApproveModal = () => setApproveModal(false);
  const showApproveModal = () => setApproveModal(true);

  const cols = [
    {
      Header: 'Name',
      accessor: 'firstName',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value} {e.row.original.lastName}
        </div>
      ),
    },
    { Header: 'Email', accessor: 'email' },
    {
      Header: 'Organization',
      accessor: 'organization',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value}
        </div>
      ),
    },
    {
      Header: 'Submitted Date',
      accessor: 'createdAt',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {formatDate(e.value)}
        </div>
      ),
    },

    {
      Header: 'Roles',
      accessor: 'rodeId',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value || 'NA'}
        </div>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: (row) => (
        <div className="d-flex text-center">
          <Button className="me-2" onClick={() => showApproveModal(row)}>
            Approve
          </Button>
          <Button variant="danger" onClick={() => rejectUser(row)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      {/* <h1 className="h4 mb-3 text-primary">Registered Users</h1> */}
      {alerts.map(({ type, message }, i) => (
        <Alert key={i} variant={type} onClose={() => setAlerts([])} dismissible>
          {message}
        </Alert>
      ))}
      <Table
        responsive
        data={users}
        columns={cols}
        options={{ disableFilters: true }}
      />
      <Modal show={approveModal} onHide={hideApproveModal}>
        <Modal.Header closeButton>
          <Modal.Title>Set User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="approveModalId">
              <Form.Label>User Role</Form.Label>
              <Form.Control
                as="select"
                value={userRole}
                onChange={(e) => {
                  console.log('e.target.value', e.target.value);
                  setUserRole(e.target.value);
                }}
              >
                <option value="role-user">User</option>
                <option value="role-LP">LP</option>
                <option value="role-admin">Admin</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={hideApproveModal}>
            Approve
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
