import { Container } from "react-bootstrap";
import GroupTabs from "./groupTabs";
import GroupTables from "./groupTables";

export default function Table() {
  return (
    <Container fluid>
      <GroupTabs />
      <GroupTables />
    </Container>
  );
}
