import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { sessionState } from './modules/session/session.state';
import Alert from 'react-bootstrap/Alert';
import Loader from './modules/components/loader';
import Navbar from './modules/components/navbar';
import Data from './modules/data/data';
import About from './modules/about/about';
import Home from './modules/home/home';
import Analysis from './modules/analysis/analysis';
import MetadataSA from './modules/metadataStandalone/metadataSA';
import Projects from './modules/data/projects/projects';
import Experiments from './modules/data/experiments/experiments';
import Samples from './modules/data/samples/samples';
import QCI from './modules/qciReport/qci';
import Admin from './modules/admin/admin';
import DataImport from './modules/admin/data-import/data-import';
import AdminUserManagement from './modules/admin/user-management/admin-user-management';
import AdminOrganizationManagement from './modules/admin/organization-management/admin-organization-management';
import Session from './modules/session/session';
import ErrorBoundary from './modules/components/error-boundary';
import Header from './header';
import UserRegister from './modules/user/userRegister';
import RequirePolicy from './modules/require-policy/require-policy';
import { isAuthorized } from './modules/require-policy/require-policy.utils';

export default function App() {

  const navbarLinks = [
    [
      { path: '/', title: 'Home', exact: true },
      {
        path: 'analysis',
        title: 'Analysis',
        show: (session) => isAuthorized(session, 'GetPage', '/analysis'),
      },
      //{ path: 'data/projects', title: 'Projects', show: (session) => session.authenticated  },
      // { path: 'data/experiments', title: 'Experiments', show: (session) => session.authenticated  },
      {
        path: 'data/samples',
        title: 'Samples',
        show: (session) => isAuthorized(session, 'GetPage', '/data'),
      },
      { path: 'about', title: 'About' },
    ],
    [
      {
        path: 'admin',
        title: 'Admin',
        show: (session) => isAuthorized(session, 'GetPage', '/admin'),
        // childLinks: [
        //   {
        //     //path: '/admin/admin-user-management',
        //     path: 'admin',
        //     title: 'Manage Users',
        //     show: (session) => !session.authenticated,
        //   },
        //   {
        //     path: '/#/admin/admin-organization-management',
        //     title: 'Manage Oraganization',
        //     native: true,
        //     show: (session) => !session.authenticated,
        //   },
        // ],
      },
      {
        path: '/api/logout',
        title: 'Logout',
        native: true,
        show: (session) => session.authenticated,
      },
      {
        title: 'Register',
        show: (session) => !session.authenticated,
        align: 'end',
        path: 'register',
      },
      {
        title: 'Login',
        show: (session) => !session.authenticated,
        align: 'end',
        childLinks: [
          {
            path: '/api/login',
            title: 'NIH Users',
            native: true,
            show: (session) => !session.authenticated,
          },
          {
            path: '/api/login/external',
            title: 'External Users',
            native: true,
            show: (session) => !session.authenticated,
          },
        ],
      },
    ],
  ];

  return (
    <RecoilRoot>
      <Router>
        <Session>
          <Header />

          <Navbar
            linkGroups={navbarLinks}
            className="shadow-sm navbar-bottom-line"
          />
          <ErrorBoundary
            fallback={
              <Alert variant="danger" className="m-5">
                An internal error prevented this page from loading. Please
                contact the website administrator if this problem persists.
              </Alert>
            }
          >
            <Suspense fallback={<Loader message="Loading Page" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="register/*" element={<UserRegister />} />
                <Route path="analysis" element={<RequirePolicy action="GetPage"><Analysis /></RequirePolicy>} />
                <Route path="metadata" element={<RequirePolicy action="GetPage"><MetadataSA /></RequirePolicy>} />
                <Route path="data" element={<RequirePolicy action="GetPage"><Data /></RequirePolicy>}>
                  <Route path="projects" element={<RequirePolicy action="GetPage"><Projects /></RequirePolicy>} />
                  <Route path="experiments" element={<RequirePolicy action="GetPage"><Experiments /></RequirePolicy>} />
                  <Route path="samples" element={<RequirePolicy action="GetPage"><Samples /></RequirePolicy>} />
                </Route>
                <Route path="about/*" element={<About />} />
                <Route path="qci/*" element={<RequirePolicy action="GetPage"><QCI /></RequirePolicy>} />
                <Route path="admin" element={<RequirePolicy action="GetPage"><Admin /></RequirePolicy>} />
                <Route
                  path="admin/admin-user-management"
                  element={<RequirePolicy action="GetPage"><AdminUserManagement /></RequirePolicy>}
                />
                <Route
                  path="/admin/admin-organization-management"
                  element={<RequirePolicy action="GetPage"><AdminOrganizationManagement /></RequirePolicy>}
                />
                <Route path="admin/data-import" element={<RequirePolicy action="GetPage"><DataImport /></RequirePolicy>} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Session>
      </Router>
    </RecoilRoot>
  );
}
