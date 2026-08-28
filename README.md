# 🥗 NutriTrack

**NutriTrack** je full-stack web aplikacija za praćenje prehrane i tjelesne težine. Korisnicima omogućuje izračun dnevnih energetskih potreba, unos obroka iz baze namirnica, praćenje unosa kalorija i makronutrijenata te vizualizaciju promjene tjelesne težine kroz vrijeme.

Projekt je izrađen kao završni rad prediplomskog studija, s ciljem primjene znanja iz izrade modernih web aplikacija korištenjem **Angular** frontend framworka i **Node.js/Express** backend servisa uz **MongoDB** bazu podataka.

## 📋 Sadržaj

- [Značajke](#-značajke)
- [Tehnologije](#-tehnologije)
- [Struktura projekta](#-struktura-projekta)
- [Preduvjeti](#-preduvjeti)
- [Pokretanje projekta](#-pokretanje-projekta)
- [Konfiguracija okoline](#-konfiguracija-okoline)
- [API dokumentacija](#-api-dokumentacija)
- [Autor](#-autor)

## ✨ Značajke

- **Registracija i prijava korisnika** uz autentifikaciju putem JWT tokena i sigurno hashiranje lozinki (bcrypt)
- **Izrada profila** – unos spola, dobi, visine, težine i razine tjelesne aktivnosti
- **Automatski izračun kalorijskih potreba** – BMR (bazalni metabolizam) i TDEE (ukupna dnevna potrošnja energije) prema Mifflin-St Jeor formuli, s preporučenim dnevnim ciljem kalorija
- **Baza namirnica** – pregled i pretraga postojećih namirnica te dodavanje vlastitih (kalorije, proteini, ugljikohidrati, masti, sol na 100 g)
- **Dnevnik obroka** – unos pojedene količine namirnice u gramima i automatski izračun nutritivnih vrijednosti
- **Pregled dnevnog unosa** – usporedba unesenih kalorija/makronutrijenata s dnevnim ciljem
- **Praćenje tjelesne težine** – unos nove težine i prikaz trenda kroz graf
- **Ažuriranje profila** – promjena razine aktivnosti uz ponovni izračun kalorijskog cilja
- **Zaštićene rute** – pristup stranicama ograničen je isključivo prijavljenim korisnicima (Angular route guard)

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
    └── data/                 # Početni (seed) podaci o namirnicama
```

## ✅ Preduvjeti

Prije pokretanja projekta potrebno je instalirati:

- [Node.js](https://nodejs.org/) (v18 ili novije)
- [MongoDB](https://www.mongodb.com/try/download/community) (lokalno instaliran i pokrenut, ili konekcija na MongoDB Atlas)

## 🚀 Pokretanje projekta

### 1. Kloniranje repozitorija

```bash
git clone <url-repozitorija>
cd NutriTrack
```

### 2. Pokretanje backend servera

```bash
cd server
npm install
npx nodemon
```

Server se pokreće na `http://localhost:3000`. Prilikom prvog pokretanja automatski se popunjava kolekcija namirnica (`foods`) početnim podacima iz `data/foods.seed.js`.

### 3. Pokretanje frontend aplikacije

U novom terminalu:

```bash
cd client
npm install
ng serve
```

Aplikacija je dostupna na `http://localhost:4200`. Zahtjevi prema `/api` automatski se preusmjeravaju (proxy) na backend server.

## ⚙️ Konfiguracija okoline

Backend koristi varijable okoline koje se postavljaju u `.env` datoteci unutar `server/` mape. Primjer sadržaja:

| Varijabla    | Opis                                       |
|--------------|--------------------------------------------|
| `PORT`       | Port na kojem server sluša                 |
| `MONGO_URL`  | Adresa MongoDB baze                        |
| `DB_NAME`    | Naziv baze podataka                        |
| `JWT_SECRET` | Tajni ključ za potpisivanje JWT tokena     |

> ⚠️ Za produkcijsko okruženje obavezno postavite vlastitu, sigurnu i tajnu vrijednost za `JWT_SECRET`.

## 📡 API dokumentacija

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
| GET    | `/api/foods`             | Dohvat liste namirnica                         |
| POST   | `/api/foods`             | Dodavanje vlastite namirnice                   |
| GET    | `/api/meal-entries`      | Dohvat unesenih obroka za današnji dan         |
| POST   | `/api/meal-entries`      | Unos novog obroka                              |
| DELETE | `/api/meal-entries/:id`  | Brisanje unesenog obroka                       |

## 👤 Autor

Matko Dragičević
