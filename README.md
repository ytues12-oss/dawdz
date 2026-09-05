# 🏍️ DawDZ — Livraison express dans toute l'Algérie

> Application créée par **Seghir Sofiane**

Application de livraison moto (documents, colis, repas) — 10 wilayas au
lancement, paiement à la livraison, tarifs calculés par zone.

## Lancer en local

```bash
node server.js          # port 8080 (ou $PORT)
```

Aucune dépendance à installer.

## 🚀 Déployer sur Render (gratuit)

1. **GitHub** (compte gratuit) : crée un dépôt **privé** `dawdz` et téléverse
   tous les fichiers de ce dossier (bouton *Add files → Upload files*).
2. **Render** (compte gratuit, connexion via GitHub) :
   * **New → Web Service**
   * Choisis le dépôt `dawdz`
   * Name : `dawdz` · Runtime : **Node** · Plan : **Free**
   * Region : **Europe (Frankfurt)** (le plus proche de l'Algérie)
   * Build command : *(laisser vide)*
   * Start command : `node server.js`
   * Health Check Path : `/api/health`
   * **Deploy**
3. L'URL publique : `https://dawdz.onrender.com`

Le fichier `render.yaml` (Blueprint) contient déjà cette configuration :
si Render te propose d'utiliser le Blueprint, accepte.

**Spécificités du plan gratuit Render** :
- 1re mise en route : ~1 minute. Après 15 min sans visite, le service dort ;
  la page suivante se réveille en ~30-60 s (normal).
- Le disque est **éphémère** : à chaque redémarrage, les données repartent du
  `data.json` du dépôt (commandes de démo + mot de passe de secours
  `DzJxQMBzmPEJ!`). Les changements faits dans l'app (nouveaux livreurs,
  commandes) sont perdus au redémarrage.
- Pour un usage réel avec données durables : un petit VPS (5-10 USD/mois) ou
  un Raspberry Pi — le code est identique.

**Sécurité à ne pas oublier** :
- Garder le dépôt GitHub **privé** (il contient data.json).
- Changer le mot de passe gérant dans Gestion → Paramètres après la 1re mise en
  route (sur le plan gratuit, il faudra le rechanger après chaque redéploiement).
- Partage les codes livreurs par SMS/WhatsApp, jamais par mail.

- **Client** : crée une course (ville, départ, arrivée, poids)
- **Livreur** : se connecte avec son compte + code secret, accepte les courses,
  suit le trajet sur carte OpenStreetMap, encaisse le paiement
- **Gérant** : tableau de bord, paramètres (nom, ville, tarifs, zones),
  comptes livreurs, notifications Telegram / WhatsApp

## 🔒 Sécurité

- Espace gérant protégé : mot de passe + session par jeton (24 h)
- Codes livreurs hachés (SHA-256 + sel), jamais exposés
- Anti-forçage : 5 échecs de connexion → blocage 15 min
- Anti-spam : 10 commandes max / minute / IP
- En-têtes de sécurité : CSP, X-Frame-Options DENY, nosniff, Referrer-Policy
- Seuls `index.html` et `cities.js` sont servis en public
- `/api/state` masque mot de passe et tokens API

⚠️ Changer le mot de passe gérant dès la première ouverture
(Gestion → Paramètres).

## Fichiers

| Fichier | Rôle |
|---|---|
| `server.js` | Serveur Node zéro dépendance + API |
| `index.html` | Application web (zéro framework) |
| `cities.js` | Données des 10 wilayas (zones, communes, cartes) |
| `data.json` | Persistance (commandes, livreurs, paramètres) |

⚠️ Sur Glitch, le disque est **éphémère** : les commandes/participants sont
perdus à chaque redémarrage du projet. Pour un usage réel, faire tourner le
serveur sur une machine avec disque permanent (VPS, Raspberry Pi…) — le code
est identique.
