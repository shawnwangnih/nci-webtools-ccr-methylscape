import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import { useRecoilState } from 'recoil';
import CountUp from 'react-countup';
import { dataState } from './data.state';
import { NavLink } from 'react-router-dom';
import { PieChartFill, ClipboardData, PeopleFill } from 'react-bootstrap-icons';
import { Outlet } from 'react-router-dom';
import './data.scss';

export default function Data() {
  const [state, setState] = useRecoilState(dataState);
  const { data, projectsCount, experimentsCount, samplesCount } = state;

  useEffect(() => {
    async function scanTable() {
      try {
        const data = await (await fetch('api/scanDynamoDB')).json();

        const projectsCount = [
          ...new Set(
            data.filter(({ project }) => project).map(({ project }) => project)
          ),
        ].length;
        const experimentsCount = [
          ...new Set(
            data
              .filter(({ experiment }) => experiment)
              .map(({ experiment }) => experiment)
          ),
        ].length;
        const samplesCount = [
          ...new Set(
            data
              .filter(({ sample_name }) => sample_name)
              .map(({ sample_name }) => sample_name)
          ),
        ].length;

        setState({
          data: data.length ? data : false,
          projectsCount,
          experimentsCount,
          samplesCount,
        });
      } catch (err) {
        console.log(err);
        return false;
      }
    }
    if (!data.length) scanTable();
  }, [data]);

  return (
    <div>
      <Container fluid="xxl" className="d-flex p-2">
        <NavLink to={'projects'} className="text-decoration-none d-flex">
          <PieChartFill className="stat-icon" />
          {data.length ? (
            <CountUp
              className="countup"
              start={projectsCount / 2}
              end={projectsCount}
              duration={1}
            />
          ) : (
            <span className="countup">0</span>
          )}
          <h3 className="fw-light text-black">Projects</h3>
        </NavLink>
        <NavLink
          to={'experiments'}
          className="text-decoration-none d-flex ms-4"
        >
          <ClipboardData className="stat-icon" />
          {data.length ? (
            <CountUp
              className="countup"
              start={experimentsCount / 2}
              end={experimentsCount}
              duration={1}
            />
          ) : (
            <span className="countup">0</span>
          )}
          <h3 className="fw-light text-black">Experiments</h3>
        </NavLink>
        <NavLink to={'samples'} className="text-decoration-none d-flex ms-4">
          <PeopleFill className="stat-icon" />
          {data.length ? (
            <CountUp
              className="countup"
              start={samplesCount / 2}
              end={samplesCount}
              duration={1}
            />
          ) : (
            <span className="countup">0</span>
          )}
          <h3 className="fw-light text-black">Samples</h3>
        </NavLink>
      </Container>
      <Container fluid="xxl" className="bg-white">
        <Outlet />
      </Container>
    </div>
  );
}
