# Hardware bekotesi terv - V1 MVP

## Cel

ESP32 DevKit V1 alapu gyerekszobai kornyezeti monitor:

- BME280: homerseklet, paratartalom, legnyomas
- BH1750 / GY-30: fenyerosseg luxban
- MAX4466: relativ zajszint
- SW-420 / VIB-SEN-NC: mozgas vagy rezges esemeny

## Fontos szabalyok

- Az ESP32 GPIO pinek 3.3V logikat varnak. 5V jelet ne koss kozvetlenul GPIO-ra.
- A BME280 es BH1750 modulokat 3.3V-rol jarasd.
- A MAX4466 modult 3.3V-rol jarasd, hogy az analog OUT ne menjen ESP32 ADC szint fole.
- Minden modul GND-je legyen kozos az ESP32 GND-vel.
- USB tap eleg az MVP-hez.

## Javasolt ESP32 pinek

| Funkcio | Modul pin | ESP32 pin |
| --- | --- | --- |
| I2C SDA | BME280 SDA + BH1750 SDA | GPIO 21 |
| I2C SCL | BME280 SCL + BH1750 SCL | GPIO 22 |
| 3.3V tap | BME280 VCC + BH1750 VCC + MAX4466 VCC + SW-420 VCC | 3V3 |
| Fold | minden modul GND | GND |
| Mikrofon analog jel | MAX4466 OUT | GPIO 34 |
| Rezges digitalis jel | SW-420 DO | GPIO 27 |

## Reszletes bekotes

### BME280

| BME280 | ESP32 |
| --- | --- |
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

Megjegyzes: a legtobb GY-BME280-3.3 modul I2C cime `0x76` vagy `0x77`.

### BH1750 / GY-30

| BH1750 | ESP32 |
| --- | --- |
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |
| ADDR | GND vagy szabadon hagyva |

Megjegyzes: a tipikus I2C cim `0x23`. Ha az ADDR magas szinten van, lehet `0x5C`.

### MAX4466 mikrofon

| MAX4466 | ESP32 |
| --- | --- |
| VCC | 3V3 |
| GND | GND |
| OUT | GPIO 34 |

Megjegyzes: GPIO 34 csak bemenet, ADC mereshez jo valasztas.

### SW-420 / VIB-SEN-NC rezges modul

| SW-420 | ESP32 |
| --- | --- |
| VCC | 3V3 |
| GND | GND |
| DO | GPIO 27 |

Megjegyzes: a modul potmeteret ugy allitsd, hogy normal nyugalmi allapotban ne villogjon folyamatosan, de apro mozditasra mar valtson.

## Breadboard sorrend

1. ESP32 USB-n meg nincs bedugva.
2. Koss egy kozos GND sort a breadboardon.
3. Koss egy kozos 3.3V sort a breadboardon.
4. BME280 es BH1750 menjenek azonos I2C buszra:
   - SDA: GPIO 21
   - SCL: GPIO 22
5. MAX4466 OUT menjen GPIO 34-re.
6. SW-420 DO menjen GPIO 27-re.
7. Ellenorizd meg egyszer, hogy nincs 5V a szenzorokon.
8. Csak ezutan dugd ra USB-re az ESP32-t.

## I2C ellenorzes

Az elso firmware lepese egy I2C scanner legyen. Elvart eszkozok:

- BME280: `0x76` vagy `0x77`
- BH1750: `0x23` vagy `0x5C`

Ha csak az egyik latszik:

- ellenorizd az SDA/SCL sorrendet
- ellenorizd a 3.3V es GND bekotest
- probald meg kulon-kulon a ket I2C modult

## Szenzor elhelyezesi javaslat

- BME280: ne legyen kozvetlenul az ESP32 vagy tapmelegedes mellett.
- BH1750: a szoba fele nezzen, ne kozvetlenul LED-re vagy ablakra.
- MAX4466: legyen nyitott, ne takarja dobozfal.
- SW-420: akkor hasznos, ha stabil feluleten van, peldaul polcon vagy hazon belul rogzitve.

## Kovetkezo lepes

Miutan a bekotes kesz, johet az elso ESP32 teszt firmware:

1. I2C scanner.
2. BME280 olvasas.
3. BH1750 olvasas.
4. MAX4466 analog mintavetel.
5. SW-420 digitalis allapot figyeles.
