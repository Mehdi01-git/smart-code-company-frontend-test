import EnhancedTable from "./components/Paginate";
import styled from "styled-components";

export default function App() {
  return (
    <MaiSection>
      <EnhancedTable />
    </MaiSection>
  );
}

const MaiSection = styled("div")`
  height: 100vh;
  display: grid;
  place-items: center;
  padding: 0px 100px;
`;
