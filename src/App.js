import "./App.css";
import absences from "./assets/absences.json";
import EnhancedTable from "./components/Paginate";

function App() {
  return (
    <div className="App">
      <EnhancedTable />
    </div>
  );
}

export default App;
