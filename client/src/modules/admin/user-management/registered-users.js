import React, { useState, useEffect } from 'react';
import { Container, Button, Modal } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import { groupBy } from 'lodash';

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [userRole, setUserRole] = useState();
  const [approveUser, setApproveUser] = useState([]);

  useEffect(() => {
    axios.get('api/users').then((response) => {
      console.log(response.data);

      const statusGroup = groupBy(response.data, 'status');
      console.log(statusGroup);
      console.log(statusGroup['pending']);
      //setUsers(response.data);
      setPendingUsers(statusGroup['pending']);
    });
  }, []);

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  function rejectUser(cell) {
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    axios.delete(`api/users/${id}`).then((res) => {
      const del = pendingUsers.filter((user) => id !== user.id);
      setPendingUsers(del);
      console.log(res);
    });
  }

  const hideApproveModal = () => setApproveModal(false);
  function showApproveModal(cell) {
    setApproveModal(true);
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    console.log('ID: ' + id);
    setApproveUser({
      id: id,
      firstName: cell?.row?.original.firstName,
      lastName: cell?.row?.original.lastName,
      email: cell?.row?.original.email,
      organization: cell?.row?.original.organization,
      roleId: cell?.row?.original.roleId,
      status: 'active',
    });
  }

  async function handleRoleChange(e) {
    const { name, value } = e.target;
    setApproveUser({
      ...approveUser,
      [name]: parseInt(value),
    });
  }
  function approveUserSubmit(e) {
    e.preventDefault();
    console.log(approveUser);
    hideApproveModal();
    axios.put(`api/users/${approveUser.id}`, approveUser).then((res) => {
      const del = pendingUsers.filter((user) => approveUser.id !== user.id);
      setPendingUsers(del);
      console.log(res);
    });
  }
  const cols = [
    {
      Header: 'Name',
      accessor: 'firstName',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value} {e.row.original.lastName}
        </div>
      ),
    },
    {
      Header: 'Email',
      accessor: 'email',
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
      Header: 'Actions',
      id: 'actions',
      Cell: (row) => (
        <div className="text-center">
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

      {pendingUsers && pendingUsers.length > 0 && (
        <Table
          responsive
          data={pendingUsers}
          columns={cols}
          options={{ disableFilters: true }}
        />
      )}
      <Modal show={approveModal} onHide={hideApproveModal}>
        <Form onSubmit={approveUserSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Set User Role</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="approveModalId">
              <Form.Label>User Role</Form.Label>
              <Form.Select
                name="roleId"
                value={userRole}
                onChange={handleRoleChange}
              >
                <option value="0">Select Role</option>
                <option value="1">User</option>
                <option value="2">LP</option>
                <option value="3">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" className="btn-lg">
              Approve
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
