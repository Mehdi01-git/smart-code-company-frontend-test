// Quickstart (Hello World) with React Testing Library:
import { fireEvent, render, screen } from "@testing-library/react";
import EnhancedTable from "./Paginate";

//test block
test("Data table", () => {
  // render the component on virtual dom
  render(<EnhancedTable />);

  //select the elements you want to interact with
  const counter = screen.getByTestId("paginate");
  const nextPage = screen.getByTitle("Go to next page");
  const filter = screen.getByTestId("filter");

  fireEvent.click(nextPage);

  //assert the expected result
  expect(counter).toHaveTextContent("Rows per page:1011–20 of 42");
});
