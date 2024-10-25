import Navbar from "./components/Navbar/Navbar.jsx";
import { HomeView } from "./views/Home/Home.jsx";

function App() {
  return (
    <div className="App">
      <header>
        <Navbar />
      </header>
      <HomeView />
    </div>
  );
}

export default App;
