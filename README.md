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

If dependencies have not yet been listed in that file, install the required packages specified by the project instead.

### 5. Verify Python

```powershell
python --version
python -m pip --version
```

### 6. Open the Project

Open the cloned folder in VS Code and explore the following directories:

- `src/ocr/` — OCR processing
- `src/preprocess/` — image preprocessing
- `src/extraction/` — information extraction
- `src/confidence/` — confidence scoring
- `src/validation/` — validation logic
- `data/raw/rtc_samples/` — sample input documents
- `tests/` — tests

### 7. Run the Project

Run the relevant Python entry point after completing the required configuration and dependency installation.

For example, if `src/baseline.py` is configured as a standalone script:

```powershell
python -m src.baseline
```

For OCR evaluation, if its dependencies and input paths are configured:

```powershell
python -m src.evaluate_ocr
```

Check the project configuration and script requirements before running these commands.

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
