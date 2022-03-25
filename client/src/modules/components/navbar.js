import BootstrapNavbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { NavLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { sessionState } from '../session/session.state';

import './navbar.scss';

export default function Navbar({ linkGroups = [[]], className, children }) {
  const session = useRecoilValue(sessionState);

  console.log(session);

  const shouldShowLink = (link) => {
    console.log(link, session);
    if (session && link.show) {
      return link.show(session);
    }
    return true;
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" className={className}>
      <Container fluid>
        {children}
        {linkGroups.map((links) => (
          <Nav>
            {links?.filter(shouldShowLink).map((link) =>
              link.native ? (
                <a href={link.path} className="nav-link">
                  {link.title}
                </a>
              ) : (
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
              )
            )}
          </Nav>
        ))}
      </Container>
    </BootstrapNavbar>
  );
}
