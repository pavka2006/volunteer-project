import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('volunteer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    organization_name: '',
    city: '',
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
      const registerResponse = await fetch(
        'http://localhost:8000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            user_type: userType,
          }),
        }
      );

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(
          errorData.detail || 'Ошибка регистрации'
        );
      }

      const registerData = await registerResponse.json();
      console.log('Регистрация успешна:', registerData);

      const token = registerData.access_token;
      localStorage.setItem('access_token', token);

      const userResponse = await fetch(
        'http://localhost:8000/api/auth/me',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!userResponse.ok) {
        console.error(
          'Ошибка при получении данных пользователя:',
          userResponse.status
        );
        if (registerData.user) {
          localStorage.setItem('user', JSON.stringify(registerData.user));
        }
        navigate('/profile');
        setTimeout(() => window.location.reload(), 100);
        return;
      }

      const userData = await userResponse.json();
      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/profile');
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userType">Я</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="form-control"
            >
              <option value="volunteer">Волонтер</option>
              <option value="nko_member">Представитель НКО</option>
            </select>
          </div>

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
              placeholder="Придумай пароль"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Полное имя</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Иван Петров"
              className="form-control"
              required
            />
          </div>

          {userType === 'nko_member' && (
            <div className="form-group">
              <label htmlFor="organization_name">Название организации</label>
              <input
                type="text"
                id="organization_name"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="НКО 'Мир'"
                className="form-control"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="city">Город</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Москва"
              className="form-control"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="auth-link">
          Уже есть учетная запись?{' '}
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;