# 🏍️ DawDZ — Livraison express dans toute l'Algérie

> Application créée par **Seghir Sofiane**

## Lancer le serveur
```bash
cd yalladaw
node server.js        # port 8080 (aucune dépendance à installer)
```
Les données sont stockées dans `data.json` (commandes + paramètres + livreurs).
Supprimez `data.json` pour repartir des données de démo.

Sécurité : espace gérant protégé par mot de passe (défaut `google.com12`,
à changer dans Gestion → Paramètres) + comptes livreurs avec code secret 4 chiffres.

## 🏙️ Multi-villes (10 wilayas au lancement)
**Source unique des données : `cities.js`** — utilisée par le frontend (index.html)
et le backend (server.js). Chaque ville contient :
- `name`, `center`, `bounds` (centrage de la carte Leaflet)
- `zones[4]` : `{z, label, poly (polygone carte), c[] (communes)}`
- `comm` : nom de commune → [lat, lng]

Villes actuelles : Tizi Ouzou, Alger, Oran, Constantine, Annaba, Sétif, Blida,
Béjaïa, Batna, Ouargla.

**Ajouter une wilaya** : copier un bloc dans `cities.js` (zones + communes +
coordonnées), c'est tout. Le select de ville, les tarifs et les cartes
s'adaptent automatiquement.

Les 4 emplacements de zones (1-4) restent globaux : on active/désactive
les zones par `settings.zones` (Gestion → Paramètres).

Tarifs (grille unique, modifiable dans Gestion) : base 300 DZD + 100 DZD/zone
traversée + 100 DZD colis moyen + 200 DZD colis lourd, urgent ×1,5.
Calculés **par ville** selon les zones de cette ville.

Les commandes portent le champ `city` ; l'API `/api/orders` accepte `city`
dans le payload (sinon → Tizi Ouzou). Les anciennes commandes sans `city`
sont migrées automatiquement au démarrage.

## 📨 Notifications automatiques

### Option 1 — Telegram (gratuit, 2 minutes, recommandée)
Chaque événement (nouvelle commande, acceptée, livrée, annulée) arrive
instantanément sur VOTRE téléphone.

1. Dans Telegram, écrivez à **@BotFather**
2. `/newbot` → choisissez un nom (ex: `dawdz_alertes_bot`)
3. BotFather vous donne un **token** : `123456789:AAH...`
4. Cherchez votre bot, appuyez sur **Start** (ou envoyez `/start`)
5. Récupérez votre **chat ID** :
   - envoyez un message à votre bot
   - ouvrez `https://api.telegram.org/bot<VOTRE_TOKEN>/getUpdates`
   - cherchez `"chat":{"id": 987654321`
6. Collez token + chat ID dans **Gestion → Notifications automatiques**
7. Cliquez **Tester Telegram** → vous devriez recevoir le message

### Option 2 — WhatsApp Cloud API (Meta, gratuit)
Le client reçoit automatiquement la confirmation de sa commande.

1. Créez un compte **Meta for Developers** (developers.facebook.com)
2. Créez une application **Business** → produit **WhatsApp**
3. Renseignez votre numéro WhatsApp Business
4. Dans l'onglet API : copiez le **token** et l'**ID numéro** (Phone Number ID)
5. Collez-les dans **Gestion → Notifications automatiques**
6. Cliquez **Tester WhatsApp** (le message part vers le champ "WhatsApp du gérant")

**Limite importante de l'API officielle** :
- message automatique possible si le client vous a écrit au préalable
  (fenêtre de 24 h), ou avec un *template* approuvé pour les nouveaux clients.
- Les boutons 📲 dans l'app (wa.me) fonctionnent TOUJOURS sans configuration.

## 💰 Ce que vend la plateforme

| Modèle | Prix indicatif |
|---|---|
| Vente du site à un commerce (personnalisé : nom, ville, zones, tarifs) | 15 000 – 30 000 DZD + 3 000 – 5 000 DZD/mois |
| Opérateur de livraison (toi + livreurs) | 300 – 500 DZD/course, 30-40 % commission gérant |

## 🗺️ Carte
- Carte interactive **Leaflet + OpenStreetMap** (gratuit, sans clé API) dans
  les onglets **Gestion** (zone de couverture de la ville choisie, 4 zones
  colorées + communes cliquables) et **Livreur** (trajet D → A de la course
  en cours, dans la ville de la course).
- Nécessite **internet** pour charger les tuiles. Sans internet, l'app bascule
  automatiquement sur un schéma SVG de repli (rien ne casse).
- Les polygones de zones et coordonnées sont des approximations : ajustez
  `cities.js` (zones.poly et comm) pour plus de précision.

## 📡 Architecture
```
Téléphone client ─┐
Téléphone gérant ─┼──►  index.html + cities.js (zéro framework)
Téléphone livreur ┘          │  fetch() toutes les 4 s
                              ▼
                        server.js (Node, zéro dépendance)
                              │
            ┌─────────────────┼──────────────────┐
            ▼                 ▼                  ▼
        data.json      Telegram API        WhatsApp Cloud API
     (persistance)    (alertes gérant)   (confirmation client)
```

## 🚀 Prochaines étapes possibles
1. **Plus de wilayas** : ajouter des villes dans `cities.js` (15 min / ville)
2. **Suivi GPS du livreur** : l'API du navigateur (`navigator.geolocation`)
3. **Paiement en ligne** : Edahabia / CIB (via une passerelle algérienne)
4. **Statuts avancés** : "sorti de la pharmacie", "arrivée au quartier"…
