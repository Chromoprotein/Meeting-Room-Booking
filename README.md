# Kokoushuoneiden varaussivu

Yksinkertainen kokoushuoneiden varaussivu visuaalisella kalenterilla.

## Ominaisuuksiin kuuluu:
- 1-3 tunnin pituisen ajan voi valita klikkaamalla aikaruutuja
- kalenterissa näkyy vapaat ajat (tasatunneittain) viikko kerrallaan
- varatun ajan voi perua tunnuskoodilla
- estää päällekkäiset tai menneisyydessä olevat varaukset
- selkeät viestit varauksen tai peruutuksen onnistumisesta

## Tech stack:
- Frontend: React, Typescript, Tailwind CSS
- Backend: Python, FastAPI, Pydantic
- In-memory storage

## Kuinka ajaa projekti
Juuresta: 
npm install
npm run dev
Tämä käynnistää: Fast API backend (port 8000), React frontend (port 3000), Tailwind CSS watcher
Avaa http://localhost:3000 selaimessa.
Node.js ja Python 3.10+ vaaditaan.

## Design-huomautukset:
- Varaukset on rajoitettu täysiin tunteihin ja tähän vuoteen realistisen yksinkertaistamisen vuoksi
- Varausten peruminen käyttää lyhyitä koodeja uuid:n sijasta käyttäjäystävällisyyden takia
- Koodi on jaettu osiin, mm. services, hooks, uudelleenkäytettävät komponentit