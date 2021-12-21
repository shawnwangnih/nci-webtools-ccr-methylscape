import { Container, Button } from "react-bootstrap";
import Table from "../table";

export default function Admin() {
  const users = [
    { name: "First Last", email: "first.last@email.com", roles: "Admin" },
    { name: "First Last", email: "first.last@email.com", roles: "User" },
    {
      name: "First Last",
      email: "first.last@email.com",
      roles: "External User",
    },
  ];
  const cols = [
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Roles", accessor: "roles" },
    {
      Header: "Actions",
      id: "actions",
      Cell: () => (
        <div className="d-flex">
          <Button className="me-2">Edit</Button>
          <Button variant="danger">Remove</Button>
        </div>
      ),
    },
  ];
  return (
    <Container fluid="xxl">
      <Table data={users} columns={cols} options={{ disableFilters: true }} />
    </Container>
  );
}
