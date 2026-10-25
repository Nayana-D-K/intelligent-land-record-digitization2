# intelligent-land-record-digitization2
# Intelligent Land Record Digitization and Validation System

## Setup Instructions

### Prerequisites

Install the following before starting:

- Python 3.12 or a compatible Python version
- Git
- Visual Studio Code

### 1. Clone the Repository

Open PowerShell or the VS Code terminal and run:

```powershell
git clone https://github.com/Nayana-D-K/intelligent-land-record-digitization2.git
cd intelligent-land-record-digitization2
code .
```

### 2. Create a Virtual Environment

```powershell
python -m venv .venv
```

### 3. Activate the Virtual Environment

For Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install Dependencies

If the repository contains a `requirements.txt` file, run:

```powershell
python -m pip install -r requirements.txt
```

### 5. Verify Python

```powershell
python --version
python -m pip --version
```

### 6. Open the Project

Open the cloned folder in VS Code and explore the following directories:

- `src/ocr/` — OCR processing engines (EasyOCR, standard BaseOCREngine)
- `src/preprocess/` — image preprocessing routines (Grayscale, CLAHE, Otsu, Adaptive, 3x bicubic upscale)
- `src/extraction/` — information extraction
- `src/confidence/` — confidence scoring
- `src/validation/` — validation logic
- `config/config.yaml` — centralized system configuration
- `data/raw/rtc_samples/` — sample input documents
- `tests/` — automated unit and integration tests

### 7. Run the Project and Tests

Run the relevant Python entry points or test suite after completing configuration:

**Run the Baseline Preprocessing & OCR Pipeline:**
```powershell
python -m src.baseline
```

**Run OCR Quantitative Evaluation (CER / WER):**
```powershell
python -m src.evaluate_ocr
```

**Run Unit Tests:**
```powershell
python -m pytest tests/ -v
```

### 8. Configuration

System-wide settings (OCR engines, confidence thresholds, preprocessing parameters, and directory paths) are configured in `config/config.yaml`.
The system dynamically loads configuration with fallback defaults via `src/config.py`.

### Troubleshooting

**Python is not recognized**

Install Python and enable the option to add Python to PATH, then reopen the terminal.

**Virtual environment activation fails**

Try running:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

**Dependencies are missing**

Activate `.venv` and install the required packages.

**Note:** Do not commit `.venv/` to GitHub. Create a new virtual environment after cloning the repository.
