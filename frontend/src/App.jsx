import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreFood from './pages/ExploreFood';
import FoodDetails from './pages/FoodDetails';
import CreateFoodPost from './pages/CreateFoodPost';
import NGOCampaigns from './pages/NGOCampaigns';
import CampaignDetails from './pages/CampaignDetails';
import VolunteerOpportunities from './pages/VolunteerOpportunities';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExploreFood />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route path="/create-food" element={<CreateFoodPost />} />
              <Route path="/edit-food/:id" element={<CreateFoodPost />} />
              <Route path="/campaigns" element={<NGOCampaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/volunteer" element={<VolunteerOpportunities />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
