import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Loader from './modules/components/loader';
import Navbar from './modules/components/navbar';
import Data from './modules/data/data';
import About from './modules/about/about';
import Home from './modules/home/home';
import Analysis from './modules/analysis/analysis';
import Projects from './modules/data/projects/projects';
import Experiments from './modules/data/experiments/experiments';
import Samples from './modules/data/samples/samples';
import QCI from './modules/qciReport/qci';
import Admin from './modules/admin/admin';
import DataImport from './modules/admin/data-import/data-import';
import UserManagement from './modules/admin/user-management/user-management';
import Session from './modules/session/session';
import ErrorBoundary from './modules/components/error-boundary';
import Header from './header';

export default function App() {
  const navbarLinks = [
    [
      { path: '/', title: 'Home', exact: true },
      {
        path: 'analysis',
        title: 'Analysis',
        show: (session) => session.authenticated,
      },
      //{ path: 'data/projects', title: 'Projects', show: (session) => session.authenticated  },
      // { path: 'data/experiments', title: 'Experiments', show: (session) => session.authenticated  },
      {
        path: 'data/samples',
        title: 'Samples',
        show: (session) => session.authenticated,
      },
      { path: 'about', title: 'About' },
    ],
    [
      { path: 'admin', title: 'Admin', show: (session) => session.authenticated },
      { path: '/api/logout', title: 'Logout', native: true, show: (session) => session.authenticated },
      { title: 'Login', show: (session) => !session.authenticated, align: 'end', childLinks: [
        { path: '/api/login', title: 'NIH Users', native: true, show: (session) => !session.authenticated },
        { path: '/api/login/external', title: 'External Users', native: true, show: (session) => !session.authenticated },
      ]}
    ]
  ];

  return (
    <RecoilRoot>
      <Router>
        <Session>
          <Header />
          <Navbar linkGroups={navbarLinks} className="shadow-sm" />
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
                <Route path="analysis" element={<Analysis />} />
                <Route path="data" element={<Data />}>
                  <Route path="projects" element={<Projects />} />
                  <Route path="experiments" element={<Experiments />} />
                  <Route path="samples" element={<Samples />} />
                </Route>
                <Route path="about/*" element={<About />} />
                <Route path="qci/*" element={<QCI />} />
                <Route path="admin" element={<Admin />} />
                <Route
                  path="admin/user-management"
                  element={<UserManagement />}
                />
                <Route path="admin/data-import" element={<DataImport />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Session>
      </Router>
    </RecoilRoot>
  );
}
