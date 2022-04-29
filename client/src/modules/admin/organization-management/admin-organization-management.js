import { Container, Tab, Tabs } from 'react-bootstrap';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import { groupBy } from 'lodash';
import axios from 'axios';
import { organizationsSelector } from './organization-management.state';

export default function AdminOrganizationManagement() {
  const organizations = useRecoilValue(organizationsSelector);

  return (
    <>
      <Container fluid="xxl" className="my-3 text-white rounded h-100">
        <h1 className="mb-1 h2">Admin Organization Management</h1>
        <div className="bg-white"></div>
      </Container>
    </>
  );
}
