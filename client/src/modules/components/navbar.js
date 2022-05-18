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
  return <NavLink to={path} className={({ isActive }) => classNames('nav-link px-4', isActive && 'active')} end={exact}>
    {title}
  </NavLink>
}

export function NavbarDropdown({title, childLinks, align = 'start'}) {
  return <NavDropdown title={title} id={title} align={align}>
    {childLinks.map(link => (
      <NavDropdown.Item key={`navbar-dropdown-${link.path}`} href={link.native ? link.path : `#${link.path}`}>{link.title}</NavDropdown.Item>
    ))}
  </NavDropdown>
}

export default function Navbar({ linkGroups = [[]], className, children }) {
  const session = useRecoilValue(sessionState);

  function shouldShowLink(link) {
    return (session && link.show) ? link.show(session) : true;
  }

  return (
    <BootstrapNavbar bg="dark" variant="dark" className={className}>
      <Container fluid className="justify-content-strech">
        <Nav></Nav>
        {children}
        {linkGroups.map((links, index) => (
          <Nav key={`navbar-nav-${index}`}>
            {links?.filter(shouldShowLink).map((link, linkIndex) => 
              <>
              {link.childLinks && <NavbarDropdown key={`navbar-nav-dropdown-${index}-${linkIndex}`} {...link} />}
              {!link.childLinks && (
                link.native 
                  ? <NavbarNativeLink key={`navbar-nav-native-link-${index}-${linkIndex}`} {...link}/> 
                  : <NavbarRouterLink key={`navbar-nav-link-${index}-${linkIndex}`} {...link}/>
              )}
              </>
            )}
          </Nav>
        ))}
      </Container>
    </BootstrapNavbar>
  );
}
