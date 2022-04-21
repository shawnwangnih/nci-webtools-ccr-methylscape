import React from 'react';
import { Container, Button } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';

export default function CurrentUsers() {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    console.log('TEST');
    axios.get('api/users').then((response) => {
      console.log(response.data);
      setUsers(response.data);
    });
  }, []);

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };
  const cols = [
    {
      Header: 'Name',
      accessor: 'firstName',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value} {e.row.original.lastName}
        </div>
      ),
    },
    { Header: 'Email', accessor: 'email' },
    {
      Header: 'Organization',
      accessor: 'organization',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value}
        </div>
      ),
    },
    {
      Header: 'Submitted Date',
      accessor: 'createdAt',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {formatDate(e.value)}
        </div>
      ),
    },
    {
      Header: 'Roles',
      accessor: 'rodeId',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {e.value || 'NA'}
        </div>
      ),
    },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: () => (
        <div className="d-flex">
          <Button variant="danger">Remove</Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      {/* <h1 className="h4 mb-3 text-primary">Current Users</h1> */}
      <Table data={users} columns={cols} options={{ disableFilters: true }} />
    </div>
  );
}
