@echo off

echo Creating virtual environment...
python -m venv env

echo Activating virtual environment...
call env\Scripts\activate

echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Running database migrations...
alembic upgrade head

echo Setup complete!
echo.
echo Running backend tests...
set PYTHONPATH=.
pytest --cov=app tests/

echo.
echo Setup finished successfully!
echo Run backend using: run_backend.bat