#  Geo Veh — Suivi GPS de véhicules en temps réel

Application web fullstack de suivi GPS de véhicules avec carte interactive, développée avec **Node.js**, **PostgreSQL/PostGIS** et **React**.

---

## Technologies utilisées

| Côté | Technologies |
|------|-------------|
| Backend | Node.js, Express, PostgreSQL, PostGIS, JWT |
| Frontend | React, Vite, Leaflet, Axios |
| Base de données | PostgreSQL 15 + PostGIS 3.6 |

---

## 📋 Fonctionnalités

-  Authentification JWT (login / logout)
- CRUD véhicules (créer, modifier, supprimer)
- Enregistrement de positions GPS
- Carte en temps réel (mise à jour toutes les 5 secondes)
- Historique de trajet avec polyline et filtres par date
- Recherche géospatiale (véhicules dans un rayon, véhicule le plus proche)

---

## ⚙️ Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) v18 ou supérieur
- [PostgreSQL 15](https://www.postgresql.org/) avec l'extension **PostGIS**
- Git

---

##  Installation et lancement

### 1. Cloner le projet

```bash
git clone <URL_DU_REPO>
cd Geo_Veh
```

### 2. Configurer et lancer le Backend

```bash
cd backend
npm install
```

Copier le fichier d'environnement :

```bash
copy .env.example .env
```

Ouvrir `.env` et renseigner les valeurs :

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=geo_veh
DB_USER=postgres
DB_PASSWORD=VotreMotDePassePostgres
JWT_SECRET= une_cle_secrete_longue_min32caracteres
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

### 3. Créer la base de données PostgreSQL

Ouvrir **psql** et exécuter :

```sql
CREATE DATABASE geo_veh;
\c geo_veh
CREATE EXTENSION IF NOT EXISTS postgis;
\i 'chemin/vers/Geo_Veh/backend/sql/init.sql'
```

### 4. Démarrer le Backend

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:4000**

Vérifier que tout fonctionne :
```
GET http://localhost:4000/health  →  { "ok": true }
```

### 5. Lancer le Frontend

Ouvrir un **nouveau terminal** :

```bash
cd frontend
npm install
npm start
```

L'application s'ouvre sur **http://localhost:3000**

---

## 🔑 Connexion à l'application

Un compte administrateur est déjà créé dans la base de données :

| Champ | Valeur |
|-------|--------|
| **Email** | admin@geoveh.com |
| **Mot de passe** | Admin123! |

Rendez-vous sur **http://localhost:3000** et connectez-vous avec ces identifiants.

---

## 📁 Structure du projet

```
Geo_Veh/
├── backend/
│   ├── config/          # Configuration DB et environnement
│   ├── controllers/     # Logique des routes
│   ├── middleware/      # Auth JWT, validation
│   ├── models/          # Modèles de données
│   ├── routes/          # Définition des routes API
│   ├── services/        # Logique métier
│   ├── sql/             # Script d'initialisation de la base
│   └── server.js        # Point d'entrée
│
└── frontend/
    ├── components/      # Composants réutilisables
    ├── pages/           # Pages (Dashboard, Login, Véhicules, Positions)
    ├── services/        # Appels API (axios)
    └── src/             # Point d'entrée React
```

---

## 🌐 Routes API principales

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/vehicles` | Lister les véhicules |
| POST | `/api/vehicles` | Créer un véhicule |
| PUT | `/api/vehicles/:id` | Modifier un véhicule |
| DELETE | `/api/vehicles/:id` | Supprimer un véhicule |
| POST | `/api/positions` | Enregistrer une position GPS |
| GET | `/api/positions/latest` | Dernières positions (tous véhicules) |
| GET | `/api/positions/vehicle/:id/history` | Historique d'un véhicule |
| GET | `/api/search/within-radius` | Véhicules dans un rayon |
| GET | `/api/search/nearest` | Véhicule le plus proche |

---

## ⚠️ Notes importantes

- Les fichiers `.env` ne sont pas inclus dans le dépôt Git pour des raisons de sécurité.
- Les dossiers `node_modules/` ne sont pas inclus — lancer `npm install` dans `backend/` et `frontend/` avant de démarrer.
- Le backend doit être lancé **avant** le frontend.
