import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import { groupBy } from 'lodash';

export default function CurrentUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);

  useEffect(() => {
    axios.get('api/users').then((response) => {
      console.log(response.data);
      const statusGroup = groupBy(response.data, 'status');
      //setUsers(response.data);
      setActiveUsers(statusGroup['active']);
      setInactiveUsers(statusGroup['inactive']);
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
      Header: 'Status',
      accessor: 'status',
    },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: () => (
        <div className="d-flex">
          <Button variant="success" className="w-100">
            Edit
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      {/* <h1 className="h4 mb-3 text-primary">Current Users</h1> */}
      <Table
        data={activeUsers}
        columns={cols}
        options={{ disableFilters: true }}
      />
      <Table
        data={inactiveUsers}
        columns={cols}
        options={{ disableFilters: true }}
      />
    </div>
  );
}
