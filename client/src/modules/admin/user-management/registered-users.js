import React, { useState, useEffect } from 'react';
import { Container, Button, Modal } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import { groupBy } from 'lodash';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import { rolesSelector, usersSelector } from './user-management.state';

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const users = useRecoilValue(usersSelector);
  const roles = useRecoilValue(rolesSelector);
  const [approveModal, setApproveModal] = useState(false);
  const [userRoleId, setUserRoleId] = useState();
  const [approveUser, setApproveUser] = useState({});
  const refreshUsers = useRecoilRefresher_UNSTABLE(usersSelector);

  const userGroups = groupBy(users, 'status');
  const pendingUsers = userGroups['pending'] || [];

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  async function rejectUser(cell) {
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    await axios.delete(`api/users/${id}`);
    refreshUsers();
  }

  const hideApproveModal = () => setApproveModal(false);

  function showApproveModal(cell) {
    setApproveModal(true);
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    console.log('ID: ' + id);
    setApproveUser({ id, status: 'active' });
  }

  async function handleRoleChange(e) {
    const { name, value } = e.target;
    setApproveUser({
      ...approveUser,
      [name]: parseInt(value),
    });
  }
  
  async function approveUserSubmit(e) {
    e.preventDefault();
    console.log(approveUser);
    hideApproveModal();
    await axios.put(`api/users/${approveUser.id}`, approveUser);
    refreshUsers();
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
          {e.value}, {e.row.original.lastName}
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
      accessor: e => ({name: e.organizationName, other: e.organizationOther}),
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value.name} {e.value.other && `(${e.value.other})`}
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
      Header: 'Role',
      accessor: 'roleName',
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
      <Table
        responsive
        data={pendingUsers}
        columns={cols}
        options={{ disableFilters: true }}
      />
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
                value={userRoleId}
                onChange={handleRoleChange}
                required
              >
                <option value="" hidden>Select Role</option>
                {roles.map(r => (
                  <option key={r.id}>{r.description} ({r.name})</option>
                ))}
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
