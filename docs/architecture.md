# CycloneNet — System Architecture

## 1. High-Level Architectural Flow

```text
               +-----------------------------------------+
               |        Meteorologist / Operator         |
               +-----------------------------------------+
                                    |
                                    | Uploads Satellite IR Image (JPG/PNG/TIFF)
                                    v
               +-----------------------------------------+
               |   Frontend Tier (HTML5, CSS3, JS ES6)   |
               |   • Interactive Leaflet.js Geospatial Map|
               |   • Dynamic Wind Radii & Coastal Alerts |
               +-----------------------------------------+
                                    |
                                    | HTTP POST /predict (Multipart Stream)
                                    v
               +-----------------------------------------+
               |       Backend API Tier (FastAPI)        |
               |   • Request Validation & In-Memory Read |
               +-----------------------------------------+
                                    |
                                    v
               +-----------------------------------------+
               |     Out-of-Distribution (OOD) Guard     |
               |   • Color Entropy & Continuous Gradients|
               |   • Edge Density & Flat Cel-Shading Test|
               +-----------------------------------------+
                     /                             \
     [Rejected Non-Satellite]               [Authentic Satellite IR]
                   /                                   \
                  v                                     v
         HTTP 400 Bad Request          +-----------------------------------------+
        "Non-satellite graphic"        |     Dual-Branch Polar CNN (PyTorch)     |
                                       |  Branch A: Cartesian Spatial Rainbands  |
                                       |  Branch B: Polar Unwrapped Eyewall Feats|
                                       +-----------------------------------------+
                                                            |
                                                            v
                                       +-----------------------------------------+
                                       |   Meteorological Physics Engine         |
                                       |   • Atkinson-Holliday WPR (Pressure)   |
                                       |   • Modified Rankine Vortex (R34/50/64) |
                                       |   • IMD 7-Stage Intensity Scale        |
                                       |   • Coastal District Advisory Matrix    |
                                       +-----------------------------------------+
                                                            |
                                                            | Structured JSON Payload
                                                            v
                                       +-----------------------------------------+
                                       |   Frontend Visualization & Mapping      |
                                       |   • Top-Left Minimized Preview Overlay  |
                                       |   • Esri Satellite Map + CartoDB Labels |
                                       +-----------------------------------------+
```

---

## 2. Component Descriptions

### 1. Presentation & Geospatial Tier (Frontend)
- **Tech Stack:** HTML5, Modern CSS3 (Glassmorphism, CSS Grid, Flexbox), Vanilla JavaScript (ES6+).
- **Interactive Mapping:** Powered by **Leaflet.js v1.9.4** utilizing Esri World Imagery (high-resolution satellite tiles) and CartoDB Voyager labels.
- **Dynamic Minimization:** When an image is analyzed, the upload card smoothly shrinks to the top-left corner of the map, revealing the geospatial storm tracking behind it. Users can click to expand/clear at any time.

### 2. Application & Serving Tier (Backend)
- **Tech Stack:** **FastAPI** running on **Uvicorn** (ASGI asynchronous worker).
- **Asynchronous Processing:** Multi-part file uploads are parsed in-memory without disk write delays.
- **Dual UI Support:** Serves both default dark-theme and alternate light-slate dashboard interfaces.

### 3. Out-of-Distribution (OOD) Guardrail Engine
- **Purpose:** Prevents adversarial, corrupted, or non-satellite images (cartoons, selfies, web graphics) from producing false cyclone predictions.
- **Evaluation Criteria:**
  - Unique continuous color thresholding.
  - Cel-shading / flat color area detection.
  - Spatial edge density and channel variance.

### 4. Machine Learning & Core AI Tier (PyTorch)
- **Model Architecture:** **Dual-Branch Polar CNN**
  - **Cartesian Branch:** Convolutional feature extraction of regional cloud textures, spiral feeder bands, and cirrus outflow.
  - **Polar Branch:** Coordinates are transformed into polar format $(r, \theta)$ to evaluate eyewall circular symmetry and rotational vortex sharpness.
  - **Fusion Layer:** Combines spatial and rotational embeddings to jointly predict intensity classification and continuous numerical wind speed.

### 5. Domain Science & Meteorological Formulations
- **Central Barometric Pressure ($P_c$):** Estimated using the Atkinson-Holliday Wind-Pressure Relationship:
  $$P_c = 1010 - \left(\frac{V_{\max}}{3.92}\right)^{1.4} \text{ hPa}$$
- **Wind Radii ($R_{34}, R_{50}, R_{64}$):** Calculated using the Modified Rankine Vortex model to demarcate gale-force winds, damaging winds, and the extreme eyewall destruction core.
- **Coastal Impact Advisory:** Maps storm radii and proximity to regional Indian coastal zones to provide multi-hazard warnings (Red / Orange / Yellow).
