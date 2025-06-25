npm install express cors// intermediary_api.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Użyjmy innego portu niż 3000, aby uniknąć konfliktu

// --- TYMCZASOWY BUFOR W PAMIĘCI ---
// UWAGA: Ta tablica zostanie zresetowana przy każdym restarcie serwera!
// To jest proste rozwiązanie zgodne z Twoją prośbą.
let eventBuffer = [];

// Middlewares
app.use(cors()); // Zezwalaj na żądania z innych domen
app.use(express.json()); // Parsuj przychodzące JSONy

// --- ENDPOINT DLA AGENTÓW WINDOWS ---
// Agent będzie wysyłał dane tutaj
app.post('/api/events', (req, res) => {
    const eventData = req.body;
    if (!eventData || Object.keys(eventData).length === 0) {
        return res.status(400).json({ error: 'Brak danych w ciele żądania.' });
    }

    // Dodajemy do danych unikalne ID i znacznik czasu otrzymania
    const newEvent = {
        id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        receivedAt: new Date().toISOString(),
        ...eventData
    };
    
    eventBuffer.push(newEvent);
    
    console.log(`[+] Otrzymano nowe zdarzenie od ${eventData.agentID}. Aktualny rozmiar bufora: ${eventBuffer.length}`);
    res.status(201).json({ message: 'Zdarzenie przyjęte.', eventId: newEvent.id });
});

// --- ENDPOINT DLA TWOJEJ LOKALNEJ MASZYNY (POLLING) ---
// Twój lokalny skrypt będzie odpytywał ten endpoint
app.get('/api/events/new', (req, res) => {
    if (eventBuffer.length === 0) {
        // Jeśli bufor jest pusty, nie ma nic do wysłania
        return res.status(200).json([]);
    }

    console.log(`[*] Żądanie pobrania danych. Wysyłanie ${eventBuffer.length} zdarzeń...`);

    // Kopiujemy zawartość bufora, aby wysłać ją do klienta
    const dataToSend = [...eventBuffer];
    
    // Czyścimy bufor, ponieważ dane zostały "pobrane"
    eventBuffer = [];
    
    console.log(`[!] Bufor wyczyszczony.`);
    res.status(200).json(dataToSend);
});

// Prosty endpoint sprawdzający, czy serwer działa
app.get('/', (req, res) => {
    res.send(`Serwer pośredniczący dla BlockAudit działa. Zdarzeń w buforze: ${eventBuffer.length}`);
});

app.listen(PORT, () => {
    console.log(`✅ Serwer pośredniczący nasłuchuje na porcie ${PORT}`);
});