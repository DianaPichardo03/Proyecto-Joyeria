import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Tienda from "./Tienda";
import Login from "./Login";
import Admin from "./Admin";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        
        <Route path="/" element={<Tienda />} />

        
        <Route path="/admin" element={<Login />} />

       
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;