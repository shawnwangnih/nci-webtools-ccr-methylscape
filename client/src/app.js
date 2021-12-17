import { RecoilRoot } from "recoil";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./modules/components/navbar";
import Data from "./modules/data/data";
import About from "./modules/about/about";
import Home from "./modules/home/home";
import Projects from "./modules/projects/projects";
import Experiments from "./modules/experiments/experiments";
import Samples from "./modules/samples/samples";

export default function App() {
  const navbarLinks = [
    { path: "/", title: "Home", exact: true },
    { path: "/projects", title: "Projects" },
    { path: "/experiments", title: "Experiments" },
    { path: "/samples", title: "Samples" },
    { path: "/about", title: "About" },
  ];

  return (
    <RecoilRoot>
      <Router>
        <Navbar links={navbarLinks} className="shadow-sm" />
        <Data />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="projects/*" element={<Projects />} />
          <Route path="experiments/*" element={<Experiments />} />
          <Route path="samples/*" element={<Samples />} />
          <Route path="about/*" element={<About />} />
        </Routes>
      </Router>
    </RecoilRoot>
  );
}
