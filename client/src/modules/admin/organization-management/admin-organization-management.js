import { remove } from 'lodash';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Row,
  Modal,
  Form,
  FormControl,
} from 'react-bootstrap';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import Table from '../../components/table';
import { organizationsSelector } from './organization-management.state';
import axios from 'axios';

export default function AdminOrganizationManagement() {
  const organizations = useRecoilValue(organizationsSelector);
  const [form, setForm] = useState([]);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showRenameOrgModal, setShowRenameOrgModal] = useState(false);

  const [editableRowIndex, setEditableRowIndex] = React.useState(null);

  const refreshOrgs = useRecoilRefresher_UNSTABLE(organizationsSelector);

  async function openAddOrgModal() {
    setShowAddOrgModal(true);
  }

  async function openRenameOrgModal(cell) {
    setShowRenameOrgModal(true);
    setForm(cell?.row?.original);
    const { id, name } = cell?.row?.original;
  }

  async function addOrganizationChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
    console.log(form);
  }

  async function renameOrganizationChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
    console.log(form);
  }

  async function handleRemoveOrgChange(cell) {
    const { id, name } = cell?.row?.original;
    console.log(id);
    console.log(name);

    //await axios.delete(`api/organizations/${id}`);
    //refreshOrgs();
  }

  async function handleAddOrgSubmit(e) {
    e.preventDefault();

    const response = await axios.post('api/organizations', { name: form.name });
    const id = response.data[0].id;
    console.log(id);
    console.log(form);
    setShowAddOrgModal(false);
    refreshOrgs();
  }

  function handleRenameSubmit(e) {
    e.preventDefault();
    console.log('rename');
    console.log(form);
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
      Cell: ({ row, setEditableRowIndex, editableRowIndex }) => (
        // <div>
        //   <Button className="me-2" onClick={() => openRenameOrgModal({ row })}>
        //     Rename
        //   </Button>
        //   <Button
        //     className="btn-danger me-2"
        //     onClick={(e) => handleRemoveOrgChange({ row })}
        //   >
        //     Remove
        //   </Button>
        // </div>
        <div>
          <Button className="me-2" onClick={() => openRenameOrgModal({ row })}>
            Edit
          </Button>
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
          <Form className="bg-light p-3" onSubmit={handleAddOrgSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Organization/ Instituiton</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form.Group className="mb-3" controlId="organizationName">
                <Form.Label>Organization Name</Form.Label>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Add Organization Name"
                  maxLength={255}
                  //value={form.name}
                  onChange={addOrganizationChange}
                  required
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal
          show={showRenameOrgModal}
          onHide={() => setShowRenameOrgModal(false)}
        >
          <Form className="bg-light p-3" onSubmit={handleRenameSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Rename Organization</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form.Group className="mb-3" controlId="organizationName">
                <Form.Label>Current Organization Name</Form.Label>
                <span>{form.name} </span>
              </Form.Group>
              <Form.Group className="mb-3" controlId="organizationName">
                <Form.Label>New Organization Name</Form.Label>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Organization Name"
                  maxLength={255}
                  value={form.name}
                  onChange={renameOrganizationChange}
                  required
                />

                {/* <Form.Select
                  name="organizationId"
                  value={form.organizationId}
                  onChange={renameOrganizationChange}
                  required
                >
                  <option value="" hidden>
                    Select Organization/Instituiton
                  </option>
                  {organizations.map((o) => (
                    <option key={`organization-${o.name}`} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </Form.Select>
                {+form.organizationId === 1 && (
                  <Form.Control
                    type="text"
                    name="organizationOther"
                    placeholder="Enter Organization/Instituiton"
                    value={form.organizationOther}
                    onChange={renameOrganizationChange}
                    required
                    className="mt-2"
                  />
                )} */}
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
}
