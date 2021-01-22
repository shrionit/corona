import { CountriesProvider, CountriesContext } from "./contextprovider";
import Home from "./home";

function App() {
  return (
    <div className="App">
      <CountriesProvider>
        <div>
          <Home />
        </div>
      </CountriesProvider>
    </div>
  );
}

export default App;
