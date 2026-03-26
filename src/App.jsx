import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import { HomeView } from "./views/Home/Home.jsx";
import { PhotographyView } from "./views/Photography/Photography.jsx";

function App() {
  return (
    <div className="App">
      <header>
        <Navbar />
      </header>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/photography" element={<PhotographyView />} />
      </Routes>
    </div>
  );
}

export default App;
