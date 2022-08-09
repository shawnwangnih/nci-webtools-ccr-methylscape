import { Metadata } from "../analysis/metadata/metadata";
import { Card, Container } from "react-bootstrap";
export default function MeatadataSA() {
  return (
    <Container fluid className="my-4">
      <Card>
        <Card.Body>
          <Metadata />
        </Card.Body>
      </Card>
    </Container>
  );
}
