import React, { useState } from 'react';

function News({ selectedCity }) {
  const [newsItems] = useState([
    {
      id: 1,
      title: 'Новое сотрудничество с НКО "Беркут"',
      date: '15 ноября 2025',
      city: 'Обнинск, Калужская область',
      description: 'Подписано соглашение о развитии волонтёрских программ в регионе...',
      image: '📰',
    },
    {
      id: 2,
      title: 'Открыт набор волонтёров на проект "Зелёный город"',
      date: '12 ноября 2025',
      city: 'Электросталь, Московская область',
      description: 'Приглашаем активных граждан участвовать в озеленении парков...',
      image: '🌱',
    },
    {
      id: 3,
      title: 'Успешно завершен фестиваль "Добрые сердца"',
      date: '10 ноября 2025',
      city: 'Саров, Нижегородская область',
      description: 'На фестивале собралось более 500 волонтёров и активистов...',
      image: '🎉',
    },
  ]);

  const filteredNews = selectedCity
    ? newsItems.filter((item) => item.city === selectedCity)
    : newsItems;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Новости и инициативы</h1>
        <p>
          {selectedCity
            ? `Новости для города: ${selectedCity}`
            : 'Все новости и инициативы'}
        </p>
      </div>

      {filteredNews.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredNews.map((news) => (
            <div
              key={news.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                display: 'grid',
                gridTemplateColumns: '80px 1fr 50px',
                gap: '1.5rem',
                alignItems: 'start',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '2.5rem', textAlign: 'center' }}>
                {news.image}
              </div>
              <div>
                <h3 style={{ color: '#003d82', marginBottom: '0.5rem' }}>{news.title}</h3>
                <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {news.date}
                </p>
                <p style={{ color: '#999999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Город: {news.city}
                </p>
                <p style={{ color: '#666666' }}>{news.description}</p>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ⭐
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="stub-content">
          <h2>Новостей не найдено</h2>
          <p>
            {selectedCity
              ? `Пока нет новостей для города "${selectedCity}"`
              : 'Новостей нет'}
          </p>
          <div className="stub-animation">📰</div>
        </div>
      )}
    </div>
  );
}

export default News;