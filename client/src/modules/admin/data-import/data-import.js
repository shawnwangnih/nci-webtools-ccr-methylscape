import axios from 'axios';
import { useState } from 'react';
import {
  Container,
  Button,
  Modal,
  SplitButton,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import {
  useRecoilValue,
  useRecoilRefresher_UNSTABLE as useRecoilRefresher,
} from 'recoil';
import { importLogSelector } from './data-import.state';
import Table from '../../components/table';

export default function DataImport() {
  const [modal, setModal] = useState({
    show: false,
    title: '',
    body: '',
  });

  const data = useRecoilValue(importLogSelector);
  const refreshData = useRecoilRefresher(importLogSelector);

  const columns = [
    { Header: 'Date', accessor: 'createdAt' },
    { Header: 'Status', accessor: 'status' },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: ({ row }) => (
        <>
          <div>
            <Button
              size="sm"
              className="me-2"
              onClick={(ev) => viewImportLog(row.original)}
            >
              View Logs
            </Button>
          </div>
        </>
      ),
    },
  ];

  async function closeModal() {
    setModal({ ...modal, show: false });
  }

  async function runImport(forceRecreate = false) {
    try {
      await axios.post('/api/admin/importData', { forceRecreate });
      refreshData();
      setModal({
        show: 'true',
        title: `Import Requested`,
        body: `Your request to import data has been submitted. Once complete, import status will be displayed on this page.`,
      });
    } catch (e) {
      console.error(e);
      setModal({
        show: 'true',
        title: `Import Failed`,
        body: `Your request to import data could not be submitted. Please contact support if this issue persists.`,
      });
    }
  }

  async function viewImportLog(importLog) {
    setModal({
      show: 'true',
      title: `Import Log`,
      body: (
        <pre style={{ height: '300px' }}>
          {importLog.log || 'No log entries available'}
        </pre>
      ),
    });
  }

  return (
    <>
      <Container className="my-4 p-3 rounded bg-white">
        <h1 className="h4 mb-3 text-primary d-flex justify-content-between">
          Data Import
          <DropdownButton id="import-type-selector" title="Run Import">
            <Dropdown.Item onClick={() => runImport()}>
              Progressive Import
            </Dropdown.Item>
            <Dropdown.Item onClick={() => runImport(true)}>
              Full Import
            </Dropdown.Item>
          </DropdownButton>
        </h1>
        <Table
          data={data}
          columns={columns}
          options={{ disableFilters: true }}
        />
      </Container>

      <Modal show={modal.show} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modal.body}</Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
