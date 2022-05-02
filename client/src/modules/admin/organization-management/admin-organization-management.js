import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Modal, Form, Alerta } from 'react-bootstrap';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import Table from '../../components/table';
import { organizationsSelector } from './organization-management.state';

export default function AdminOrganizationManagement() {
  const organizations = useRecoilValue(organizationsSelector);
  const [form, setForm] = useState({});
  const [removeForm, setRemoveForm] = useState({});
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);

  const refreshOrgs = useRecoilRefresher_UNSTABLE(organizationsSelector);

  async function openAddOrgModal() {
    setShowAddOrgModal(true);
  }

  async function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setShowAddOrgModal(false);
    //await axios.put(`api/users/${form.id}`, form);
    refreshOrgs();
  }

  const cols = [
    {
      Header: 'Active Organizations',
      accessor: 'name',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
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
        <div>
          <Button className="me-2">Rename</Button>
          <Button className="btn-danger me-2">Remove</Button>
        </div>
      ),
    },
  ];
  return (
    <>
      <Container fluid="xxl" className="my-3 text-white rounded h-100">
        <Row>
          <div class="col-sm-10 col-xs-12 col-12">
            <h1 className="h2">Admin Oraganization Management</h1>
          </div>
          <div class="col-sm-2 col-xs-12 col-12 mb-2">
            <Button
              className="btn btn-success pull-right"
              onClick={(e) => openAddOrgModal()}
            >
              Add Organization
            </Button>
          </div>
        </Row>
        <div className="bg-white text-primary">
          <Table
            responsive
            data={organizations}
            columns={cols}
            options={{ disableFilters: true }}
          />

          {/* <ul>
            {organizations.map((o) => (
              <li key={`organization-${o.name}`} value={o.id}>
                {o.name}
              </li>
            ))}
          </ul> */}
        </div>
        <Modal show={showAddOrgModal} onHide={() => setShowAddOrgModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Organization/ Instituiton</Modal.Title>
          </Modal.Header>
          <Modal.Body></Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" className="btn-lg">
              Add
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
