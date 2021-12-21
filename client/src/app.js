import { RecoilRoot } from "recoil";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./modules/components/navbar";
import Data from "./modules/data/data";
import About from "./modules/about/about";
import Home from "./modules/home/home";
import Projects from "./modules/data/projects/projects";
import Experiments from "./modules/data/experiments/experiments";
import Samples from "./modules/data/samples/samples";
import QCI from "./modules/qciReport/qci";
import Admin from "./modules/components/admin/admin";

export default function App() {
  const navbarLinks = [
    { path: "/", title: "Home", exact: true },
    { path: "data/projects", title: "Projects" },
    { path: "data/experiments", title: "Experiments" },
    { path: "data/samples", title: "Samples" },
    { path: "about", title: "About" },
  ];

  return (
    <RecoilRoot>
      <Router>
        <Navbar links={navbarLinks} className="shadow-sm" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="data" element={<Data />}>
            <Route path="projects" element={<Projects />} />
            <Route path="experiments" element={<Experiments />} />
            <Route path="samples" element={<Samples />} />
          </Route>
          <Route path="about/*" element={<About />} />
          <Route path="qci/*" element={<QCI />} />
          <Route path="admin/*" element={<Admin />} />
        </Routes>
      </Router>
    </RecoilRoot>
  );
}
