// intermediary_api.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; 

// --- BUFFER ---
let eventBuffer = [];

// Middlewares
app.use(cors());
app.use(express.json()); 

// --- ENDPOINTs ---
app.post('/api/events', (req, res) => {
    const eventData = req.body;
    if (!eventData || Object.keys(eventData).length === 0) {
        return res.status(400).json({ error: 'Brak danych w ciele żądania.' });
    }

    // add id and timestamp
    const newEvent = {
        id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        receivedAt: new Date().toISOString(),
        ...eventData
    };
    
    eventBuffer.push(newEvent);
    
    console.log(`[+] Otrzymano nowe zdarzenie od ${eventData.agentID}. Aktualny rozmiar bufora: ${eventBuffer.length}`);
    res.status(201).json({ message: 'Zdarzenie przyjęte.', eventId: newEvent.id });
});

// --- POLLING ---

app.get('/api/events/new', (req, res) => {
    if (eventBuffer.length === 0) {
        // empty buffer
        return res.status(200).json([]);
    }

    console.log(`[*] Żądanie pobrania danych. Wysyłanie ${eventBuffer.length} zdarzeń...`);

    // copy and send 
    const dataToSend = [...eventBuffer];
    
    // clear boffer
    eventBuffer = [];
    
    console.log(`[!] Bufor wyczyszczony.`);
    res.status(200).json(dataToSend);
});

// test endpoint
app.get('/', (req, res) => {
    res.send(`Serwer pośredniczący dla BlockAudit działa. Zdarzeń w buforze: ${eventBuffer.length}`);
});

app.listen(PORT, () => {
    console.log(`✅ Serwer pośredniczący nasłuchuje na porcie ${PORT}`);
});