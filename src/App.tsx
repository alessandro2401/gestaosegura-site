import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Dados from './pages/Dados';
import POPs from './pages/POPs';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <BrowserRouter>
          <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dados" element={<Dados />} />
          <Route path="/pops" element={<POPs />} />
          </Routes>
          </Layout>
        </BrowserRouter>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
