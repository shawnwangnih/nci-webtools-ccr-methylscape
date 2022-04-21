import React from 'react';
import { Container, Button } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import { useRecoilValue } from 'recoil';

export default function RegisterUsers() {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    console.log('TEST');
    axios.get('api/users').then((response) => {
      console.log(response.data);
      setUsers(response.data);
    });
  }, []);

  //   const users = [
  //     {
  //       name: 'First Last',
  //       type: 'NIH or Login.gov',
  //       email: 'first.last@email.com',
  //       organization: 'NCI',
  //       submitteddate: '2020/02/02',
  //       roles: 'Admin',
  //     },
  //     {
  //       name: 'First Last',
  //       type: 'NIH or Login.gov',
  //       email: 'first.last@email.com',
  //       organization: 'NCI',
  //       submitteddate: '2020/02/02',
  //       roles: 'User',
  //     },
  //     {
  //       name: 'First Last',
  //       type: 'NIH or Login.gov',
  //       email: 'first.last@email.com',
  //       organization: 'NCI',
  //       submitteddate: '2020/02/02',
  //       roles: 'External User',
  //     },
  //   ];
  const cols = [
    {
      Header: 'Name',
      accessor: 'firstName',
      Cell: (e) => (
        <>
          {e.value} {e.row.original.lastName}
        </>
      ),
    },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Organization', accessor: 'organization' },
    { Header: 'Submitted Date', accessor: 'createdAt' },
    { Header: 'Roles', accessor: 'rodeId', Cell: (e) => e.value || 'NA' },
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
    <div>
      {/* <h1 className="h4 mb-3 text-primary">Registered Users</h1> */}
      <Table data={users} columns={cols} options={{ disableFilters: true }} />
    </div>
  );
}
