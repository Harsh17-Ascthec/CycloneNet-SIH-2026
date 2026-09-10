/**
 * CycloneNet Alternate Frontend — Handles image upload, pre-analysis preview,
 * API calls, geospatial interactive map, and result displays.
 */

// ── DOM Elements ─────────────────────────────────────────────────────────────

const uploadArea         = document.getElementById("uploadArea");
const fileInput          = document.getElementById("fileInput");
const browseBtn          = document.getElementById("browseBtn");
const preAnalysisSection = document.getElementById("preAnalysisSection");
const prePreviewImage    = document.getElementById("prePreviewImage");
const preClearBtn        = document.getElementById("preClearBtn");
const heroMapSection     = document.getElementById("heroMapSection");
const previewContainer   = document.getElementById("previewContainer");
const previewImage       = document.getElementById("previewImage");
const toggleSizeBtn      = document.getElementById("toggleSizeBtn");
const clearBtn           = document.getElementById("clearBtn");
const analyzeBtn         = document.getElementById("analyzeBtn");
const resultsSection     = document.getElementById("resultsSection");
const errorMessage       = document.getElementById("errorMessage");
const errorText          = document.getElementById("errorText");

let selectedFile = null;
let mapInstance = null;

// ── File Upload Handlers ─────────────────────────────────────────────────────

// Click to browse
if (browseBtn) {
    browseBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        fileInput.click();
    });
}

if (uploadArea) {
    uploadArea.addEventListener("click", () => {
        fileInput.click();
    });

    uploadArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadArea.classList.add("drag-over");
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("drag-over");
    });

    uploadArea.addEventListener("drop", (event) => {
        event.preventDefault();
        uploadArea.classList.remove("drag-over");
        const file = event.dataTransfer.files[0];
        if (file) handleFileSelected(file);
    });
}

// File selected via file input
if (fileInput) {
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) handleFileSelected(file);
    });
}

// Clear buttons
if (preClearBtn) {
    preClearBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        resetUpload();
    });
}

if (clearBtn) {
    clearBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        resetUpload();
    });
}

// Toggle Size Button on Map Overlay
if (toggleSizeBtn) {
    toggleSizeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (previewContainer.classList.contains("minimized")) {
            previewContainer.classList.remove("minimized");
            previewContainer.classList.add("expanded");
        } else {
            previewContainer.classList.remove("expanded");
            previewContainer.classList.add("minimized");
        }
        if (mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 350);
        }
    });
}

// Clicking the minimized preview card on map expands it back
if (previewContainer) {
    previewContainer.addEventListener("click", (event) => {
        if (event.target.closest("#clearBtn") || 
            event.target.closest("#toggleSizeBtn") || 
            event.target.closest("#analyzeBtn")) {
            return;
        }
        if (previewContainer.classList.contains("minimized")) {
            previewContainer.classList.remove("minimized");
            previewContainer.classList.add("expanded");
            if (mapInstance) {
                setTimeout(() => mapInstance.invalidateSize(), 350);
            }
        }
    });
}

// Clicking outside expanded preview container minimizes it back
document.addEventListener("click", (event) => {
    if (previewContainer && previewContainer.classList.contains("expanded")) {
        if (!previewContainer.contains(event.target) && resultsSection && resultsSection.style.display !== "none") {
            previewContainer.classList.remove("expanded");
            previewContainer.classList.add("minimized");
            if (mapInstance) {
                setTimeout(() => mapInstance.invalidateSize(), 350);
            }
        }
    }
});

// Analyze button
if (analyzeBtn) {
    analyzeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (selectedFile) runPrediction(selectedFile);
    });
}

// ── File Handling ────────────────────────────────────────────────────────────

function handleFileSelected(file) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/bmp", "image/tiff"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|bmp|tif|tiff)$/i)) {
        showError("Invalid file type. Please upload a JPG, PNG, BMP, or TIFF image.");
        return;
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError("File too large. Maximum size is 10 MB.");
        return;
    }

    selectedFile = file;
    hideError();

    // Show pre-analysis preview
    const reader = new FileReader();
    reader.onload = (event) => {
        if (prePreviewImage) prePreviewImage.src = event.target.result;
        if (previewImage) previewImage.src = event.target.result;

        if (uploadArea) uploadArea.style.display = "none";
        if (preAnalysisSection) preAnalysisSection.style.display = "block";
        if (heroMapSection) heroMapSection.style.display = "none";
        if (resultsSection) resultsSection.style.display = "none";
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    selectedFile = null;
    if (fileInput) fileInput.value = "";
    if (prePreviewImage) prePreviewImage.src = "";
    if (previewImage) previewImage.src = "";

    if (preAnalysisSection) preAnalysisSection.style.display = "none";
    if (heroMapSection) heroMapSection.style.display = "none";
    if (resultsSection) resultsSection.style.display = "none";
    if (uploadArea) uploadArea.style.display = "block";

    if (previewContainer) {
        previewContainer.classList.remove("expanded");
        previewContainer.classList.add("minimized");
    }

    hideError();

    // Clear dynamic map layers
    if (mapInstance) {
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Circle || layer instanceof L.Marker) {
                mapInstance.removeLayer(layer);
            }
        });
    }
}

// ── API Call ──────────────────────────────────────────────────────────────────

async function runPrediction(file) {
    const btnText    = analyzeBtn.querySelector(".btn-text");
    const btnLoading = analyzeBtn.querySelector(".btn-loading");
    if (btnText) btnText.style.display = "none";
    if (btnLoading) btnLoading.style.display = "inline";
    analyzeBtn.disabled = true;
    hideError();

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/predict", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Server error: ${response.status}`);
        }

        const result = await response.json();
        displayResults(result);

    } catch (error) {
        showError(error.message || "Failed to connect to the server. Is the backend running?");
    } finally {
        if (btnText) btnText.style.display = "inline";
        if (btnLoading) btnLoading.style.display = "none";
        analyzeBtn.disabled = false;
    }
}

// ── Display Results ──────────────────────────────────────────────────────────

function displayResults(result) {
    if (preAnalysisSection) {
        preAnalysisSection.style.display = "none";
    }

    if (result.is_cyclone) {
        if (heroMapSection) {
            heroMapSection.style.display = "block";
        }
        if (previewContainer) {
            previewContainer.classList.remove("expanded");
            previewContainer.classList.add("minimized");
        }
        renderCycloneMap(result);
    } else {
        if (heroMapSection) {
            heroMapSection.style.display = "none";
        }
    }

    if (resultsSection) {
        resultsSection.style.display = "block";
    }

    // ── Detection status ──────────────────────────────────────────────────
    const detectionStatus = document.getElementById("detectionStatus");
    if (detectionStatus) {
        if (result.is_cyclone) {
            detectionStatus.className = "detection-status cyclone-yes";
            detectionStatus.innerHTML = `
                <img src="/alt_static/cyclone_pinpoint.png?v=alpha" class="detection-icon-img" alt="Cyclone Detected">
                <div>Cyclonic System Detected</div>
            `;
        } else {
            detectionStatus.className = "detection-status cyclone-no";
            detectionStatus.innerHTML = `
                <span class="detection-emoji">✅</span>
                <div>No Significant Cyclonic Activity Detected</div>
            `;
        }
    }

    // ── Classification ────────────────────────────────────────────────────
    const classNameEl = document.getElementById("className");
    const confidenceEl = document.getElementById("confidence");
    if (classNameEl) classNameEl.textContent = result.class_name;
    if (confidenceEl) confidenceEl.textContent = `${result.confidence}% confidence`;

    // Probability bars
    const probabilityBars = document.getElementById("probabilityBars");
    if (probabilityBars && result.all_probabilities) {
        probabilityBars.innerHTML = "";
        for (const [cName, probability] of Object.entries(result.all_probabilities)) {
            const row = document.createElement("div");
            row.className = "prob-row";
            row.innerHTML = `
                <span class="prob-label">${cName}</span>
                <div class="prob-bar-bg">
                    <div class="prob-bar-fill" style="width: 0%"></div>
                </div>
                <span class="prob-value">${probability}%</span>
            `;
            probabilityBars.appendChild(row);

            setTimeout(() => {
                const fill = row.querySelector(".prob-bar-fill");
                if (fill) fill.style.width = `${probability}%`;
            }, 100);
        }
    }

    // ── Wind speed ────────────────────────────────────────────────────────
    const windKtEl  = document.getElementById("windKt");
    const windKmhEl = document.getElementById("windKmh");
    if (windKtEl)  windKtEl.textContent  = result.wind_speed_kt;
    if (windKmhEl) windKmhEl.textContent = result.wind_speed_kmh;

    const severityBadge = document.getElementById("severityBadge");
    if (severityBadge) {
        severityBadge.textContent = result.severity_level;

        if (result.wind_speed_kt >= 120) {
            severityBadge.style.background = "rgba(156, 39, 176, 0.15)";
            severityBadge.style.color      = "#7e22ce";
            severityBadge.style.borderColor = "rgba(156, 39, 176, 0.25)";
        } else if (result.wind_speed_kt >= 90) {
            severityBadge.style.background = "rgba(244, 67, 54, 0.15)";
            severityBadge.style.color      = "#dc2626";
            severityBadge.style.borderColor = "rgba(244, 67, 54, 0.25)";
        } else if (result.wind_speed_kt >= 64) {
            severityBadge.style.background = "rgba(255, 87, 34, 0.15)";
            severityBadge.style.color      = "#ea580c";
            severityBadge.style.borderColor = "rgba(255, 87, 34, 0.25)";
        } else if (result.wind_speed_kt >= 48) {
            severityBadge.style.background = "rgba(255, 152, 0, 0.15)";
            severityBadge.style.color      = "#d97706";
            severityBadge.style.borderColor = "rgba(255, 152, 0, 0.25)";
        } else if (result.wind_speed_kt >= 28) {
            severityBadge.style.background = "rgba(255, 193, 7, 0.15)";
            severityBadge.style.color      = "#ca8a04";
            severityBadge.style.borderColor = "rgba(255, 193, 7, 0.25)";
        } else {
            severityBadge.style.background = "rgba(76, 175, 80, 0.15)";
            severityBadge.style.color      = "#16a34a";
            severityBadge.style.borderColor = "rgba(76, 175, 80, 0.25)";
        }
    }

    // ── Highlight active row in IMD scale ─────────────────────────────────
    const scaleRows = document.querySelectorAll(".scale-row");
    scaleRows.forEach(row => {
        row.classList.remove("active");
        const threshold = parseInt(row.dataset.threshold);
        if (result.wind_speed_kt < 28 && threshold === 28) {
            row.classList.add("active");
        } else if (result.wind_speed_kt >= 28 && result.wind_speed_kt < 34 && threshold === 34) {
            row.classList.add("active");
        } else if (result.wind_speed_kt >= 34 && result.wind_speed_kt < 48 && threshold === 48) {
            row.classList.add("active");
        } else if (result.wind_speed_kt >= 48 && result.wind_speed_kt < 64 && threshold === 64) {
            row.classList.add("active");
        } else if (result.wind_speed_kt >= 64 && result.wind_speed_kt < 90 && threshold === 90) {
            row.classList.add("active");
        } else if (result.wind_speed_kt >= 90 && result.wind_speed_kt < 120 && threshold === 120) {
            row.classList.add("active");
        } else if (result.wind_speed_kt >= 120 && threshold === 999) {
            row.classList.add("active");
        }
    });

    // ── Pressure & Rain Parameters ─────────────────────────────────────────
    const pressureHpaEl = document.getElementById("pressureHpa");
    if (pressureHpaEl && result.central_pressure_hpa) {
        pressureHpaEl.textContent = result.central_pressure_hpa;
    }
    if (result.precipitation) {
        const rainRateEl  = document.getElementById("rainRate");
        const rain24hEl   = document.getElementById("rain24h");
        const rainBadgeEl = document.getElementById("rainBadge");
        if (rainRateEl)  rainRateEl.textContent  = result.precipitation.rain_rate_mm_hr;
        if (rain24hEl)   rain24hEl.textContent   = result.precipitation.peak_24h_mm;
        if (rainBadgeEl) rainBadgeEl.textContent = result.precipitation.rain_alert;
    }

    // ── Coastal Threat Zones ───────────────────────────────────────────────
    const threatList = document.getElementById("threatZonesList");
    if (threatList) {
        threatList.innerHTML = "";
        if (result.affected_zones && result.affected_zones.length > 0) {
            result.affected_zones.forEach(zone => {
                const item = document.createElement("div");
                item.className = "threat-item";
                let badgeClass = "badge-yellow";
                if (zone.status.includes("Red")) badgeClass = "badge-red";
                else if (zone.status.includes("Orange")) badgeClass = "badge-orange";

                item.innerHTML = `
                    <div class="threat-info">
                        <h4>${zone.zone}</h4>
                        <p class="threat-desc">${zone.threat}</p>
                    </div>
                    <span class="threat-badge ${badgeClass}">${zone.status}</span>
                `;
                threatList.appendChild(item);
            });
        }
    }

    // Smooth scroll down to detection card
    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
        const detectionCard = document.getElementById("detectionCard");
        if (detectionCard) {
            detectionCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, 300);
}

// ── Geospatial Map Logic ──────────────────────────────────────────────────────

function initDefaultMap() {
    if (mapInstance) return;
    const mapElement = document.getElementById("cycloneMap");
    if (!mapElement) return;

    mapInstance = L.map("cycloneMap", {
        minZoom: 3,
        maxZoom: 18
    }).setView([16.5, 86.8], 5);

    // 100% Free Open-Access Map Tiles (No API key required)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
        maxZoom: 18,
        noWrap: true
    }).addTo(mapInstance);

    // Add sleek labels
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
        attribution: '',
        maxZoom: 18,
        noWrap: true
    }).addTo(mapInstance);
}

function renderCycloneMap(result) {
    if (!result.is_cyclone || !result.geo_position) {
        if (heroMapSection) heroMapSection.style.display = "none";
        return;
    }
    if (heroMapSection) heroMapSection.style.display = "block";

    initDefaultMap();
    if (!mapInstance) return;

    // Clear previous dynamic layers (circles and markers)
    mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Circle || layer instanceof L.Marker) {
            mapInstance.removeLayer(layer);
        }
    });

    const lat = result.geo_position.lat || 16.5;
    const lon = result.geo_position.lon || 86.8;

    const coordsEl = document.getElementById("mapCoords");
    if (coordsEl) {
        coordsEl.textContent = `Lat: ${lat.toFixed(1)}° N, Lon: ${lon.toFixed(1)}° E • ${result.geo_position.basin}`;
    }

    mapInstance.setView([lat, lon], 6);

    // Draw Wind Radii Swaths (R34, R50, R64 in meters)
    const radii = result.wind_radii_km || {};

    // 1. R34 Gale Radius (Outer Yellow Warning)
    if (radii.r34_gale) {
        L.circle([lat, lon], {
            radius: radii.r34_gale * 1000,
            color: '#ffca28',
            fillColor: '#ffca28',
            fillOpacity: 0.14,
            weight: 1.5,
            dashArray: '4, 4'
        }).bindPopup(`<b>R34 Gale Radius</b>: ${radii.r34_gale} km<br>Gale force winds ≥ 34 kt`).addTo(mapInstance);
    }

    // 2. R50 Storm Radius (Middle Orange Swath)
    if (radii.r50_storm) {
        L.circle([lat, lon], {
            radius: radii.r50_storm * 1000,
            color: '#ff7043',
            fillColor: '#ff7043',
            fillOpacity: 0.20,
            weight: 2
        }).bindPopup(`<b>R50 Storm Radius</b>: ${radii.r50_storm} km<br>Destructive winds ≥ 50 kt`).addTo(mapInstance);
    }

    // 3. R64 Hurricane Core (Inner Red Eyewall)
    if (radii.r64_core) {
        L.circle([lat, lon], {
            radius: radii.r64_core * 1000,
            color: '#ef5350',
            fillColor: '#ef5350',
            fillOpacity: 0.32,
            weight: 2.5
        }).bindPopup(`<b>R64 Core Eyewall</b>: ${radii.r64_core} km<br>Extreme destruction ≥ 64 kt`).addTo(mapInstance);
    }

    // Fixed Eye Marker (Locked at detected storm coordinates)
    const eyeIcon = L.divIcon({
        html: '<img src="/alt_static/cyclone_pinpoint.png?v=alpha" class="cyclone-spin-inner" alt="Cyclone Eye">',
        className: 'cyclone-eye-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
    });

    L.marker([lat, lon], { icon: eyeIcon, draggable: false })
        .bindPopup(`<b>${result.severity_level}</b><br>Wind: ${result.wind_speed_kt} kt (${result.wind_speed_kmh} km/h)<br>Pressure: ${result.central_pressure_hpa} hPa`)
        .addTo(mapInstance)
        .openPopup();

    mapInstance.off('click');

    setTimeout(() => {
        mapInstance.invalidateSize();
        mapInstance.panTo([lat, lon]);
    }, 250);
}

// ── Error Handling ───────────────────────────────────────────────────────────

function showError(message) {
    if (errorText) errorText.textContent = message;
    if (errorMessage) errorMessage.style.display = "flex";
}

function hideError() {
    if (errorMessage) errorMessage.style.display = "none";
}
