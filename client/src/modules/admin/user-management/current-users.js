import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import { groupBy } from 'lodash';
import axios from 'axios';
import Table from '../../components/table';
import { rolesSelector, usersSelector } from './user-management.state';

export default function CurrentUsers() {
  const [alerts, setAlerts] = useState([]);
  const roles = useRecoilValue(rolesSelector);
  const users = useRecoilValue(usersSelector);
  const refreshUsers = useRecoilRefresher_UNSTABLE(usersSelector);
  const [showInactiveUsers, setShowInactiveUsers] = useState(true);
  const [form, setForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  const userGroups = groupBy(users, 'status');
  const activeUsers = userGroups['active'] || [];
  const inactiveUsers = userGroups['inactive'] || [];
  const visibleUsers = [
    ...activeUsers,
    ...(showInactiveUsers ? [] : inactiveUsers),
  ];

  async function openEditModal({ row }) {
    setShowEditModal(true);
    setForm(row.original);
  }

  async function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setShowEditModal(false);
    await axios.put(`api/users/${form.id}`, form);
    refreshUsers();
  }

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
          {e.value}, {e.row.original.lastName}
        </div>
      ),
    },
    {
      Header: 'Account',
      accessor: 'accountType',
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
      accessor: (e) => ({
        name: e.organizationName,
        other: e.organizationOther,
      }),
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
      Cell: ({ row }) => (
        <div className="text-center">
          <Button className="me-2" onClick={() => openEditModal({ row })}>
            Edit
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
      <Form className="text-primary d-flex justify-content-center">
        <Form.Check type="checkbox" id="show-inactive-user">
          <Form.Check.Input
            type="checkbox"
            checked={showInactiveUsers}
            onChange={(ev) => setShowInactiveUsers(ev.target.checked)}
          />
          <Form.Check.Label>Show Active Users Only</Form.Check.Label>
        </Form.Check>
      </Form>
      <Table
        responsive
        data={visibleUsers}
        columns={cols}
        options={{ disableFilters: true }}
      />
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="approveModalId">
              <Form.Label>User Role</Form.Label>
              <Form.Select
                name="roleId"
                value={form.roleId}
                onChange={handleFormChange}
                required
              >
                <option value="" hidden>
                  Select Role
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.description} ({r.name})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="editUserStatus">
              <Form.Label>Enable/ Disable Account</Form.Label>
              <Form.Select
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                <option value="" hidden>
                  Select Status
                </option>
                <option value="active">Enable Account</option>
                <option value="inactive">Disable account</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" className="btn-lg">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
