import BootstrapNavbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import classNames from 'classnames';
import { sessionState } from '../session/session.state';


export function NavbarNativeLink({path, title}) {
  return <a href={path} className="nav-link">{title}</a>
}

export function NavbarRouterLink({path, title, exact}) {
  return <NavLink to={path} className={({ isActive }) => classNames('nav-link', isActive && 'active')} end={exact}>
    {title}
  </NavLink>
}

export function NavbarDropdown({title, childLinks, align = 'start'}) {
  return <NavDropdown title={title} id={title} align={align}>
    {childLinks.map(link => (
      <NavDropdown.Item href={link.path}>
        {link.title}
      </NavDropdown.Item>
    ))}
  </NavDropdown>
}

export default function Navbar({ linkGroups = [[]], className, children }) {
  const session = useRecoilValue(sessionState);

  function shouldShowLink(link) {
    return (session && link.show) ? link.show(session) : true;
  }

  return (
    <BootstrapNavbar bg="white" variant="light" className={className}>
      <Container>
        {children}
        {linkGroups.map(links => (
          <Nav>
            {links?.filter(shouldShowLink).map((link) => 
              <>
              {link.childLinks && <NavbarDropdown {...link} />}
              {!link.childLinks && (
                link.native ? <NavbarNativeLink {...link} /> : <NavbarRouterLink {...link} />
              )}
              </>
            )}
          </Nav>
        ))}
      </Container>
    </BootstrapNavbar>
  );
}
