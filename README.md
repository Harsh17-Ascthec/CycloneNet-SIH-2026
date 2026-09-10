---
title: CycloneNet - Tropical Cyclone Analysis System
emoji: 🌀
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# CycloneNet — AI-Driven Tropical Cyclone Analysis System

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID:** 26070  
> **Organization:** Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)  
> **Category:** Software  
> **Theme:** Disaster Management & Space Technology  

CycloneNet is an end-to-end operational decision-support system for automated **Tropical Cyclone Detection**, **Intensity Classification (IMD 7-Stage Scale)**, and **Numerical Wind Speed Estimation** from satellite Infrared (IR) imagery.

---

## 1. Project Information

- **Project Title:** CycloneNet — AI-Powered Tropical Cyclone Detection & Intensity Classification
- **PS ID:** 26070
- **PS Title:** Identification and Classification of Tropical Cyclones using Satellite Imagery
- **Category:** Software
- **Theme:** Disaster Management / Meteorology (Ministry of Earth Sciences & IMD)

---

## 2. Problem Statement

Tropical cyclones pose severe threats to coastal populations, maritime operations, and infrastructure across the North Indian Ocean basin (Bay of Bengal and Arabian Sea). Manual Dvorak analysis of satellite imagery is time-intensive and reliant on expert meteorologists. During rapid intensification (RI), delays in analyzing storm eyewall formation and gale wind radii can hinder timely coastal evacuation and disaster response.

---

## 3. Proposed Solution

CycloneNet provides a real-time, automated deep learning pipeline that ingests satellite infrared (IR) imagery and delivers:
1. **Binary Detection:** Automatically verifies whether a significant cyclonic circulation is present.
2. **Dual-Branch Polar CNN Feature Extraction:** Deconstructs spatial rainband patterns in Cartesian space while unwrapping the core eyewall in Polar coordinates to evaluate rotational vortex symmetry.
3. **Multi-Parameter Meteorological Output:** Delivers intensity classification (Depression to Super Cyclone), sustained wind speeds (knots & km/h), Atkinson-Holliday barometric central pressure ($P_c$), and concentric wind radii ($R_{34}, R_{50}, R_{64}$).
4. **Geospatial Coastal Advisory:** Visualizes the storm on an interactive satellite map with dynamic impact swaths and district-level alert advisories.

---

## 4. Key Features

- **Two-Stage Hierarchical AI Pipeline:** Binary system verification followed by multi-task classification and regression.
- **Dual-Branch Polar CNN:** Captures both linear feeder bands and rotational eyewall convection.
- **Out-of-Distribution (OOD) Guardrail:** Statistically inspects input entropy, color variance, and cel-shading to block non-satellite images (e.g., cartoons, selfies, screenshots).
- **Atkinson-Holliday Pressure Estimation:** Formulates central barometric pressure ($P_c$) from maximum sustained wind speeds.
- **Modified Rankine Vortex Wind Swaths:** Maps gale-force ($R_{34}$), storm-force ($R_{50}$), and destructive hurricane core ($R_{64}$) radii.
- **Interactive Geospatial Dashboard:** Full-viewport satellite map (Esri World Imagery + CartoDB Labels) with a top-left minimized thumbnail overlay.
- **High-Throughput API:** Sub-120 ms CPU inference powered by FastAPI and PyTorch.

---

## 5. Technology Stack

- **Frontend:** HTML5, Modern CSS3 (Glassmorphism & Grid), Vanilla JavaScript (ES6+), Google Fonts (Inter)
- **Geospatial Mapping:** Leaflet.js v1.9.4, Esri ArcGIS World Imagery, CartoDB Voyager Labels
- **Backend API:** Python 3.12+, FastAPI, Uvicorn (ASGI)
- **Deep Learning Framework:** PyTorch (`torch`, `torchvision`), Dual-Branch Polar CNN
- **Scientific Computing & Preprocessing:** OpenCV (`cv2`), Pillow (`PIL`), NumPy, SciPy
- **Deployment & Tooling:** Docker, Virtualenv, RESTful JSON Microservices

---

## 6. Architecture

Detailed technical architecture, data pipeline, and mathematical formulations are documented in [docs/architecture.md](docs/architecture.md).

```text
User / Meteorologist
       |
       v
Frontend Web Interface (HTML5 / CSS3 / Leaflet.js)
       |
       | HTTP POST /predict (Multipart Stream)
       v
Backend API Tier (FastAPI + Uvicorn)
       |
       +---> Out-of-Distribution (OOD) Guardrail Engine
       |        | (Rejects non-satellite imagery)
       |
       +---> Dual-Branch Polar CNN (PyTorch)
       |        | (Cartesian Rainbands + Polar Eyewall Fusion)
       |
       +---> Meteorological Physics Engine
                | Atkinson-Holliday WPR: Central Pressure (hPa)
                | Modified Rankine Vortex: Wind Radii (R34 / R50 / R64)
                | IMD Coastal Warning Matrix
       |
       v
Structured JSON Response -> Interactive Geospatial Map & Minimized Overlay
```

---

## 7. Repository Structure

```text
CycloneNet/
├── README.md                      # Main project documentation & overview
├── SUBMISSION_GUIDE.md            # SIH 2026 repository submission checklist
├── LICENSE                        # MIT open-source license
├── requirements.txt               # Pinned Python dependencies
├── .gitignore                     # Git exclusions (virtualenvs, cache, large weights)
├── submission/                    # Final hackathon submission materials
│   ├── PRESENTATION.md            # Link / reference to final PPT presentation
│   └── DEMO.md                    # Link to prototype demo video
├── docs/                          # Technical specifications
│   └── architecture.md            # Detailed system architecture & physics equations
├── assets/                        # Static media & screenshots
│   └── screenshots/
│       └── README.md              # Screenshot catalog & guidelines
├── backend/                       # Backend API & AI Inference
│   ├── app.py                     # FastAPI application routes & static mounts
│   ├── model.py                   # PyTorch Dual-Branch Polar CNN & OOD filter
│   ├── requirements.txt           # Backend dependencies
│   └── trained cyclone model.pth  # Model weights bundle [download link in docs]
├── frontend/                      # Original Dark-Mode Meteorological Dashboard
│   ├── index.html                 # Main interface
│   ├── style.css                  # Dark radar styles
│   └── script.js                  # Frontend async handlers
└── alt_frontend/                  # Alternate Light-Slate Geospatial Dashboard
    ├── index.html                 # Hero map & floating minimized card layout
    ├── style.css                  # Slate-grey modern styling
    └── script.js                  # Dynamic card minimization & Leaflet binding
```

### What goes where?

| Item | Location |
|---|---|
| Main Documentation | `README.md` |
| Technical Architecture | `docs/architecture.md` |
| Final Presentation PPT | `submission/PRESENTATION.md` |
| Video Demo Link | `submission/DEMO.md` |
| UI Screenshots | `assets/screenshots/` |
| Backend & AI Inference | `backend/` |
| Web Dashboards | `frontend/` & `alt_frontend/` |
| Dependencies | `requirements.txt` |

---

## 8. Final Presentation

Keep your final SIH presentation in the repository whenever the file size allows it (< 25 MB).

See [submission/PRESENTATION.md](submission/PRESENTATION.md) for the required format and cloud backup link.

---

## 9. Demo Video

A working prototype demo video is strongly recommended.

Add your YouTube or Google Drive link in [submission/DEMO.md](submission/DEMO.md).

---

## 10. Screenshots / Prototype Photos

High-resolution screenshots showing the interface, cyclone detection banner, wind swaths, and minimized card overlay are located in:

`assets/screenshots/`

See [assets/screenshots/README.md](assets/screenshots/README.md) for screenshot descriptions and naming conventions.

---

## 11. Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/CycloneNet.git
cd CycloneNet
```

### 2. Set Up Virtual Environment
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 12. Run

### Start the Application
Run the Uvicorn ASGI server from the repository root:

```bash
python -m uvicorn backend.app:app --reload --port 8000
```

### Access Dashboards in Browser
* **Alternate Light-Mode Dashboard (Hero Map + Minimized Card):**  
  👉 **`http://localhost:8000/alt`**
* **Original Dark-Mode Cockpit Dashboard:**  
  👉 **`http://localhost:8000/`**
* **Interactive OpenAPI Docs:**  
  👉 **`http://localhost:8000/docs`**

---

## 13. Future Scope

1. **Multi-Temporal Sequence Modeling:** Incorporating temporal satellite video sequences (ConvLSTM / Video Transformers) to forecast 24h, 48h, and 72h landfall trajectories.
2. **Doppler Weather Radar (DWR) Fusion:** Fusing INSAT-3D/3DR infrared feeds with coastal Doppler radar reflectivity for precise precipitation nowcasting.
3. **Disaster Management Early-Warning Alerts:** Direct Webhook / SMS alerting integration with NDMA (National Disaster Management Authority) and State Relief Commissioners.
4. **Edge Deployment:** Quantizing weights to ONNX / TensorRT for deployment on maritime reconnaissance vessels and coastal UAVs.

---

## Important

Before submitting your repository link to the SIH portal, verify:
- No passwords, private API keys, or `.env` files are committed.
- All dependencies install without conflicts via `pip install -r requirements.txt`.
- Your final PPT and video links in `submission/` are public and accessible to reviewers.
