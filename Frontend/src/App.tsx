
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Recommendation from "./pages/Recommendation.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Scholarships from "./pages/Scholarships.jsx";
import AIChatbot from "./components/chatbot.jsx";


function App() {
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Recommendation />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scholarships" element={<Scholarships />} />
        </Routes>
      </div>
      <AIChatbot />
    </div>
  );
}

export default App;