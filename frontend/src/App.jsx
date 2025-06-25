import { useState } from 'react'
import PollCreator from './components/PollCreator'
import Header from './components/Header'
import Login from './components/Login'
import SignUp from './components/SignUp'
import PollList from './components/PollList'
import PollDetails from './components/PollDetails'
import PollResultsPage from './components/PollResultsPage'
import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<PollList />} />
        <Route path="/create" element={<PollCreator />} />
        <Route path="/poll/:id" element={<PollDetails />} />
        <Route path="/poll/:id/results" element={<PollResultsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
