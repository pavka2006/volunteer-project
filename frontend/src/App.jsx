import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VolunteerProfile from './components/Profile/VolunteerProfile';
import NKOProfile from './components/Profile/NKOProfile';
import AdminPanel from './components/Profile/AdminPanel';
import AdminUserView from './components/Profile/AdminUserView';
import PrivateRoute from './components/Common/PrivateRoute';
import HomePage from './components/Pages/HomePage';
import News from './components/Pages/News';
import Calendar from './components/Pages/Calendar';
import NKOList from './components/Pages/NKOList';
import KnowledgeBase from './components/Pages/KnowledgeBase';
import './App.css';

function App() {
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('selectedCity') || '');

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setUserType(userData.user_type);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Ошибка парсинга:', e);
        setIsAuthenticated(false);
        setUserType(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCity');
    setIsAuthenticated(false);
    setUserType(null);
    setSelectedCity('');
    window.location.href = '/';
  };

  const renderProfile = () => {
    switch (userType) {
      case 'admin':
        return <AdminPanel />;
      case 'nko_member':
        return <NKOProfile />;
      case 'volunteer':
      default:
        return <VolunteerProfile />;
    }
  };

  const getUserTypeDisplay = () => {
    switch (userType) {
      case 'admin':
        return 'Администратор';
      case 'nko_member':
        return 'Член НКО';
      case 'volunteer':
        return 'Волонтер';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-container">
            <a href="/" className="navbar-logo">
              <span className="logo-icon">ДД</span>
              Добрые дела
            </a>

            <div className="nav-links">
              {isAuthenticated ? (
                <>
                  <a href="/" className="nav-link">Главная</a>
                  <a href="/news" className="nav-link">Новости</a>
                  <a href="/calendar" className="nav-link">Календарь</a>
                  <a href="/nko" className="nav-link">Организации</a>
                  <a href="/knowledge" className="nav-link">База знаний</a>
                  <div className="nav-right">
                    <span className="user-type">{getUserTypeDisplay()}</span>
                    <ProfileButton isAuthenticated={isAuthenticated} />
                    <button onClick={handleLogout} className="logout-btn">Выход</button>
                  </div>
                </>
              ) : (
                <div className="nav-right">
                  <ProfileButton isAuthenticated={isAuthenticated} />
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage selectedCity={selectedCity} setSelectedCity={setSelectedCity} isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Info Pages */}
            <Route path="/news" element={<News selectedCity={selectedCity} />} />
            <Route path="/calendar" element={<Calendar selectedCity={selectedCity} />} />
            <Route path="/nko" element={<NKOList selectedCity={selectedCity} />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  {renderProfile()}
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/user/:userId"
              element={
                <PrivateRoute>
                  <AdminUserView />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-section">
              <h4>Добрые дела Росатома</h4>
              <p>Единая платформа для жителей, волонтёров и НКО в городах присутствия Росатома.</p>
            </div>

            <div className="footer-section">
              <h4>Навигация</h4>
              <a href="/news">Новости</a>
              <a href="/calendar">Календарь</a>
              <a href="/nko">Организации</a>
            </div>



            <div className="footer-section">
              <h4>Контакты</h4>
              <p>Есть вопросы? Свяжитесь с нами</p>
              <p>Email: info@dobrye-dela.ru</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Добрые дела Росатома. Все права защищены.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Компонент кнопки профиля
function ProfileButton({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
      className="profile-link"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.25rem',
        padding: 0,
        transition: 'transform 0.3s ease',
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      👤
    </button>
  );
}



export default App;