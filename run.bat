@echo off
setlocal
cd /d %~dp0

if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv
  .venv\Scripts\python.exe -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
)

.venv\Scripts\python.exe manage.py migrate --run-syncdb
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
