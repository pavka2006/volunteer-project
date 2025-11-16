import React, { useState } from 'react';

function Calendar({ selectedCity }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025
  const [selectedDate, setSelectedDate] = useState(null);

  const eventsData = {
    '2025-11-15': { title: 'Волонтёрская акция "Чистый город"', city: 'Обнинск, Калужская область' },
    '2025-11-18': { title: 'Встреча активистов НКО', city: 'Электросталь, Московская область' },
    '2025-11-22': { title: 'Фестиваль добрых дел', city: 'Саров, Нижегородская область' },
    '2025-11-25': { title: 'Семинар для волонтёров', city: 'Обнинск, Калужская область' },
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEvent = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return !!eventsData[dateStr];
  };

  const getEvent = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventsData[dateStr];
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const event = selectedDate ? getEvent(selectedDate) : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Календарь событий</h1>
        <p>
          {selectedCity ? `События в городе: ${selectedCity}` : 'Все события'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Calendar */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={prevMonth}
              style={{
                padding: '0.5rem 1rem',
                background: '#003d82',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Назад
            </button>
            <h2 style={{ color: '#003d82', textTransform: 'capitalize' }}>{monthName}</h2>
            <button
              onClick={nextMonth}
              style={{
                padding: '0.5rem 1rem',
                background: '#003d82',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Далее →
            </button>
          </div>

          {/* Weekdays Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div
                key={day}
                style={{
                  fontWeight: 600,
                  color: '#003d82',
                  padding: '0.5rem',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
            }}
          >
            {days.map((day, index) => (
              <div
                key={index}
                onClick={() => day && setSelectedDate(day)}
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  borderRadius: '0.5rem',
                  cursor: day ? 'pointer' : 'default',
                  background: day
                    ? selectedDate === day
                      ? '#003d82'
                      : hasEvent(day)
                      ? '#e8f0ff'
                      : '#f5f5f5'
                    : 'transparent',
                  color: day
                    ? selectedDate === day
                      ? 'white'
                      : '#1a1a1a'
                    : 'transparent',
                  fontWeight: day ? 500 : 'normal',
                  border: hasEvent(day) ? '2px solid #003d82' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (day && selectedDate !== day) {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day && selectedDate !== day) {
                    e.currentTarget.style.background = hasEvent(day) ? '#e8f0ff' : '#f5f5f5';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {day}
                {hasEvent(day) && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#003d82',
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event Details */}
        <div style={{ height: 'fit-content' }}>
          {event ? (
            <div
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                borderLeft: '4px solid #003d82',
              }}
            >
              <h3 style={{ color: '#003d82', marginBottom: '1rem' }}>
                {currentMonth.getDate() < 10
                  ? currentMonth.getDate()
                  : selectedDate} {monthName.split(' ')[0]}
              </h3>
              <h4 style={{ marginBottom: '0.5rem' }}>{event.title}</h4>
              <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                📍 {event.city}
              </p>
              <button
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#003d82',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Добавить в избранное
              </button>
            </div>
          ) : (
            <div
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                textAlign: 'center',
                color: '#999999',
              }}
            >
              <p>Выберите дату с событием</p>
              <p style={{ fontSize: '2rem', marginTop: '1rem' }}>📅</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;