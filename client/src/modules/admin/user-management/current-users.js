import { Container, Button } from 'react-bootstrap';
import Table from '../../components/table';

export default function CurrentUsers() {
  const users = [
    {
      name: 'First Last',
      type: 'NIH or Login.gov',
      email: 'first.last@email.com',
      organization: 'NCI',
      submitteddate: '2020/02/02',
      roles: 'Admin',
    },
    {
      name: 'First Last',
      type: 'NIH or Login.gov',
      email: 'first.last@email.com',
      organization: 'NCI',
      submitteddate: '2020/02/02',
      roles: 'User',
    },
    {
      name: 'First Last',
      type: 'NIH or Login.gov',
      email: 'first.last@email.com',
      organization: 'NCI',
      submitteddate: '2020/02/02',
      roles: 'External User',
    },
  ];
  const cols = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Organization', accessor: 'organization' },
    { Header: 'Submitted Date', accessor: 'submitteddate' },
    { Header: 'Roles', accessor: 'roles' },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: () => (
        <div className="d-flex">
          <Button className="me-2">Approve</Button>
          <Button variant="danger">Reject</Button>
        </div>
      ),
    },
  ];
  return (
    <Container fluid="xxl" className="my-4 p-3 rounded bg-white">
      <h1 className="h4 mb-3 text-primary">Current Users</h1>
      <Table data={users} columns={cols} options={{ disableFilters: true }} />
    </Container>
  );
}
