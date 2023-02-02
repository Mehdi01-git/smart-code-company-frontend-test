import { useEffect, useState } from "react";
import "./App.css";
import EnhancedTable from "./components/Paginate";

function App() {
  const [isLoading, setLoading] = useState(true);
  function someRequest() {
    //Simulates a request; makes a "promise" that'll run for 1 second
    return new Promise((resolve) => setTimeout(() => resolve(), 1000));
  }
  useEffect(() => {
    someRequest().then(() => {
      const loaderElement = document.querySelector(".loader-container");
      if (loaderElement) {
        loaderElement.remove();
        setLoading(!isLoading);
      }
    });
  });
  if (isLoading) {
    return null;
  }
  return (
    <div className="App">
      <EnhancedTable />
    </div>
  );
}

export default App;
