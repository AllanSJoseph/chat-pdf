import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Uploads from "./pages/Uploads";
import SessionTimeoutModal from "./components/SessionTimeoutModal";


function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

const App = () => {

  return (
    <>
      <BrowserRouter>
        <SessionTimeoutModal />
        <Routes>

          <Route 
            path="/"
            element={
              <ProtectedRoute>
                  <Home />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/"
            element={
              <ProtectedRoute>
                  <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/uploads"
            element={
              <ProtectedRoute>
                  <Uploads />
              </ProtectedRoute>
            }
          />

          <Route path="/signup" element={<Signup />} />

          <Route path="/login" element={<Login />} />

          <Route path="/logout" element={<Logout />} />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    
    </>
  )
}

export default App;