import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import AlarmIcon from "./components/AlarmIcon";
import Dashboard from "./pages/Dashboard";
import Monitor from "./pages/Monitor";
import Logs from "./pages/Logs";
import Upload from "./pages/Upload";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-farm-green border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400'>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to='/login' replace />;
};

const Layout = ({ children }) => {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        {/* Top header */}
        <header className='bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-end'>
          <AlarmIcon />
        </header>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/monitor'
            element={
              <ProtectedRoute>
                <Layout>
                  <Monitor />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/logs'
            element={
              <ProtectedRoute>
                <Layout>
                  <Logs />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/upload'
            element={
              <ProtectedRoute>
                <Layout>
                  <Upload />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
