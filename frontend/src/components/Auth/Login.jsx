import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await authAPI.login(formData);
      const token = loginResponse.data.access_token;
      localStorage.setItem('access_token', token);

      const userResponse = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/profile');
        setTimeout(() => window.location.reload(), 100);
      } else {
        throw new Error('Не удалось получить данные пользователя');
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(
        err.response?.data?.detail ||
          'Ошибка входа. Проверь email и пароль'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вход</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введи пароль"
              className="form-control"
              required
            />
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
        <div className="auth-link">
          Нет учетной записи?{' '}
          <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;