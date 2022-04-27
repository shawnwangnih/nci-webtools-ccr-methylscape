import React, { useState, useEffect } from 'react';
import { Container, Button, Modal } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import { groupBy } from 'lodash';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import { rolesSelector, usersSelector } from './user-management.state';
import { ConeStriped } from 'react-bootstrap-icons';

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const users = useRecoilValue(usersSelector);
  const roles = useRecoilValue(rolesSelector);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState({});
  const [rejectionForm, setRejectionForm] = useState({});
  const refreshUsers = useRecoilRefresher_UNSTABLE(usersSelector);
  const userGroups = groupBy(users, 'status');
  const pendingUsers = userGroups['pending'] || [];

  async function rejectUser({ row }) {
    const { id } = row.original;
    await axios.delete(`api/users/${id}`);
    refreshUsers();
  }

  function openApprovalModal({ row }) {
    const { id } = row.original;
    const user = { id, status: 'active' };
    setShowApprovalModal(true);
    setApprovalForm(user);
  }

  function openRejectionModal({ row }) {
    const { id } = row.original;
    const user = { id };
    setShowRejectionModal(true);
    setRejectionForm(user);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;

    setApprovalForm((form) => ({ ...form, [name]: value }));
  }

  function handleRejectionFormChange(e) {
    const { name, value } = e.target;
    setRejectionForm((form) => ({ ...form, [name]: value }));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setShowApprovalModal(false);
    await axios.put(`api/users/${approvalForm.id}`, approvalForm);
    refreshUsers();
  }

  async function handleRejectionFormSubmit(e) {
    e.preventDefault();
    setShowRejectionModal(false);
    await axios.delete(`api/users/${rejectionForm.id}`);
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
          {e.value} {e.row.original.lastName}
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
      Header: 'Submitted Date',
      accessor: 'createdAt',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {new Date(e.value).toLocaleDateString()}
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
          <Button className="me-2" onClick={() => openApprovalModal({ row })}>
            Approve
          </Button>

          <Button variant="danger" onClick={() => openRejectionModal({ row })}>
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

      {pendingUsers && pendingUsers.length > 0 ? (
        <Table
          responsive
          data={pendingUsers}
          columns={cols}
          options={{ disableFilters: true }}
        />
      ) : (
        <div className="text-center py-5 text-primary">
          <h3>No pending users</h3>
        </div>
      )}

      <Modal
        show={showApprovalModal}
        onHide={() => setShowApprovalModal(false)}
      >
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Set User Role</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="approveModalId">
              <Form.Label>User Role</Form.Label>
              <Form.Select
                name="roleId"
                value={approvalForm.roleId || ''}
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" className="btn-lg">
              Approve
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showRejectionModal}
        onHide={() => setShowRejectionModal(false)}
      >
        <Form onSubmit={handleRejectionFormSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Reject User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                name="comments"
                value={rejectionForm.comments || ''}
                onChange={handleRejectionFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" className="btn-lg">
              Reject
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
