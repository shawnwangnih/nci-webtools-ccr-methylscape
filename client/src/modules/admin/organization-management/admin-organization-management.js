import { Container, Tab, Tabs } from 'react-bootstrap';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import Table from '../../components/table';
import { organizationsSelector } from './organization-management.state';

export default function AdminOrganizationManagement() {
  const organizations = useRecoilValue(organizationsSelector);

  return (
    <>
      <Container fluid="xxl" className="my-3 text-white rounded h-100">
        <h1 className="mb-1 h2">Admin Organization Management</h1>
        <div className="bg-white text-primary">
          <ul>
            {organizations.map((o) => (
              <li key={`organization-${o.name}`} value={o.id}>
                {o.name}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
