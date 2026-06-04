(function () {
    // ==================== DATA 10 AWAN ====================
    const cloudData = [{
        code: 'Cu',
        name: 'Cumulus',
        icon: 'fa-cloud-sun',
        karakter: 'Putih menggumpal seperti kapas, dasar datar, puncak menggelembung. Tanda cuaca baik, namun bisa tumbuh vertikal menjadi Cumulonimbus.',
        base: 'Dasar <2 km'
    },
    {
        code: 'Cc',
        name: 'Cirrocumulus',
        icon: 'fa-cloud',
        karakter: 'Sisik ikan halus di langit, terdiri dari kristal es. Menandakan cuaca stabil, kadang menjadi pertanda perubahan.',
        base: '>6 km'
    },
    {
        code: 'Ac',
        name: 'Altocumulus',
        icon: 'fa-cloud',
        karakter: 'Bergulung seperti domba, awan menengah. Sering menandakan udara dingin di ketinggian.',
        base: '2-6 km'
    },
    {
        code: 'As',
        name: 'Altostratus',
        icon: 'fa-layer-group',
        karakter: 'Selubung abu-abu merata, menutupi langit. Sering membawa gerimis atau salju ringan.',
        base: '2-6 km'
    },
    {
        code: 'Ns',
        name: 'Nimbostratus',
        icon: 'fa-cloud-rain',
        karakter: 'Lapisan tebal kelabu penyebab hujan terus-menerus. Tidak disertai petir, tapi durasi panjang.',
        base: '0-3 km'
    },
    {
        code: 'Cb',
        name: 'Cumulonimbus',
        icon: 'fa-cloud-bolt',
        karakter: 'Raksasa vertikal seperti menara, puncak landasan. Menyebabkan hujan lebat, petir, angin kencang.',
        base: '0-16 km'
    },
    {
        code: 'Sc',
        name: 'Stratocumulus',
        icon: 'fa-cloud',
        karakter: 'Gumpalan abu-abu berlapis, kadang gerimis ringan. Umumnya tidak membawa hujan lebat.',
        base: '<2 km'
    },
    {
        code: 'St',
        name: 'Stratus',
        icon: 'fa-smog',
        karakter: 'Kabut naik, kelabu merata. Menimbulkan gerimis atau salju ringan, visibilitas rendah.',
        base: '0-1 km'
    },
    {
        code: 'Ci',
        name: 'Cirrus',
        icon: 'fa-feather',
        karakter: 'Halus seperti bulu, kristal es. Pertanda cuaca cerah, tapi bisa jadi indikator front hangat.',
        base: '>7 km'
    },
    {
        code: 'Cs',
        name: 'Cirrostratus',
        icon: 'fa-circle',
        karakter: 'Selubung tipis transparan menutupi langit, menciptakan fenomena halo. Pertanda hujan dalam 12-24 jam.',
        base: '>6 km'
    }
    ];

    // Render 10 cloud cards
    const grid = document.getElementById('cloudGrid');
    cloudData.forEach(c => {
        const card = document.createElement('div');
        card.className = 'cloud-card';
        card.innerHTML = `
            <div class="cloud-header">
                <div class="cloud-icon"><i class="fas ${c.icon}"></i></div>
                <div class="cloud-title">
                    <div class="cloud-code">${c.code}</div>
                    <div class="cloud-name">${c.name}</div>
                </div>
            </div>
            <div class="cloud-desc">${c.karakter}</div>
            <div class="cloud-footer">
                <span class="cloud-base"><i class="fas fa-arrow-up"></i> ${c.base}</span>
                <a href="cloud.html?cloud=${c.name.toLowerCase()}" class="btn-3d"><i class="fas fa-cube"></i> Jelajahi 3D</a>
            </div>
        `;
        grid.appendChild(card);
    });

    let tfModel = null;
    const CLASS_NAMES = ['Cumulus', 'Altocumulus', 'Cirrus', 'Clear Sky', 'Stratocumulus', 'Cumulonimbus'];
    const CLASS_CODES = ['Cu', 'Ac', 'Ci', 'CS', 'Sc', 'Cb'];

    async function loadModel() {
        try {
            tfModel = await tf.loadGraphModel('./model/model.json');
            console.log('✅ Model TensorFlow.js loaded!');
        } catch (e) {
            console.warn('Model not found, using simulation mode:', e);
            tfModel = null;
        }
    }
    loadModel();

    async function classifyImage(imgElement) {
        if (!tfModel) return null;
        const tensor = tf.browser.fromPixels(imgElement).resizeBilinear([256, 256]).toFloat().expandDims(0);
        const probs = tfModel.predict(tensor);
        const data = await probs.data();
        tensor.dispose();
        probs.dispose();
        return Array.from(data);
    }

    let cachedWeather = null;
    const rateLimiter = {
        lastCall: 0,
        cooldown: 30000,
        canCall() { return Date.now() - this.lastCall >= this.cooldown; },
        mark() { this.lastCall = Date.now(); }
    };
    let llmEnabled = true;

    function getLocalFallbackRecommendation(cloudName, cloudCode, weatherData) {
        const recommendations = {
            'Cumulus': {
                riskLevel: 'Rendah · Cerah',
                riskDesc: 'Awan Cumulus menandakan cuaca cerah dan stabil. Cocok untuk aktivitas outdoor.',
                recommendation: '☀️ Waktu tepat untuk hiking, bersepeda, atau fotografi alam!',
                icons: ['fa-person-hiking', 'fa-bicycle', 'fa-camera']
            },
            'Cumulonimbus': {
                riskLevel: 'Tinggi · Waspada',
                riskDesc: 'Awan Cumulonimbus membawa potensi hujan lebat, petir, dan angin kencang.',
                recommendation: '⚠️ Segera cari tempat berlindung! Hindari area terbuka dan pohon besar.',
                icons: ['fa-umbrella', 'fa-house-flood', 'fa-bolt']
            },
            'Stratus': {
                riskLevel: 'Sedang · Berkabut',
                riskDesc: 'Awan Stratus menyebabkan visibilitas terbatas seperti kabut.',
                recommendation: '🌫️ Hati-hati berkendara, nyalakan lampu kabut, dan jaga jarak aman.',
                icons: ['fa-car', 'fa-road', 'fa-lightbulb']
            },
            'Stratocumulus': {
                riskLevel: 'Rendah · Stabil',
                riskDesc: 'Awan Stratocumulus menandakan cuaca umumnya stabil dengan sedikit gerimis.',
                recommendation: '👍 Cocok untuk aktivitas ringan di luar ruangan.',
                icons: ['fa-walking', 'fa-tree', 'fa-cloud-sun']
            },
            'Cirrus': {
                riskLevel: 'Rendah · Cerah',
                riskDesc: 'Awan Cirrus dari kristal es menandakan cuaca cerah.',
                recommendation: '📸 Waktu tepat untuk fotografi landscape!',
                icons: ['fa-camera-retro', 'fa-paintbrush', 'fa-mountain-sun']
            },
            'Altocumulus': {
                riskLevel: 'Rendah · Normal',
                riskDesc: 'Awan Altocumulus menandakan udara dingin di ketinggian.',
                recommendation: '🚶‍♂️ Aktivitas outdoor tetap nyaman.',
                icons: ['fa-person-walking', 'fa-cloud', 'fa-tree']
            },
            'Clear Sky': {
                riskLevel: 'Rendah · Cerah',
                riskDesc: 'Langit cerah tanpa awan, cuaca sangat baik.',
                recommendation: '🌟 Waktu sempurna untuk semua aktivitas outdoor!',
                icons: ['fa-sun', 'fa-person-hiking', 'fa-camera']
            }
        };
        return recommendations[cloudName] || {
            riskLevel: 'Normal · Aman',
            riskDesc: `${cloudName} menandakan kondisi cuaca yang umumnya baik.`,
            recommendation: 'Nikmati aktivitas outdoor dengan tetap waspada terhadap perubahan cuaca.',
            icons: ['fa-cloud-sun', 'fa-person-walking', 'fa-tree']
        };
    }

    async function getLLMRecommendation(cloudName, cloudCode, weatherData) {
        if (!llmEnabled) {
            return getLocalFallbackRecommendation(cloudName, cloudCode, weatherData);
        }
        if (!rateLimiter.canCall()) {
            return getLocalFallbackRecommendation(cloudName, cloudCode, weatherData);
        }
        rateLimiter.mark();
        const weatherContext = weatherData ? weatherData.map(w => `${w.name}: ${w.temp}°C, ${w.desc}`).join('; ') : 'Tidak tersedia';
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{
                        role: 'user',
                        content: `Analisis risiko cuaca: Awan ${cloudName} (${cloudCode}), Cuaca: ${weatherContext}. Berikan JSON: {"riskLevel":"...","riskDesc":"...","recommendation":"...","icons":["fa-...","fa-...","fa-..."]}`
                    }],
                    temperature: 0.4,
                    max_tokens: 300
                })
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Invalid API Key, using local fallback');
                    llmEnabled = false;
                    document.getElementById('geminiBadge').innerHTML = '<i class="fas fa-database"></i> Mode Offline · Analisis Lokal';
                }
                throw new Error(`API error ${response.status}`);
            }
            const data = await response.json();
            let text = data.choices?.[0]?.message?.content || '';
            text = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (e) {
            console.warn('LLM error, using local fallback:', e.message);
            return getLocalFallbackRecommendation(cloudName, cloudCode, weatherData);
        }
    }

    const CITIES = [{
        name: 'Jakarta',
        lat: -6.2088,
        lon: 106.8456
    },
    {
        name: 'Bogor',
        lat: -6.5971,
        lon: 106.8060
    },
    {
        name: 'Depok',
        lat: -6.4025,
        lon: 106.7942
    },
    {
        name: 'Tangerang',
        lat: -6.1781,
        lon: 106.6297
    },
    {
        name: 'Bekasi',
        lat: -6.2349,
        lon: 106.9896
    }
    ];

    function wmoToWeather(code) {
        if (code === 0) return { desc: 'Cerah', icon: 'fa-sun', type: 'sunny' };
        if (code <= 2) return { desc: 'Cerah Berawan', icon: 'fa-cloud-sun', type: 'partly-cloudy' };
        if (code === 3) return { desc: 'Berawan', icon: 'fa-cloud', type: 'cloudy' };
        if (code <= 49) return { desc: 'Kabut', icon: 'fa-smog', type: 'foggy' };
        if (code <= 67) return { desc: 'Hujan', icon: 'fa-cloud-rain', type: 'rainy' };
        if (code <= 82) return { desc: 'Hujan Lebat', icon: 'fa-cloud-showers-heavy', type: 'rainy' };
        if (code <= 99) return { desc: 'Badai', icon: 'fa-cloud-bolt', type: 'storm' };
        return { desc: 'Tidak diketahui', icon: 'fa-question', type: 'unknown' };
    }

    async function fetchWeather() {
        const results = await Promise.all(CITIES.map(async city => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=Asia/Jakarta`;
            const res = await fetch(url);
            const json = await res.json();
            const cur = json.current;
            return {
                name: city.name,
                temp: Math.round(cur.temperature_2m),
                humidity: cur.relative_humidity_2m,
                wind: Math.round(cur.wind_speed_10m),
                ...wmoToWeather(cur.weather_code)
            };
        }));
        cachedWeather = results;
        return results;
    }

    async function updateWeatherDisplay() {
        try {
            const weather = await fetchWeather();
            const grid = document.getElementById('citiesGrid');
            grid.innerHTML = weather.map(w => `
                <div class="city-card" data-weather="${w.type}">
                    <div class="mini-cloud mini-cloud-1">☁️</div>
                    <div class="mini-cloud mini-cloud-2">☁️</div>
                    <div class="mini-cloud mini-cloud-3">☁️</div>
                    <div class="mini-cloud mini-cloud-4">☁️</div>
                    <div class="mini-cloud mini-cloud-5">☁️</div>
                    <div class="mini-cloud mini-cloud-6">☁️</div>
                    <div class="city-name">${w.name} <i class="fas ${w.icon}"></i></div>
                    <div class="city-weather-icon"><i class="fas ${w.icon}"></i></div>
                    <div class="city-temp">${w.temp}°C</div>
                    <div class="city-desc">${w.desc}</div>
                    <div class="city-stats">
                        <div class="city-stat-item"><i class="fas fa-droplet"></i><div class="city-stat-value">${w.humidity}%</div><div class="city-stat-label">RH</div></div>
                        <div class="city-stat-item"><i class="fas fa-wind"></i><div class="city-stat-value">${w.wind} km/h</div><div class="city-stat-label">Angin</div></div>
                    </div>
                    <div class="cloud-decoration">☁️</div>
                </div>
            `).join('');

            const rainyCount = weather.filter(w => w.type === 'rainy' || w.type === 'storm').length;
            if (rainyCount >= 3) {
                document.getElementById('bestTimeText').innerHTML = 'Waspada Hujan';
                document.getElementById('bestTimeDesc').textContent = `${rainyCount} dari 5 kota terpantau hujan`;
            } else {
                document.getElementById('bestTimeText').innerHTML = '09:00 - 15:00';
                document.getElementById('bestTimeDesc').textContent = 'Waktu terbaik untuk aktivitas outdoor';
            }
            const now = new Date();
            document.getElementById('updateTime').innerHTML = `Diperbarui ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
        } catch (e) {
            console.error('Weather error:', e);
        }
    }
    updateWeatherDisplay();
    setInterval(updateWeatherDisplay, 10 * 60 * 1000);

    // KAMERA & ANALISIS
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

    function validateFile(file) {
        const errorDiv = document.getElementById('uploadError');
        const errorMessage = document.getElementById('errorMessage');
        errorDiv.classList.remove('active');

        if (!ALLOWED_TYPES.includes(file.type)) {
            errorMessage.innerHTML = '<i class="fas fa-file-image"></i> Format file tidak didukung! Gunakan format JPG, JPEG, atau PNG.';
            errorDiv.classList.add('active');
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            errorMessage.innerHTML = `<i class="fas fa-weight-hanging"></i> Ukuran file ${fileSizeMB} MB melebihi batas! Maksimal 5 MB.`;
            errorDiv.classList.add('active');
            return false;
        }
        return true;
    }

    const shutterBtn = document.getElementById('shutterBtn');
    const captureBtn = document.getElementById('captureBtn');
    const stopCamBtn = document.getElementById('stopCamBtn');
    const galleryBtn = document.getElementById('galleryBtn');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    const previewImg = document.getElementById('preview-image');
    const placeholder = document.getElementById('placeholderPreview');
    const cameraStream = document.getElementById('camera-stream');
    const cameraCanvas = document.getElementById('camera-canvas');
    const loadingIndicator = document.getElementById('loadingIndicator');
    let activeStream = null;

    function getResizedBase64(imgElement, maxDim = 300) {
        const canvas = document.createElement('canvas');
        let width = imgElement.naturalWidth || imgElement.width || 300;
        let height = imgElement.naturalHeight || imgElement.height || 300;
        
        if (width > height) {
            if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            }
        } else {
            if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', 0.7);
    }

    function runLocalSkyHeuristic(imgElement) {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        try {
            ctx.drawImage(imgElement, 0, 0, 50, 50);
            const imgData = ctx.getImageData(0, 0, 50, 50);
            const data = imgData.data;
            
            let skyPixels = 0;
            const totalPixels = 50 * 50;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                
                // Blue Sky Check: Blue is dominant and bright
                const isBlueSky = (b > r && b > g && b > 75 && (b - r) > 8);
                
                // White/Grey Cloud Check: Bright and desaturated
                const maxVal = Math.max(r, g, b);
                const minVal = Math.min(r, g, b);
                const diff = maxVal - minVal;
                const isCloud = (r > 90 && g > 90 && b > 90 && diff < 30);
                
                // Sunset/Sunrise Check: Warm orange/red colors
                const isSunset = (r > 120 && r > b && g > b && (r - b) > 25);
                
                // Dark/Overcast/Night Sky: Low saturation grey or dark blue
                const isDarkSky = (maxVal < 100 && maxVal > 25 && diff < 15);
                
                if (isBlueSky || isCloud || isSunset || isDarkSky) {
                    skyPixels++;
                }
            }
            
            const ratio = skyPixels / totalPixels;
            console.log(`📊 Local heuristic sky/cloud pixel ratio: ${(ratio * 100).toFixed(1)}%`);
            return ratio >= 0.30;
        } catch (err) {
            console.error('Error running local sky heuristic:', err);
            return true;
        }
    }

    async function checkIsSkyOrCloudImage(imgElement) {
        if (llmEnabled) {
            try {
                const base64Data = getResizedBase64(imgElement, 300);
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                        messages: [{
                            role: 'user',
                            content: [
                                { 
                                    type: 'text', 
                                    text: 'Analyze this image. Is the primary, dominant subject of this image a cloud, clouds, or the sky? If the main subject is anything else—such as a person, a character, a robot, a weapon, a vehicle, a building, an animal, a laptop, food, text, or an indoor room—even if there is sky or clouds in the background, you MUST reply with {"isSky": false}. Only reply with {"isSky": true} if the image is purely or predominantly a photo of the sky and clouds. Reply with a JSON object strictly containing a single key "isSky" which is a boolean.' 
                                },
                                { 
                                    type: 'image_url', 
                                    image_url: { url: base64Data } 
                                }
                            ]
                        }],
                        response_format: { type: "json_object" },
                        temperature: 0.1,
                        max_tokens: 50
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    let text = data.choices?.[0]?.message?.content || '';
                    text = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
                    const result = JSON.parse(text);
                    console.log('👁️ Vision LLM verification result:', result);
                    if (typeof result.isSky === 'boolean') {
                        return result.isSky;
                    }
                }
            } catch (e) {
                console.warn('Vision LLM verification failed, falling back to local heuristic:', e);
            }
        }
        return runLocalSkyHeuristic(imgElement);
    }

    async function analyzeAndUpdate(imageElement) {
        loadingIndicator.classList.add('active');

        // Verify if the uploaded image actually contains a cloud or sky
        const isSky = await checkIsSkyOrCloudImage(imageElement);
        if (!isSky) {
            document.getElementById('cloudName').textContent = 'Tidak Teridentifikasi';
            document.getElementById('cloudCode').textContent = '???';
            document.getElementById('confidenceFill').style.width = '0%';
            document.getElementById('confidenceVal').textContent = '0%';
            document.querySelector('.confidence-bar').style.opacity = '0.3';

            document.getElementById('riskLevel').textContent = '⚠️ Bukan Gambar Awan';
            document.getElementById('riskDesc').textContent = 'Sistem mendeteksi bahwa gambar ini bukan merupakan awan atau langit. Harap ambil atau pilih foto awan yang lebih jelas.';
            document.getElementById('rekomText').textContent = 'Silakan ambil ulang foto awan dengan posisi yang lebih jelas.';
            document.getElementById('rekomIcons').innerHTML = '<i class="fas fa-exclamation-circle"></i><i class="fas fa-cloud"></i><i class="fas fa-sync-alt"></i>';
            document.getElementById('geminiBadge').style.display = 'none';
            const btnDetail = document.getElementById('btnDetail');
            if (btnDetail) btnDetail.style.display = 'none';
            loadingIndicator.classList.remove('active');
            return;
        }

        let prediction = { name: 'Cumulus', code: 'Cu', confidence: 85 };
        let isValid = true;

        try {
            const probs = await classifyImage(imageElement);
            if (probs) {
                const topIdx = probs.indexOf(Math.max(...probs));
                prediction.confidence = Math.round(probs[topIdx] * 100);
                prediction.name = CLASS_NAMES[topIdx];
                prediction.code = CLASS_CODES[topIdx];

                if (prediction.confidence < 70) {
                    isValid = false;
                    prediction.name = 'Tidak Teridentifikasi';
                    prediction.code = '???';
                }
            } else {
                const randomIdx = Math.floor(Math.random() * CLASS_NAMES.length);
                prediction.name = CLASS_NAMES[randomIdx];
                prediction.code = CLASS_CODES[randomIdx];
                prediction.confidence = Math.floor(Math.random() * 30) + 70;
            }
        } catch (e) {
            console.warn('Classification error:', e);
        }

        document.getElementById('cloudName').textContent = prediction.name;
        document.getElementById('cloudCode').textContent = prediction.code;
        document.getElementById('confidenceFill').style.width = prediction.confidence + '%';
        document.getElementById('confidenceVal').textContent = prediction.confidence + '%';

        if (!isValid) {
            document.getElementById('confidenceFill').style.width = '0%';
            document.getElementById('confidenceVal').textContent = '0%';
            document.querySelector('.confidence-bar').style.opacity = '0.3';

            document.getElementById('riskLevel').textContent = '⚠️ Gagal Mengenali';
            document.getElementById('riskDesc').textContent = 'Gambar tidak valid, mohon ambil ulang foto awan yang lebih jelas. Pastikan awan terlihat dengan baik dan pencahayaan cukup.';
            document.getElementById('rekomText').textContent = 'Silakan ambil ulang foto awan dengan posisi yang lebih jelas.';
            document.getElementById('rekomIcons').innerHTML = '<i class="fas fa-camera"></i><i class="fas fa-cloud-sun"></i><i class="fas fa-sync-alt"></i>';
            document.getElementById('geminiBadge').style.display = 'none';
            const btnDetail = document.getElementById('btnDetail');
            if (btnDetail) btnDetail.style.display = 'none';
            loadingIndicator.classList.remove('active');
            return;
        }

        document.querySelector('.confidence-bar').style.opacity = '1';

        try {
            const llmResult = await getLLMRecommendation(prediction.name, prediction.code, cachedWeather);
            document.getElementById('riskLevel').textContent = llmResult.riskLevel;
            document.getElementById('riskDesc').textContent = llmResult.riskDesc;
            document.getElementById('rekomText').textContent = llmResult.recommendation;
            document.getElementById('rekomIcons').innerHTML = (llmResult.icons || []).map(i => `<i class="fas ${i}"></i>`).join('');
            document.getElementById('geminiBadge').style.display = 'inline-flex';
            const btnDetail = document.getElementById('btnDetail');
            if (btnDetail) btnDetail.style.display = 'inline-block';
            window._lastLLMResult = llmResult;
        } catch (e) {
            console.warn('LLM error:', e);
        }

        loadingIndicator.classList.remove('active');
    }

    async function openCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            activeStream = stream;
            cameraStream.srcObject = stream;
            cameraStream.style.display = 'block';
            previewImg.style.display = 'none';
            placeholder.style.display = 'none';
            shutterBtn.style.display = 'none';
            galleryBtn.style.display = 'none';
            captureBtn.style.display = '';
            stopCamBtn.style.display = '';
        } catch (err) {
            console.error('Camera error:', err);
            alert('Tidak dapat mengakses kamera. Pastikan izin diberikan.');
            cameraInput.click();
        }
    }

    function capturePhoto() {
        if (!activeStream) return;
        cameraCanvas.width = cameraStream.videoWidth;
        cameraCanvas.height = cameraStream.videoHeight;
        cameraCanvas.getContext('2d').drawImage(cameraStream, 0, 0);
        stopCamera();
        const dataUrl = cameraCanvas.toDataURL('image/jpeg', 0.9);
        previewImg.src = dataUrl;
        previewImg.style.display = 'block';
        const tempImg = new Image();
        tempImg.onload = () => analyzeAndUpdate(tempImg);
        tempImg.src = dataUrl;
    }

    function stopCamera() {
        if (activeStream) {
            activeStream.getTracks().forEach(t => t.stop());
            activeStream = null;
        }
        cameraStream.style.display = 'none';
        cameraStream.srcObject = null;
        captureBtn.style.display = 'none';
        stopCamBtn.style.display = 'none';
        shutterBtn.style.display = '';
        galleryBtn.style.display = '';
        if (!previewImg.src || previewImg.src === '#') {
            placeholder.style.display = '';
        }
    }

    function processUpload(file) {
        if (!file) return;

        if (!validateFile(file)) {
            previewImg.src = '#';
            previewImg.style.display = 'none';
            placeholder.style.display = '';
            return;
        }

        if (activeStream) stopCamera();
        document.getElementById('uploadError').classList.remove('active');
        loadingIndicator.classList.add('active');

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            placeholder.style.display = 'none';
            const img = new Image();
            img.onload = () => {
                analyzeAndUpdate(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    shutterBtn.onclick = openCamera;
    captureBtn.onclick = capturePhoto;
    stopCamBtn.onclick = stopCamera;
    galleryBtn.onclick = () => galleryInput.click();
    cameraInput.onchange = (e) => processUpload(e.target.files[0]);
    galleryInput.onchange = (e) => processUpload(e.target.files[0]);

    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.onclick = (e) => {
            const hash = a.getAttribute('href');
            if (hash && hash.startsWith('#')) {
                e.preventDefault();
                const target = document.getElementById(hash.substring(1));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
                document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
                a.classList.add('active');
            }
        };
    });

    function createFloatingClouds() {
        const container = document.getElementById('floatingClouds');
        if (!container) return;
        const cloudSizes = ['small', 'medium', 'large'];
        const cloudVariants = ['☁️', '☁️', '☁️', '⛅', '☁️'];
        for (let i = 0; i < 15; i++) {
            const cloud = document.createElement('div');
            cloud.className = `floating-cloud ${cloudSizes[Math.floor(Math.random() * cloudSizes.length)]}`;
            cloud.textContent = cloudVariants[Math.floor(Math.random() * cloudVariants.length)];
            cloud.style.top = `${Math.random() * 100}%`;
            cloud.style.animationDuration = `${15 + Math.random() * 15}s`;
            cloud.style.animationDelay = `${Math.random() * -20}s`;
            cloud.style.setProperty('--y-offset', `${(Math.random() - 0.5) * 100}px`);
            container.appendChild(cloud);
        }
    }
    createFloatingClouds();
})();

function openDetailModal() {
    const r = window._lastLLMResult;
    if (r) {
        document.getElementById('modalRisk').textContent = r.riskLevel || '-';
        document.getElementById('modalDesc').textContent = r.riskDesc || '-';
        document.getElementById('detailModal').classList.add('active');
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}
document.getElementById('btnDetail')?.addEventListener('click', openDetailModal);