import React, { useState, useEffect } from 'react';
import { authAPI, volunteerAPI } from '../../services/api';

const VolunteerProfile = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadUserData();
    loadFavorites();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setEditData(response.data);
      if (response.data.photo_url) {
        setPreviewUrl(response.data.photo_url);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await volunteerAPI.getFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        await authAPI.updateProfile({ photo_url: base64String });
        setAvatarFile(null);
        loadUserData();
      };
      reader.readAsDataURL(avatarFile);
    } catch (error) {
      console.error('Ошибка загрузки аватарки:', error);
    }
  };

  const handleSave = async () => {
    try {
      await authAPI.updateProfile({
        full_name: editData.full_name,
        city: editData.city,
        description: editData.description,
      });
      setIsEditing(false);
      loadUserData();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  };

  const handleEmailChange = async () => {
    try {
      await authAPI.changeEmail({
        new_email: newEmail,
        password: emailPassword,
      });
      alert('Email успешно изменён!');
      setShowEmailChange(false);
      setNewEmail('');
      setEmailPassword('');
      loadUserData();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при изменении email');
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await volunteerAPI.removeFavorite(favoriteId);
      loadFavorites();
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
    }
  };

  if (!user) return <div className="loading">Загрузка...</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="avatar-circle" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
            <label htmlFor="avatar-input" className="avatar-upload-label">
              Загрузить фото
            </label>
            <input
              id="avatar-input"
              type="file"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
            {avatarFile && (
              <button onClick={handleUploadAvatar} className="upload-btn">
                Сохранить фото
              </button>
            )}
          </div>

          <div className="profile-info-display">
            {!isEditing ? (
              <>
                <h2>{user.full_name || 'Волонтер'}</h2>
                <div className="subtitle">волонтер</div>
                <div className="email-display">
                  📧 {user.email}
                </div>
                <div className="city-display">
                  📍 {user.city}
                </div>
                {user.description && (
                  <div className="description-display">
                    {user.description}
                  </div>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-profile-btn"
                >
                  Редактировать профиль
                </button>
              </>
            ) : (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editData.full_name || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        full_name: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Город</label>
                  <input
                    type="text"
                    name="city"
                    value={editData.city || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, city: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>О себе</label>
                  <textarea
                    name="description"
                    value={editData.description || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        description: e.target.value,
                      })
                    }
                    className="form-control"
                    rows="4"
                  />
                </div>
                <div className="button-group">
                  <button
                    onClick={handleSave}
                    className="save-btn"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Email</h3>
          {!showEmailChange ? (
            <button
              onClick={() => setShowEmailChange(true)}
              className="edit-profile-btn"
            >
              Изменить email
            </button>
          ) : (
            <div className="email-change-form">
              <div className="form-group">
                <label>Новый email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) =>
                    setEmailPassword(e.target.value)
                  }
                  className="form-control"
                />
              </div>
              <div className="button-group">
                <button
                  onClick={handleEmailChange}
                  className="save-btn"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setShowEmailChange(false);
                    setNewEmail('');
                    setEmailPassword('');
                  }}
                  className="cancel-btn"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>Избранное</h3>
          {favorites.length > 0 ? (
            <div className="favorites-list">
              {favorites.map((fav) => (
                <div key={fav.id} className="favorite-item">
                  <span>{fav.name}</span>
                  <button
                    onClick={() => handleRemoveFavorite(fav.id)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-message">
              У вас пока нет избранных элементов
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;