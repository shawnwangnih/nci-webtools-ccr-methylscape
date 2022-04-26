import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import { groupBy } from 'lodash';

export default function CurrentUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState([]);

  useEffect(() => {
    axios.get('api/users').then((response) => {
      console.log(response.data);
      const statusGroup = groupBy(response.data, 'status');
      //setUsers(response.data);
      setActiveUsers(statusGroup['active']);
      setInactiveUsers(statusGroup['inactive']);
    });
  }, []);

  const hideEditModal = () => setEditModal(false);
  function showEditModal(cell) {
    setEditModal(true);
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    console.log('ID: ' + id);
    setEditUser({
      id: id,
      firstName: cell?.row?.original.firstName,
      lastName: cell?.row?.original.lastName,
      email: cell?.row?.original.email,
      organization: cell?.row?.original.organization,
      roleId: cell?.row?.original.roleId,
      status: cell?.row?.original.status,
    });
  }
  async function handleEditUserChange(e) {
    const { name, value } = e.target;
    setEditUser({
      ...editUser,
      [name]: value,
    });
  }
  function editUserSubmit(e) {
    e.preventDefault();
    editUser.roleId = parseInt(editUser.roleId);
    hideEditModal();
    axios.put(`api/users/${editUser.id}`, editUser).then((res) => {
      console.log(res);
    });
  }

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };
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
      Header: 'Account',
      accessor: 'accounttype',
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
      Header: 'Status',
      accessor: 'status',
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
      Header: 'Approved Data',
      accessor: 'arroveData',
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
      Header: 'Role',
      accessor: 'roleId',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value === 1 ? 'Admin' : e.value === 2 ? 'LP' : 'User'}
        </div>
      ),
    },

    {
      Header: 'Actions',
      id: 'actions',
      Cell: (row) => (
        <div className="d-flex">
          <Button
            variant="success"
            className="w-100"
            onClick={() => showEditModal(row)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      {/* <h1 className="h4 mb-3 text-primary">Current Users</h1> */}
      {activeUsers &&
        activeUsers.length > 0 && (
          <Table
            data={activeUsers}
            columns={cols}
            options={{ disableFilters: true }}
          />
        ) && (
          <Modal show={editModal} onHide={hideEditModal}>
            <Form onSubmit={editUserSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>Set User Role</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3" controlId="editUserRole">
                  <Form.Label>User Role</Form.Label>
                  <Form.Select
                    name="roleId"
                    value={activeUsers.roleId}
                    onChange={handleEditUserChange}
                  >
                    <option value="1">User</option>
                    <option value="2">LP</option>
                    <option value="3">Admin</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="editUserStatus">
                  <Form.Label>Enable/ Disable Account</Form.Label>
                  <Form.Select
                    name="status"
                    value={activeUsers.staus}
                    onChange={handleEditUserChange}
                  >
                    <option value="active">Enable Account</option>
                    <option value="inactive">Disable account</option>
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
        )}
    </div>
  );
}
