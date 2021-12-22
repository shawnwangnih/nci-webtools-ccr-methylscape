import BootstrapNavbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { NavLink } from 'react-router-dom';

export default function Navbar({ links = [], className, children }) {
  return (
    <BootstrapNavbar bg="white" variant="light" className={className}>
      <Container fluid>
        {children}
        <Nav className="me-auto">
          {links?.map((link) => (
            <NavLink
              to={link.path}
              key={link.path}
              className={({ isActive }) =>
                'nav-link' + (isActive ? ' active' : '')
              }
              end={link.exact}
            >
              {link.title}
            </NavLink>
          ))}
        </Nav>
        <Nav className="ms-auto">
          <NavLink
            to={'admin'}
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' active' : '')
            }
          >
            Admin
          </NavLink>
          <Button variant="link">Login</Button>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}
