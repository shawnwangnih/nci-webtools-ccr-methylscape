import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import Table from '../../components/table';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('api/users').then((response) => {
      console.log(response.data);
      setUsers(response.data);
    });
  }, []);

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  const rejectUser = (cell) => {
    console.log(cell?.row?.original);
    let id = cell?.row?.original.id;
    axios.delete(`api/users/${id}`).then((res) => {
      const del = users.filter((user) => id !== user.id);
      setUsers(del);
    });
  };

  const cols = [
    // {
    //   Header: 'User ID',
    //   accessor: 'id',
    //   show: false,
    // },
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
      Cell: (row) => (
        <div className="d-flex text-center">
          <Button className="me-2">Approve</Button>
          <Button variant="danger" onClick={() => rejectUser(row)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      {/* <h1 className="h4 mb-3 text-primary">Registered Users</h1> */}
      {alerts.map(({ type, message }, i) => (
        <Alert key={i} variant={type} onClose={() => setAlerts([])} dismissible>
          {message}
        </Alert>
      ))}
      <Table
        responsive
        data={users}
        columns={cols}
        options={{ disableFilters: true }}
      />
    </div>
  );
}
