import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminUserView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Пользователь не найден');
      }
      const data = await response.json();
      setUser(data);
      setEditData(data);
      if (data.photo_url) {
        setPhotoPreview(data.photo_url);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: editData.full_name,
            email: editData.email,
            city: editData.city,
            organization_name: editData.organization_name,
            description: editData.description
          })
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при сохранении');
      }

      const updatedData = await response.json();
      setUser(updatedData);
      setEditData(updatedData);
      setIsEditing(false);
      alert('Профиль сохранен');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(user);
  };

  // ✅ ФУНКЦИЯ УДАЛЕНИЯ ФОТОГРАФИИ
  const handleDeletePhoto = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить фотографию?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}/delete-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при удалении фотографии');
      }

      const updatedData = await response.json();
      setUser(updatedData);
      setPhotoPreview(null);
      alert('Фотография удалена');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="error-message">Пользователь не найден</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <button onClick={() => navigate('/profile')} className="back-btn">
          ← Назад к админ-панели
        </button>

        {!isEditing ? (
          <>
            <h2>{user.full_name}</h2>

            {photoPreview && (
              <div className="avatar-container">
                <img src={photoPreview} alt="Avatar" className="user-avatar-view" />
              </div>
            )}

            <div className="user-info">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Тип:</strong> {user.user_type}</p>
              <p><strong>Город:</strong> {user.city}</p>
              <p><strong>Статус:</strong> {user.is_banned ? 'Заблокирован' : 'Активен'}</p>

              {user.organization_name && user.user_type === 'nko_member' && (
                <p><strong>Организация:</strong> {user.organization_name}</p>
              )}

              {user.description && (
                <div>
                  <strong>Описание:</strong>
                  <p>{user.description}</p>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                Редактировать
              </button>
              {photoPreview && (
                <button onClick={handleDeletePhoto} className="delete-btn" style={{ marginTop: '10px' }}>
                  Удалить фото
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h2>Редактирование профиля</h2>

            <div className="edit-form">
              <div className="form-group">
                <label>ФИО:</label>
                <input
                  type="text"
                  name="full_name"
                  value={editData.full_name || ''}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email || ''}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Город:</label>
                <input
                  type="text"
                  name="city"
                  value={editData.city || ''}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Организация:</label>
                <input
                  type="text"
                  name="organization_name"
                  value={editData.organization_name || ''}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Описание:</label>
                <textarea
                  name="description"
                  value={editData.description || ''}
                  onChange={handleEditChange}
                  className="form-control"
                  rows="5"
                  placeholder="Введите описание пользователя"
                />
              </div>

              <div className="button-group">
                <button onClick={handleSave} className="save-btn">Сохранить</button>
                <button onClick={handleCancel} className="cancel-btn">Отмена</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUserView;