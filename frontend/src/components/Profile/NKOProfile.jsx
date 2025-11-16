import React, { useState, useEffect } from 'react';

const NKOProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/nko/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(
            'access_token'
          )}`,
        },
      });
      const data = await response.json();
      setUser(data);
      setEditData(data);
      if (data.photo_url) {
        setPreviewUrl(data.photo_url);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
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
        await fetch('http://localhost:8000/api/nko/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(
              'access_token'
            )}`,
          },
          body: JSON.stringify({ photo_url: base64String }),
        });
        setAvatarFile(null);
        loadUserData();
      };
      reader.readAsDataURL(avatarFile);
    } catch (error) {
      console.error('Ошибка загрузки логотипа:', error);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('http://localhost:8000/api/nko/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(
            'access_token'
          )}`,
        },
        body: JSON.stringify({
          full_name: editData.full_name,
          organization_name: editData.organization_name,
          city: editData.city,
          description: editData.description,
        }),
      });
      setIsEditing(false);
      loadUserData();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  };

  const handleEmailChange = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/nko/email',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(
              'access_token'
            )}`,
          },
          body: JSON.stringify({
            new_email: newEmail,
            password: emailPassword,
          }),
        }
      );
      if (response.ok) {
        alert('Email успешно изменён!');
        setShowEmailChange(false);
        setNewEmail('');
        setEmailPassword('');
        loadUserData();
      } else {
        alert('Ошибка при изменении email');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  if (!user) return <div className="loading">Загрузка...</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            {previewUrl ? (
              <img src={previewUrl} alt="Logo" className="avatar-circle" />
            ) : (
              <div className="avatar-placeholder">🏢</div>
            )}
            <label htmlFor="avatar-input" className="avatar-upload-label">
              Загрузить логотип
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
                Сохранить логотип
              </button>
            )}
          </div>

          <div className="profile-info-display">
            {!isEditing ? (
              <>
                <h2>{user.organization_name || 'НКО'}</h2>
                <div className="subtitle">организация</div>
                <div className="email-display">
                  📧 {user.email}
                </div>
                <div className="city-display">
                  📍 {user.city}
                </div>
                {user.full_name && (
                  <div>Контактное лицо: {user.full_name}</div>
                )}
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
                  <label>Название организации</label>
                  <input
                    type="text"
                    name="organization_name"
                    value={editData.organization_name || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        organization_name: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Контактное лицо</label>
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
                  <label>О организации</label>
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
      </div>
    </div>
  );
};

export default NKOProfile;