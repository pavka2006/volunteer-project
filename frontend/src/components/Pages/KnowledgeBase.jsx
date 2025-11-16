import React, { useState, useEffect } from 'react';

// ==================== ЛОКАЛЬНЫЕ ДАННЫЕ (ВРЕМЕННО) ====================
const initialSections = [
  { id: 1, title: 'Основы волонтёрства', sphere: 'Обучение', icon: '📚' },
  { id: 2, title: 'Работа с НКО', sphere: 'Практика', icon: '🤝' },
  { id: 3, title: 'Первая помощь', sphere: 'Здоровье', icon: '⚕️' },
  { id: 4, title: 'Экологические проекты', sphere: 'Экология', icon: '🌱' },
  { id: 5, title: 'Социальная помощь', sphere: 'Социум', icon: '❤️' },
  { id: 6, title: 'Социальная помощь детям', sphere: 'Социум', icon: '❤️' },
];

const initialVideos = [
  { id: 1, section_id: 1, title: 'Что такое волонтёрство', vk_url: '194994222_456239405' },
  { id: 2, section_id: 1, title: 'Как начать волонтёрить', vk_url: '171236832_171236833' },
  { id: 3, section_id: 1, title: 'Волонтёр: истории людей', vk_url: '171236832_171236834' },

  { id: 4, section_id: 2, title: 'Структура НКО', vk_url: '171236832_171236835' },
  { id: 5, section_id: 2, title: 'Как работает некоммерческая организация', vk_url: '171236832_171236836' },
  { id: 6, section_id: 2, title: 'Управление проектами в НКО', vk_url: '171236832_171236837' },

  { id: 7, section_id: 3, title: 'Основы ПМП для волонтёров', vk_url: '171236832_171236838' },
  { id: 8, section_id: 3, title: 'Помощь при ранениях', vk_url: '171236832_171236839' },
  { id: 9, section_id: 3, title: 'Остановка кровотечения', vk_url: '171236832_171236840' },

  { id: 10, section_id: 4, title: 'Волонтёры за экологию', vk_url: '171236832_171236841' },
  { id: 11, section_id: 4, title: 'Уборка и озеленение', vk_url: '171236832_171236842' },
  { id: 12, section_id: 4, title: 'Экопроекты России', vk_url: '171236832_171236843' },

  { id: 13, section_id: 5, title: 'Помощь пожилым людям', vk_url: '171236832_171236844' },
  { id: 14, section_id: 5, title: 'Поддержка детей в беде', vk_url: '171236832_171236845' },
  { id: 15, section_id: 5, title: 'Социальные проекты', vk_url: '171236832_171236846' },
];
// const initialSections = await fetch('/api/sections').then(r => r.json()); // ← ЗАМЕНИ НА ЭТО КОГДА БУДЕТ БД
// const initialVideos = await fetch('/api/videos').then(r => r.json()); // ← ЗАМЕНИ НА ЭТО КОГДА БУДЕТ БД
// ========================================================================

function KnowledgeBase() {
  const [sections, setSections] = useState(initialSections);
  // const [sections, setSections] = useState([]); // ← РАСКОММЕНТИРУЙ ЭТО КОГДА БУДЕТ БД
  
  const [videos, setVideos] = useState(initialVideos);
  // const [videos, setVideos] = useState([]); // ← РАСКОММЕНТИРУЙ ЭТО КОГДА БУДЕТ БД
  
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedSphere, setSelectedSphere] = useState('Все');

  // ==================== ЗАГРУЗКА ДАННЫХ ИЗ БД (раскомментируй когда будет готовая БД) ====================
  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       const sectionsData = await fetch('/api/sections').then(r => r.json());
  //       const videosData = await fetch('/api/videos').then(r => r.json());
  //       setSections(sectionsData);
  //       setVideos(videosData);
  //       console.log('✅ Данные базы знаний загружены');
  //     } catch (error) {
  //       console.error('❌ Ошибка загрузки данных:', error);
  //     }
  //   };
  //
  //   loadData();
  //   const interval = setInterval(loadData, 30000); // обновляем каждые 30 сек
  //   return () => clearInterval(interval);
  // }, []);
  // ============================================================================================================

  // Получаем уникальные сферы для фильтра
  const spheres = ['Все', ...new Set(sections.map(s => s.sphere))];

  // Фильтруем разделы по сфере
  const filteredSections = selectedSphere === 'Все' 
    ? sections 
    : sections.filter(s => s.sphere === selectedSphere);

  // Переключаем развёртывание раздела
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Получаем видео для конкретного раздела
  const getVideosForSection = (sectionId) => {
    return videos.filter(v => v.section_id === sectionId);
  };

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* ЗАГОЛОВОК */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#003d82', margin: '0 0 0.5rem 0' }}>📚 База знаний</h1>
          <p style={{ color: '#666', margin: 0 }}>Полезные материалы, видео и ресурсы для волонтёров и НКО</p>
        </div>

        {/* ФИЛЬТР ПО СФЕРАМ */}
        <div style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <label style={{ fontWeight: 600, color: '#003d82', marginRight: '1rem', display: 'block', marginBottom: '0.75rem' }}>
            🎯 Фильтр по сфере:
          </label>
          <select 
            value={selectedSphere}
            onChange={(e) => setSelectedSphere(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '2px solid #003d82',
              fontSize: '1rem',
              cursor: 'pointer',
              color: '#003d82',
              fontWeight: 600,
              minWidth: '200px'
            }}
          >
            {spheres.map(sphere => (
              <option key={sphere} value={sphere}>{sphere}</option>
            ))}
          </select>
        </div>

        {/* СПИСОК РАЗДЕЛОВ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSections.length > 0 ? (
            filteredSections.map(section => (
              <div 
                key={section.id} 
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* ПЛАШКА РАЗДЕЛА */}
                <div
                  onClick={() => toggleSection(section.id)}
                  style={{
                    padding: '1.5rem',
                    background: expandedSections[section.id] ? '#f0f7ff' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    borderLeft: '4px solid #003d82'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = expandedSections[section.id] ? '#f0f7ff' : 'white'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{section.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, color: '#003d82', fontSize: '1.1rem' }}>{section.title}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
                        🏷️ {section.sphere} • 📹 {getVideosForSection(section.id).length} видео
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem', transition: 'transform 0.3s' }}>
                    {expandedSections[section.id] ? '▼' : '▶'}
                  </span>
                </div>

                {/* ВИДЕО (развёрнутые) */}
                {expandedSections[section.id] && (
                  <div style={{ padding: '1.5rem', background: '#fafafa', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                      {getVideosForSection(section.id).length > 0 ? (
                        getVideosForSection(section.id).map(video => (
                          <div key={video.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#003d82', fontSize: '0.95rem' }}>
                              📹 {video.title}
                            </p>
                            {/* VK VIDEO IFRAME - ИСПРАВЛЕНО */}
                            <iframe
                              src={`https://vk.com/video_ext.php?oid=-${video.vk_url.split('_')[0]}&id=${video.vk_url.split('_')[1]}`}
                              style={{
                                width: '100%',
                                height: '250px',
                                borderRadius: '0.375rem',
                                border: 'none'
                              }}
                              frameBorder="0"
                              allow="autoplay; encrypted-media; fullscreen"
                              allowFullScreen
                              title={video.title}
                            />
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>Видео не добавлены</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '0.75rem' }}>
              <p style={{ color: '#999', fontSize: '1.1rem' }}>😔 Разделы не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;
