import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "@/pages/Welcome/Welcome";
import AppHome from "@/pages/AppHome/AppHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/app" element={<AppHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
