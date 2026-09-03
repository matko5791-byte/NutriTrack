# 🥗 NutriTrack

**NutriTrack** je full-stack web aplikacija za praćenje prehrane i tjelesne težine. Korisnicima omogućuje izračun dnevnih energetskih potreba, unos obroka iz baze namirnica, praćenje unosa kalorija i makronutrijenata te vizualizaciju promjene tjelesne težine kroz vrijeme.

Projekt je izrađen kao završni rad prediplomskog studija, s ciljem primjene znanja iz izrade modernih web aplikacija korištenjem **Angular** frontend framworka i **Node.js/Express** backend servisa uz **MongoDB** bazu podataka.

## 📋 Sadržaj

- [Značajke](#-značajke)
- [Tehnologije](#-tehnologije)
- [Struktura projekta](#-struktura-projekta)
- [Preduvjeti](#-preduvjeti)
- [API dokumentacija](#-api-dokumentacija)
- [Deployment](#-deployment)
- [Autor](#-autor)

## ✨ Značajke

- **Registracija i prijava korisnika** uz autentifikaciju putem JWT tokena i sigurno hashiranje lozinki (bcrypt)
- **Izrada profila** – unos spola, dobi, visine, težine, razine tjelesne aktivnosti i cilja (mršavljenje / povećanje mišićne mase / održavanje)
- **Automatski izračun kalorijskih potreba** – BMR (bazalni metabolizam) i TDEE (ukupna dnevna potrošnja energije) prema Mifflin-St Jeor formuli, s dnevnim ciljem kalorija prilagođenim odabranom cilju (deficit/suficit/održavanje)
- **Baza namirnica** – pregled i pretraga postojećih namirnica te dodavanje vlastitih (kalorije, proteini, ugljikohidrati, masti, sol na 100 g)
- **Jedinice mjere (servings)** – unos obroka u gramima ili u praktičnim jedinicama (npr. "1 srednja jabuka"), uz mogućnost dodavanja i brisanja vlastitih jedinica po namirnici
- **Preporuke namirnica prema cilju** – lista namirnica sortirana po gustoći proteina (mišićna masa), kalorijskoj gustoći (mršavljenje) ili omjeru proteina i kalorija (održavanje)
- **Dnevnik obroka** – unos pojedene količine namirnice i automatski izračun nutritivnih vrijednosti
- **Pregled dnevnog unosa** – usporedba unesenih kalorija/makronutrijenata s dnevnim ciljem
- **Praćenje tjelesne težine** – unos nove težine i prikaz trenda kroz graf s označenim kilogramima (y-os) i datumima unosa (x-os)
- **Ažuriranje profila** – promjena razine aktivnosti i cilja uz ponovni izračun kalorijskog cilja
- **Zaštićene rute** – pristup stranicama ograničen je isključivo prijavljenim korisnicima (Angular route guard), dok su prijavljenim korisnicima obrnuto blokirane stranice za prijavu, registraciju i početni unos profila (ako je već popunjen)

## 🛠 Tehnologije

### Frontend (`client/`)
- [Angular 19](https://angular.dev/)
- TypeScript
- [ng-bootstrap](https://ng-bootstrap.github.io/) + [Bootstrap 5](https://getbootstrap.com/)
- RxJS

### Backend (`server/`)
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (native driver)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) – autentifikacija
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) – hashiranje lozinki
- [nodemon](https://www.npmjs.com/package/nodemon) – automatsko ponovno pokretanje servera tijekom razvoja

## 📁 Struktura projekta

```
NutriTrack/
├── client/                  # Angular aplikacija (frontend)
│   └── src/app/
│       ├── core/            # Modeli, servisi, guard-ovi i interceptori
│       ├── pages/           # Stranice (login, register, home, meal-log, profile...)
│       └── shared/          # Zajedničke komponente (navbar, graf težine...)
└── server/                  # Express API (backend)
    ├── routes/               # API rute (auth, profile, foods, meal-entries, weight)
    ├── middleware/           # Autentifikacijski middleware
    ├── utils/                # Pomoćne funkcije (izračun kalorija)
    └── data/                 # Početni (seed) podaci o namirnicama i jedinicama mjere
```

## ✅ Preduvjeti

Prije pokretanja projekta potrebno je instalirati:

- [Node.js](https://nodejs.org/) (v18 ili novije)
- [MongoDB](https://www.mongodb.com/try/download/community) (lokalno instaliran i pokrenut, ili konekcija na MongoDB Atlas)

##  API dokumentacija

Sve rute (osim registracije i prijave) zahtijevaju autentifikaciju putem `Authorization: Bearer <token>` zaglavlja.

| Metoda | Ruta                     | Opis                                           |
|--------|--------------------------|------------------------------------------------|
| POST   | `/api/auth/register`     | Registracija novog korisnika                   |
| POST   | `/api/auth/login`        | Prijava korisnika                              |
| GET    | `/api/auth/me`           | Dohvat podataka o prijavljenom korisniku       |
| GET    | `/api/profile/me`        | Dohvat profila korisnika                       |
| PUT    | `/api/profile/me`        | Kreiranje/ažuriranje profila                   |
| DELETE | `/api/profile/me`        | Brisanje profila                               |
| GET    | `/api/weight`            | Dohvat povijesti tjelesne težine               |
| POST   | `/api/weight`            | Unos nove izmjere težine                       |
| GET    | `/api/foods`             | Dohvat liste namirnica (uključujući dostupne jedinice mjere) |
| POST   | `/api/foods`             | Dodavanje vlastite namirnice                   |
| POST   | `/api/foods/:foodId/servings` | Dodavanje vlastite jedinice mjere za namirnicu |
| DELETE | `/api/foods/:foodId/servings/:servingId` | Brisanje vlastite jedinice mjere       |
| GET    | `/api/meal-entries`      | Dohvat unesenih obroka za današnji dan         |
| POST   | `/api/meal-entries`      | Unos novog obroka                              |
| DELETE | `/api/meal-entries/:id`  | Brisanje unesenog obroka                       |

## 🚢 Deployment

Projekt je pripremljen za deployment na [Render](https://render.com) putem `render.yaml` blueprinta u korijenu repozitorija:

- **`nutritrack-api`** – Node web servis (`server/`)
- **`nutritrack-client`** – statička stranica (`client/`)

## 👤 Autor

Matko Dragičević
