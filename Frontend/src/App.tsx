
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loans from "./pages/Loans";
import Dashboard from "./pages/Dashboard";
import Scholarships from "./pages/Scholarships";
import AIChatbot from "./components/chatbot";


function App() {
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Loans />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scholarships" element={<Scholarships />} />
        </Routes>
      </div>
      <AIChatbot />
    </div>
  );
}

export default App;