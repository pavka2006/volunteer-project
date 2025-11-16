import React, { useState, useEffect, useRef } from 'react';

// ==================== ЛОКАЛЬНЫЕ ДАННЫЕ (ВРЕМЕННО) ====================
const cityMapsConfig = [
  { name: 'Обнинск, Калужская область', lat: 55.1159, lng: 36.6085 },
  { name: 'Электросталь, Московская область', lat: 55.8113, lng: 38.4544 },
  { name: 'Саров, Нижегородская область', lat: 54.4994, lng: 43.6655 },
];
// const cityMapsConfig = await fetch('/api/cities').then(r => r.json()); // ← ЗАМЕНИ НА ЭТО КОГДА БУДЕТ БД

const initialNKOList = [
  // ОБНИНСК (10 НКО)
  { id: 1, name: 'НКО "Беркут"', city: 'Обнинск, Калужская область', category: 'Образование', description: 'Помощь в образовании детей', phone: '+7 (900) 123-45-67', website: 'www.berkut-nko.ru', image: '🦅' },
  { id: 2, name: 'НКО "Вместе"', city: 'Обнинск, Калужская область', category: 'Культура', description: 'Развитие культуры', phone: '+7 (903) 456-78-90', website: 'www.vmeste-nko.ru', image: '🎨' },
  { id: 3, name: 'НКО "Социум"', city: 'Обнинск, Калужская область', category: 'Социальная помощь', description: 'Социальные проекты', phone: '+7 (904) 567-89-01', website: 'www.socium-nko.ru', image: '👥' },
  { id: 4, name: 'НКО "Молодость"', city: 'Обнинск, Калужская область', category: 'Спорт', description: 'Развитие детского спорта', phone: '+7 (905) 678-90-12', website: 'www.molodost-nko.ru', image: '⚽' },
  { id: 5, name: 'НКО "Здоровье"', city: 'Обнинск, Калужская область', category: 'Медицина', description: 'Профилактика и здоровье', phone: '+7 (906) 789-01-23', website: 'www.zdorove-nko.ru', image: '⚕️' },
  { id: 6, name: 'НКО "Экополис"', city: 'Обнинск, Калужская область', category: 'Экология', description: 'Защита окружающей среды', phone: '+7 (907) 890-12-34', website: 'www.ekopolis-nko.ru', image: '🌍' },
  { id: 7, name: 'НКО "Достоинство"', city: 'Обнинск, Калужская область', category: 'Права человека', description: 'Защита прав граждан', phone: '+7 (908) 901-23-45', website: 'www.dostoinstvo-nko.ru', image: '⚖️' },
  { id: 8, name: 'НКО "Библиотека+"', city: 'Обнинск, Калужская область', category: 'Образование', description: 'Культурное развитие и просвещение', phone: '+7 (909) 012-34-56', website: 'www.biblioteka-plus-nko.ru', image: '📚' },
  { id: 9, name: 'НКО "Звезда"', city: 'Обнинск, Калужская область', category: 'Искусство', description: 'Развитие талантов молодёжи', phone: '+7 (910) 123-45-67', website: 'www.zvezda-nko.ru', image: '⭐' },
  { id: 10, name: 'НКО "Долголетие"', city: 'Обнинск, Калужская область', category: 'Социальная помощь', description: 'Помощь пожилым людям', phone: '+7 (911) 234-56-78', website: 'www.dolgoletie-nko.ru', image: '🧓' },

  // ЭЛЕКТРОСТАЛЬ (10 НКО)
  { id: 11, name: 'НКО "Зелёный город"', city: 'Электросталь, Московская область', category: 'Экология', description: 'Озеленение парков', phone: '+7 (901) 234-56-78', website: 'www.zeleniy-gorod.ru', image: '🌱' },
  { id: 12, name: 'НКО "Индустрия"', city: 'Электросталь, Московская область', category: 'Образование', description: 'Профтехническое образование', phone: '+7 (912) 345-67-89', website: 'www.industriya-nko.ru', image: '🏭' },
  { id: 13, name: 'НКО "Дети+Семья"', city: 'Электросталь, Московская область', category: 'Социальная помощь', description: 'Помощь многодетным семьям', phone: '+7 (913) 456-78-90', website: 'www.deti-semya-nko.ru', image: '👨‍👩‍👧‍👦' },
  { id: 14, name: 'НКО "Спектр"', city: 'Электросталь, Московская область', category: 'Инклюзия', description: 'Помощь людям с ОВЗ', phone: '+7 (914) 567-89-01', website: 'www.spektr-nko.ru', image: '🌈' },
  { id: 15, name: 'НКО "Механика"', city: 'Электросталь, Московская область', category: 'STEM', description: 'Развитие инженерных навыков', phone: '+7 (915) 678-90-12', website: 'www.mehanika-nko.ru', image: '⚙️' },
  { id: 16, name: 'НКО "Рассвет"', city: 'Электросталь, Московская область', category: 'Культура', description: 'Творческие мастерские', phone: '+7 (916) 789-01-23', website: 'www.rassvet-nko.ru', image: '🎭' },
  { id: 17, name: 'НКО "Будущее"', city: 'Электросталь, Московская область', category: 'Образование', description: 'Карьерная ориентация молодежи', phone: '+7 (917) 890-12-34', website: 'www.budushee-nko.ru', image: '🚀' },
  { id: 18, name: 'НКО "Рука помощи"', city: 'Электросталь, Московская область', category: 'Благотворительность', description: 'Материальная помощь нуждающимся', phone: '+7 (918) 901-23-45', website: 'www.ruka-pomoshi-nko.ru', image: '🤝' },
  { id: 19, name: 'НКО "Здравница"', city: 'Электросталь, Московская область', category: 'Медицина', description: 'Профилактика заболеваний', phone: '+7 (919) 012-34-56', website: 'www.zdravnica-nko.ru', image: '💊' },
  { id: 20, name: 'НКО "Перемена"', city: 'Электросталь, Московская область', category: 'Социальная помощь', description: 'Поддержка бездомных', phone: '+7 (920) 123-45-67', website: 'www.peremena-nko.ru', image: '🏠' },

  // САРОВ (10 НКО)
  { id: 21, name: 'НКО "Добрые сердца"', city: 'Саров, Нижегородская область', category: 'Социальная помощь', description: 'Помощь людям', phone: '+7 (902) 345-67-89', website: 'www.dobryeserdca.ru', image: '❤️' },
  { id: 22, name: 'НКО "Наука+Жизнь"', city: 'Саров, Нижегородская область', category: 'Образование', description: 'Популяризация науки', phone: '+7 (921) 234-56-78', website: 'www.nauka-zhizn-nko.ru', image: '🔬' },
  { id: 23, name: 'НКО "Память"', city: 'Саров, Нижегородская область', category: 'История', description: 'Сохранение культурного наследия', phone: '+7 (922) 345-67-89', website: 'www.pamyat-nko.ru', image: '🏛️' },
  { id: 24, name: 'НКО "Солнце"', city: 'Саров, Нижегородская область', category: 'Благотворительность', description: 'Помощь детским домам', phone: '+7 (923) 456-78-90', website: 'www.solnce-nko.ru', image: '☀️' },
  { id: 25, name: 'НКО "Творчество"', city: 'Саров, Нижегородская область', category: 'Искусство', description: 'Развитие художественных навыков', phone: '+7 (924) 567-89-01', website: 'www.tvorchestvo-nko.ru', image: '🎨' },
  { id: 26, name: 'НКО "Спорт для всех"', city: 'Саров, Нижегородская область', category: 'Спорт', description: 'Популяризация здорового образа жизни', phone: '+7 (925) 678-90-12', website: 'www.sport-dlya-vsekh-nko.ru', image: '🏃' },
  { id: 27, name: 'НКО "Правопорядок"', city: 'Саров, Нижегородская область', category: 'Права человека', description: 'Правовая грамотность населения', phone: '+7 (926) 789-01-23', website: 'www.pravoporyadok-nko.ru', image: '📋' },
  { id: 28, name: 'НКО "Активная жизнь"', city: 'Саров, Нижегородская область', category: 'Социальная помощь', description: 'Интеграция инвалидов в общество', phone: '+7 (927) 890-12-34', website: 'www.aktivnaya-zhizn-nko.ru', image: '💪' },
  { id: 29, name: 'НКО "Семейный очаг"', city: 'Саров, Нижегородская область', category: 'Семья', description: 'Укрепление семейных ценностей', phone: '+7 (928) 901-23-45', website: 'www.semeynyy-ochag-nko.ru', image: '👪' },
  { id: 30, name: 'НКО "Экопроект"', city: 'Саров, Нижегородская область', category: 'Экология', description: 'Экологическое воспитание', phone: '+7 (929) 012-34-56', website: 'www.ekoproekt-nko.ru', image: '🌳' },
];

// const initialNKOList = []; // ← ЗАМЕНИ НА ЭТО КОГДА БУДЕТ БД (данные будут загружаться в useEffect)
// ========================================================================

// Функция получения координат города по названию
const getCityCoords = (cityName) => {
  const city = cityMapsConfig.find((c) => c.name === cityName);
  return city ? { lat: city.lat, lng: city.lng } : null;
};

function NKOList() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const listContainerRef = useRef(null);
  const [nkoList, setNkoList] = useState(initialNKOList);
  // const [nkoList, setNkoList] = useState([]); // ← РАСКОММЕНТИРУЙ ЭТО КОГДА БУДЕТ БД
  
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedNKO, setSelectedNKO] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [mapInitialized, setMapInitialized] = useState(false);

  // ==================== ЗАГРУЗКА ДАННЫХ ИЗ БД (раскомментируй когда будет готовая БД) ====================
  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       // Загружаем города
  //       // const cities = await fetch('/api/cities').then(r => r.json());
  //       // cityMapsConfig = cities; // обновляем конфиг городов
  //
  //       // Загружаем НКО
  //       const nkos = await fetch('/api/nko').then(r => r.json());
  //       setNkoList(nkos);
  //
  //       console.log('✅ Данные загружены из БД');
  //     } catch (error) {
  //       console.error('❌ Ошибка загрузки данных из БД:', error);
  //     }
  //   };
  //
  //   // Загружаем СРАЗУ при открытии
  //   loadData();
  //
  //   // Потом обновляем каждые 30 сек
  //   const interval = setInterval(() => {
  //     console.log('⏰ Обновление данных...');
  //     loadData();
  //   }, 30000); // 30000 мс = 30 сек
  //
  //   // Очищаем интервал при размонтировании компонента
  //   return () => clearInterval(interval);
  // }, []);
  // ============================================================================================================

  const filteredNKO = selectedCity 
    ? nkoList.filter((org) => org.city === selectedCity)
    : nkoList;

  const nkoByCity = {};
  nkoList.forEach((nko) => {
    if (!nkoByCity[nko.city]) nkoByCity[nko.city] = [];
    nkoByCity[nko.city].push(nko);
  });

  useEffect(() => {
    if (mapInitialized || !window.ymaps || !mapContainerRef.current) return;

    window.ymaps.ready(() => {
      const initialCoords = [61.5240, 105.3188];
      const initialZoom = 3;

      if (mapRef.current) mapRef.current.destroy();

      mapRef.current = new window.ymaps.Map(mapContainerRef.current, {
        center: initialCoords,
        zoom: initialZoom,
        controls: ['zoomControl'],
      });

      mapRef.current.events.add('boundschange', () => {
        setCurrentZoom(mapRef.current.getZoom());
      });

      setMapInitialized(true);
    });

    return () => {
      // НЕ удаляем карту при размонтировании
    };
  }, [mapInitialized]);

  useEffect(() => {
    if (!mapRef.current || !window.ymaps || !mapInitialized) return;

    mapRef.current.geoObjects.removeAll();

    if (currentZoom < 10) {
      Object.keys(nkoByCity).forEach((cityName) => {
        const count = nkoByCity[cityName].length;
        if (count === 0) return;

        const cityCoords = getCityCoords(cityName);
        if (!cityCoords) return;

        const placemark = new window.ymaps.Placemark([cityCoords.lat, cityCoords.lng], {
          balloonContent: `<strong>${cityName}</strong><br/>НКО: ${count}`,
        }, {
          preset: 'islands#redCircleDotIcon',
          iconCaption: count.toString(),
        });

        placemark.events.add('click', () => {
          setSelectedCity(cityName);
          setSelectedNKO(null);
          if (listContainerRef.current) listContainerRef.current.scrollTop = 0;
          mapRef.current.setCenter([cityCoords.lat, cityCoords.lng], 11);
        });

        mapRef.current.geoObjects.add(placemark);
      });
    }
    else if (currentZoom >= 10 && selectedCity) {
      filteredNKO.forEach((nko) => {
        const cityCoords = getCityCoords(nko.city);
        if (!cityCoords) return;

        const placemark = new window.ymaps.Placemark([cityCoords.lat, cityCoords.lng], {
          balloonContent: `<strong>${nko.name}</strong><br/>${nko.category}`,
        }, {
          preset: 'islands#blueIcon',
        });

        placemark.events.add('click', () => setSelectedNKO(nko));
        mapRef.current.geoObjects.add(placemark);
      });
    }
  }, [currentZoom, selectedCity, filteredNKO, nkoByCity, mapInitialized]);

  useEffect(() => {
    if (currentZoom < 10 && selectedCity) {
      setSelectedCity(null);
      setSelectedNKO(null);
    }
  }, [currentZoom, selectedCity]);

  const handleNKODoubleClick = (nko) => {
    if (!mapRef.current) return;
    const cityCoords = getCityCoords(nko.city);
    if (!cityCoords) return;
    setSelectedCity(nko.city);
    mapRef.current.setCenter([cityCoords.lat, cityCoords.lng], 13);
    setSelectedNKO(nko);
  };

  const handleResetMap = () => {
    if (mapRef.current) {
      setSelectedCity(null);
      mapRef.current.setCenter([61.5240, 105.3188], 3);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Карта и организации</h1>
        <p>{selectedCity ? `Организации в городе: ${selectedCity}` : 'Все организации'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div ref={mapContainerRef} style={{ minHeight: '500px', background: '#e8f0ff', borderRadius: '0.75rem', border: '2px dashed #003d82', position: 'relative' }}>
          <button onClick={handleResetMap} style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.75rem 1.5rem', background: '#003d82', color: 'white', border: 'none', borderRadius: '0.375rem', zIndex: 100, cursor: 'pointer', fontWeight: 600 }}>← Россия</button>
        </div>

        <div style={{ background: 'white', borderRadius: '0.75rem', height: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
            <h3 style={{ margin: 0, color: '#003d82', fontSize: '0.95rem' }}>
              {filteredNKO.length} {selectedCity ? 'НКО в городе' : 'НКО всего'}
            </h3>
          </div>

          <div ref={listContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {filteredNKO.length > 0 ? (
              filteredNKO.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedNKO(org)}
                  onDoubleClick={() => handleNKODoubleClick(org)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    background: selectedNKO?.id === org.id ? '#f0f7ff' : 'white',
                    transition: 'all 0.3s ease',
                    borderLeft: selectedNKO?.id === org.id ? '4px solid #003d82' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedNKO?.id !== org.id) e.currentTarget.style.background = '#f9f9f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = selectedNKO?.id === org.id ? '#f0f7ff' : 'white';
                  }}
                  title="Двойной клик для приближения"
                >
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>{org.image}</div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#003d82' }}>{org.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>{org.category}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Нет НКО</div>
            )}
          </div>
        </div>
      </div>

      {selectedNKO && (
        <div style={{ marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #003d82' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>{selectedNKO.image}</div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#003d82' }}>{selectedNKO.name}</h2>
              <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{selectedNKO.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#999' }}>Категория</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedNKO.category}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#999' }}>Город</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedNKO.city}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#999' }}>Телефон</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedNKO.phone}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#999' }}>Сайт</p>
                  <a href={`https://${selectedNKO.website}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#003d82', textDecoration: 'none' }}>{selectedNKO.website}</a>
                </div>
              </div>
              <button
                onClick={() => handleNKODoubleClick(selectedNKO)}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#003d82',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NKOList;
