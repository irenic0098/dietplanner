import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import Home from './features/home/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import UserDashboard from './features/dashboard/UserDashboard';
import DailyTracking from './features/tracking/DailyTracking';
import WeightTrend from './features/tracking/WeightTrend';
import MealPlanner from './features/meals/MealPlanner';
import FoodSearch from './features/meals/FoodSearch';
import DietPlanGenerator from './features/meals/DietPlanGenerator';
import AICoach from './features/ai/AICoach';
import Recipes from './features/recipes/Recipes';
import Gamification from './features/gamification/Gamification';
import Subscriptions from './features/subscriptions/Subscriptions';
import YogaMeditation from './features/yoga/YogaMeditation';
import { Toaster } from 'react-hot-toast';

function Layout({ children }) {
  return (
    <div className="app-container">
      <Sidebar onClose={() => {}} />
      <main className="main-content">
        <Navbar onToggleMenu={() => {}} />
        {children}
      </main>
      <BottomBar />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public Landing Home Route */}
        <Route path="/" element={<Home />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Application Dashboard routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <UserDashboard />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/tracking" element={
          <PrivateRoute>
            <Layout>
              <DailyTracking />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/weight-trend" element={
          <PrivateRoute>
            <Layout>
              <WeightTrend />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meals" element={
          <PrivateRoute>
            <Layout>
              <MealPlanner />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/foods" element={
          <PrivateRoute>
            <Layout>
              <FoodSearch />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/diet-plan" element={
          <PrivateRoute>
            <Layout>
              <DietPlanGenerator />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/ai-coach" element={
          <PrivateRoute>
            <Layout>
              <AICoach />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/recipes" element={
          <PrivateRoute>
            <Layout>
              <Recipes />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/gamification" element={
          <PrivateRoute>
            <Layout>
              <Gamification />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/subscriptions" element={
          <PrivateRoute>
            <Layout>
              <Subscriptions />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/yoga" element={
          <PrivateRoute>
            <Layout>
              <YogaMeditation />
            </Layout>
          </PrivateRoute>
        } />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
