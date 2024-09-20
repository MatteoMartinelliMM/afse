@echo off
REM Installazione dipendenze nella cartella principale
echo Installazione delle dipendenze nella cartella principale...
call npm install

REM Avvio del server nella cartella principale
echo Avvio del server principale...
start cmd /k "npm start"

REM Attendere qualche secondo per assicurarsi che il server principale sia avviato
timeout /t 5 /nobreak >nul

REM Spostamento nella cartella frontend
echo Spostamento nella cartella frontend...
cd frontend

REM Installazione dipendenze nella cartella frontend
echo Installazione delle dipendenze nella cartella frontend...
call npm install

REM Avvio del server nella cartella frontend
echo Avvio del server frontend...
start cmd /k "npm start"

echo Tutti i server sono stati avviati correttamente.
pause
