import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "@/pages/Welcome/Welcome";
import Register from "@/pages/Register/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
