# Room Pro Analytics

Gyerekszobai kornyezeti naplo es alvasmonitor prototipus.

Az app jelenleg mock adatokkal fut GitHub Pages-en. A cel egy ESP32 alapu szenzorallomas adatainak visszanezheto, nyugodt, kontextusalapu megjelenitese.

## Funkciok

- Dashboard kartyak aktualis ertekekkel
- Chart.js alapu idosoros grafikon
- Kozepso playhead az index alapu idopont-kivalasztashoz
- Spektrum nezet
- Manualis esemenyek rogzitese a playhead alatti adatsor-indexhez
- Alap PWA manifest es service worker

## Tervezett adatmodell

```json
{
  "t": 22.4,
  "h": 48.2,
  "l": 2.3,
  "n": 18,
  "m": false,
  "ts": 1710000000
}
```

## Kovetkezo lepesek

1. Firebase Realtime Database integracio.
2. Manualis esemenyek RTDB-be mentese.
3. ESP32 firmware BME280, BH1750, MAX4466 es SW-420 szenzorokhoz.
4. CSV es JSON export.
