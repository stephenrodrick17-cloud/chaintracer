# 🔗 ChainTracker (PS11 Crypto Analyzer)

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-blue?style=for-the-badge)](https://xgboost.readthedocs.io/)

**ChainTracker** is a sophisticated cryptocurrency transaction analysis tool designed to detect illicit activities in the Bitcoin network. Using an ensemble of Machine Learning models (Random Forest and XGBoost) and the **Elliptic Dataset**, it provides real-time risk scoring, transaction tracing, and network visualization.

---

## 🚀 Key Features

- **🧠 Machine Learning Ensemble**: Combined Random Forest and XGBoost models for high-accuracy classification of Bitcoin transactions.
- **📊 Interactive Visualization**: 
  - **Network Graphs**: Dynamic transaction flow visualization using [Cytoscape.js](https://js.cytoscape.org/).
  - **Statistical Insights**: Time-series analysis and feature importance charts using [Recharts](https://recharts.org/).
- **🔍 Deep Transaction Analysis**:
  - Risk prediction for over 200,000 transactions from the Elliptic dataset.
  - Explainable AI (XAI) using feature importance rankings.
- **🛡️ Real-world Integration**: Built-in support for live Bitcoin address lookup and abuse reporting integration (BitcoinAbuse API).
- **📝 Automated Reporting**: Generate detailed PDF reports for transaction investigations using [jsPDF](https://github.com/parallax/jsPDF).

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Python)
- **ML Engine**: Scikit-Learn, XGBoost, SHAP
- **Data Processing**: Pandas, NumPy, Joblib
- **Database**: SQLite (SQLAlchemy)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Visualization**: [Cytoscape.js](https://js.cytoscape.org/), [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```text
chaintracker/
├── backend/                # FastAPI Application
│   ├── data/               # CSV Datasets (Elliptic)
│   ├── database/           # SQLite models & db config
│   ├── models/             # Pre-trained .pkl and .npy files
│   ├── modules/            # Core logic (ML, Graph, APIs)
│   ├── routers/            # API Endpoints
│   └── main.py             # App entry point
├── frontend/               # React Application
│   ├── dist/               # Production build
│   ├── package.json        # Dependencies
│   └── vite.config.js      # Vite configuration
├── README.md               # You are here!
└── .gitignore              # Optimized for GitHub
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Git**

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Dataset & Models

The system utilizes the **Elliptic Data Set**, one of the largest graph datasets of the Bitcoin network. 
- **Transactions**: 203,769 nodes
- **Features**: 166 features per transaction (94 local, 72 aggregate)
- **Classes**: Illicit (Class 1), Licit (Class 2), Unknown

> **Note**: Large dataset files (`.csv`) and trained model binaries (`.pkl`) are excluded from version control for repository size optimization. Please ensure they are placed in `backend/data/` and `backend/models/` respectively.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Contributors

- **Ayush** - *Lead Developer*

---

*Built with ❤️ for the future of Secure Crypto Analysis.*
