import CurrentUsers from './current-users';
import RegisterUsers from './registered-users';
import { Container, Button, Tab, Tabs, Card } from 'react-bootstrap';

export default function AdminUserManagement() {
  return (
    <Container fluid="xxl" className="mb-3 rounded bg-white h-100">
      <Card>
        <Tabs
          defaultActiveKey="currentusers"
          id="admin-user-managemenr"
          transition={false}
          className=""
        >
          <Tab eventKey="currentusers" title="Current Users">
            {/* <CurrentUsers /> */}
          </Tab>
          <Tab eventKey="registeredusers" title="Registered Users">
            {/* <RegisterUsers /> */}
          </Tab>
        </Tabs>
      </Card>
    </Container>
  );
}
