import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('Токен не найден. Пожалуйста, переавторизуйтесь');
      }

      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Ошибка авторизации. Токен истёк или невалидный');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Ошибка загрузки пользователей');
      }

      const data = await response.json();
      setUsers(data);
      applySort(data, searchTerm, cityFilter);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError(error.message || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const getHierarchyOrder = (userType) => {
    const order = {
      'admin': 0,
      'moderator': 1,
      'nko_member': 2,
      'volunteer': 3
    };
    return order[userType] || 999;
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      'admin': 'Администратор',
      'moderator': 'Модератор',
      'nko_member': 'Член НКО',
      'volunteer': 'Волонтер'
    };
    return labels[userType] || userType;
  };

  const applySort = (usersToSort, search, city) => {
    let filtered = usersToSort;

    if (search && search.trim() !== '') {
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (city && city.trim() !== '') {
      filtered = filtered.filter(u =>
        u.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    const sorted = filtered.sort((a, b) => {
      return getHierarchyOrder(a.user_type) - getHierarchyOrder(b.user_type);
    });

    setFilteredUsers(sorted);
  };

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchTerm(newSearch);
    applySort(users, newSearch, cityFilter);
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCityFilter(newCity);
    applySort(users, searchTerm, newCity);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    applySort(users, '', '');
  };

  const makeRequest = async (url, method = 'POST') => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Ошибка авторизации');
      return false;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        alert('Сессия истекла. Пожалуйста, переавторизуйтесь');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Ошибка запроса:', error);
      return false;
    }
  };

  const handleModeratorClick = (user) => {
    setModalUser(user);
    setShowModal(true);
  };

  const confirmModeratorAction = async () => {
    if (!modalUser) return;

    const isModerator = modalUser.user_type === 'moderator';
    const url = isModerator
      ? `http://localhost:8000/api/admin/users/${modalUser.id}/remove-moderator`
      : `http://localhost:8000/api/admin/users/${modalUser.id}/make-moderator`;

    if (await makeRequest(url)) {
      alert(isModerator ? 'Права модератора отозваны' : 'Пользователь назначен модератором');
      setShowModal(false);
      setModalUser(null);
      loadUsers();
    } else {
      alert('Ошибка при изменении статуса');
    }
  };

  const banUser = async (userId) => {
    if (await makeRequest(`http://localhost:8000/api/admin/users/${userId}/ban`)) {
      alert('Пользователь заблокирован');
      loadUsers();
    } else {
      alert('Ошибка при блокировке');
    }
  };

  const unbanUser = async (userId) => {
    if (await makeRequest(`http://localhost:8000/api/admin/users/${userId}/unban`)) {
      alert('Пользователь разблокирован');
      loadUsers();
    } else {
      alert('Ошибка при разблокировке');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Вы уверены? Это действие необратимо!')) {
      return;
    }

    if (await makeRequest(`http://localhost:8000/api/admin/users/${userId}/delete`, 'DELETE')) {
      alert('Пользователь удален');
      loadUsers();
    } else {
      alert('Ошибка при удалении');
    }
  };

  const viewUserProfile = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalUser(null);
  };

  return (
    <div className="admin-panel">
      <h2>Панель администратора</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Поиск по имени или email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        <input
          type="text"
          placeholder="Фильтр по городу"
          value={cityFilter}
          onChange={handleCityChange}
          className="search-input"
        />

        <button onClick={handleClearFilters} className="clear-filters-btn">
          Очистить фильтры
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Загрузка...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="no-results">Пользователи не найдены</p>
      ) : (
        <div className="users-list">
          <p className="results-count">Всего пользователей: {filteredUsers.length}</p>
          <table className="users-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Тип</th>
                <th>Город</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={user.is_banned ? 'banned' : ''}>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        viewUserProfile(user.id);
                      }}
                      className="user-link"
                      title="Перейти на страницу пользователя"
                    >
                      {user.full_name}
                    </a>
                  </td>
                  <td>{user.email}</td>
                  <td>{getUserTypeLabel(user.user_type)}</td>
                  <td>{user.city}</td>
                  <td>{user.is_banned ? 'Заблокирован' : 'Активен'}</td>
                  <td>
                    <div className="action-buttons">
                      {user.user_type !== 'admin' && user.user_type !== 'moderator' && user.user_type === 'volunteer' && (
                        <button
                          onClick={() => handleModeratorClick(user)}
                          className="action-btn moderator-btn"
                        >
                          Назначить модератором
                        </button>
                      )}
                      {user.user_type === 'moderator' && (
                        <button
                          onClick={() => handleModeratorClick(user)}
                          className="action-btn remove-moderator-btn"
                        >
                          Удалить модератора
                        </button>
                      )}
                      {user.user_type !== 'admin' && (
                        <button
                          onClick={() => user.is_banned ? unbanUser(user.id) : banUser(user.id)}
                          className={user.is_banned ? "unban-btn" : "ban-btn"}
                        >
                          {user.is_banned ? 'Разбан' : 'Бан'}
                        </button>
                      )}
                      {user.user_type !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="delete-btn"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && modalUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Управление правами модератора</h3>
            <p>Пользователь: <strong>{modalUser.full_name}</strong></p>
            <p>Email: <strong>{modalUser.email}</strong></p>
            <p>Текущий статус: <strong>{getUserTypeLabel(modalUser.user_type)}</strong></p>

            {modalUser.user_type === 'moderator' ? (
              <p className="modal-action">Хотите отозвать права модератора и вернуть его волонтером?</p>
            ) : (
              <p className="modal-action">Хотите назначить его модератором?</p>
            )}

            <div className="modal-buttons">
              <button onClick={confirmModeratorAction} className="modal-confirm-btn">
                {modalUser.user_type === 'moderator' ? 'Отозвать права' : 'Назначить модератором'}
              </button>
              <button onClick={closeModal} className="modal-cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;