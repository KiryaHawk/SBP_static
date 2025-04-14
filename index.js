ymaps.ready(function () {
    fetch('open.json')
        .then(response => response.json())
        .then(obj => {
            console.log(obj);

            const searchControls = new ymaps.control.SearchControl({
                options: {
                    float: 'right',
                    noPlacemark: true
                }
            });

            // Инициализация карты
            const myMap = new ymaps.Map("map", {
                center: [55.76, 37.64],
                zoom: 7,
                controls: [searchControls]
            });

            // Удаляем ненужные элементы управления
            const removeControls = [
                'geolocationControl',
                'trafficControl',
                'fullscreenControl',
                'zoomControl',
                'rulerControl',
                'typeSelector'
            ];

            const clearTheMap = myMap => {
                removeControls.forEach(control => myMap.controls.remove(control));
            };

            clearTheMap(myMap);

            // ObjectManager с нужными опциями
            const objectManager = new ymaps.ObjectManager({
                clusterize: true,
                clusterIconLayout: "default#pieChart",
                clusterDisableClickZoom: true, // Чтобы клик по кластеру не улетал в зум
                geoObjectOpenBalloonOnClick: true,
                geoObjectHasBalloon: true,
                geoObjectOpenHintOnHover: true
            });

            // Обновим координаты и найдём границы
            let minLat = Infinity, maxLat = -Infinity;
            let minLon = Infinity, maxLon = -Infinity;

            obj.features.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                    const [lon, lat] = feature.geometry.coordinates;
                    feature.geometry.coordinates = [lat, lon]; // Инвертируем координаты

                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLon = Math.min(minLon, lon);
                    maxLon = Math.max(maxLon, lon);
                }
            });

            objectManager.removeAll(); // На всякий случай очистим

            objectManager.add(obj); // Добавим объекты
            myMap.geoObjects.add(objectManager); // Добавим на карту

            // Установим границы
            if (minLat !== Infinity && maxLat !== -Infinity &&
                minLon !== Infinity && maxLon !== -Infinity) {
                const bounds = [
                    [minLat, minLon],
                    [maxLat, maxLon]
                ];
                myMap.setBounds(bounds, {
                    checkZoomRange: true
                });
            }
        });
});
