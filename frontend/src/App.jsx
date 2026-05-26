import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Tienda from "./Tienda";
import Login from "./Login";
import Admin from "./Admin";

function RutaProtegida({ children }) {
  const admin = localStorage.getItem("admin");

  return admin ? children : <Navigate to="/admin" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        
        <Route path="/" element={<Tienda />} />

        
        <Route path="/admin" element={<Login />} />

       
        <Route
          path="/panel"
          element={
            <RutaProtegida>
              <Admin />
            </RutaProtegida>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;