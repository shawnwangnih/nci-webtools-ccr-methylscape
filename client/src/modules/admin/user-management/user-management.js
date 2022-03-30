import { Container, Button } from 'react-bootstrap';
import Table from '../../components/table';

export default function UserManagement() {
  const users = [
    { name: 'First Last', email: 'first.last@email.com', roles: 'Admin' },
    { name: 'First Last', email: 'first.last@email.com', roles: 'User' },
    {
      name: 'First Last',
      email: 'first.last@email.com',
      roles: 'External User',
    },
  ];
  const cols = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Roles', accessor: 'roles' },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: () => (
        <div className="d-flex">
          <Button className="me-2">Edit</Button>
          <Button variant="danger">Remove</Button>
        </div>
      ),
    },
  ];
  return (
    <Container fluid="xxl" className="my-4 p-3 rounded bg-white">
       <h1 className="h4 mb-3 text-primary">User Management</h1>
      <Table data={users} columns={cols} options={{ disableFilters: true }} />
    </Container>
  );
}
