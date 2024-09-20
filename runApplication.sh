#!/bin/bash
echo "Installazione delle dipendenze backend..."
npm install
echo "Avvio del server principale..."
npm start &
sleep 5
echo "Spostamento nella cartella frontend..."
cd frontend
echo "Installazione delle dipendenze nella cartella frontend..."
npm install
echo "Avvio del server frontend..."
npm start &
wait

echo "Tutti i server sono stati avviati correttamente."