import { Container, Col, Row, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";

export default function Admin() {
  const actions = [
    {
      title: "Manage Users",
      icon: "bi-people-fill",
      link: "/admin/user-management",
    },
    {
      title: "Import Data",
      icon: "bi-layer-backward",
      link: "/admin/data-import",
    },
  ]

  return (
    <Container fluid="xxl" className="my-4 p-3 rounded bg-white">
      <h1 className="h3 mb-4 text-primary">Administrative Tasks</h1>
      <hr className="mb-4 mb-4 border-info" />

      <Row>
        {actions.map((action, index) => (
          <Col md="3" key={`admin-action-${index}`}>
            <Link to={action.link}>
              <Card className="card-link card-accent-primary">
                <Card.Body className="shadow">
                  <div className="text-center py-4">
                    <i className={`display-3 bi ${action.icon}`} role="img" aria-label={action.title} />
                    <h2 className="h5 text-decoration-none">{action.title}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
