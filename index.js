ymaps.ready(function () {
    fetch('open.json')
        .then(response => response.json())
        .then(obj => {
            const searchControls = new ymaps.control.SearchControl({
                options: {
                    float: 'right',
                    noPlacemark: true
                }
            });

            const myMap = new ymaps.Map("map", {
                center: [55.76, 37.64],
                zoom: 7,
                controls: [searchControls]
            });

            const removeControls = [
                'geolocationControl',
                'trafficControl',
                'fullscreenControl',
                'zoomControl',
                'rulerControl',
                'typeSelector'
            ];

            removeControls.forEach(control => myMap.controls.remove(control));

            const objectManager = new ymaps.ObjectManager({
                clusterize: true,
                clusterIconLayout: "default#pieChart",
                clusterDisableClickZoom: false, // Разрешаем клик-зум по кластерам
                geoObjectOpenBalloonOnClick: true,
                geoObjectHasBalloon: true,
                geoObjectOpenHintOnHover: true
            });

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

            objectManager.removeAll();
            objectManager.add(obj);
            myMap.geoObjects.add(objectManager);

            // Наводим карту на все точки
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

            // Поведение при клике по кластеру
            objectManager.events.add('click', function (e) {
                const objectId = e.get('objectId');

                if (objectManager.clusters.getById(objectId)) {
                    // Это кластер
                    const cluster = objectManager.clusters.getById(objectId);
                    const clusterCenter = cluster.geometry.coordinates;

                    const currentZoom = myMap.getZoom();
                    const maxZoom = myMap.options.get('maxZoom') || 18;

                    if (currentZoom < maxZoom) {
                        myMap.setCenter(clusterCenter, currentZoom + 2, { duration: 300 });
                    }
                } else {
                    // Это одиночный объект
                    const geoObject = objectManager.objects.getById(objectId);
                    if (geoObject) {
                        const coords = geoObject.geometry.coordinates;
                        myMap.setCenter(coords, Math.min(myMap.getZoom() + 1, 17), { duration: 300 });
                    }
                }
            });
        });
});
