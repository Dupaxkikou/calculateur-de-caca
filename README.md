# Calculateur de Caca 💩

Site web (Next.js 14) — mesure la différence de poids avant/après, OCR
directement dans le navigateur (Tesseract.js), pas de photo stockée.

## Structure

```
app/
  page.js                 # page initiale : sélection / création de profil
  home/page.js             # page 1 : accueil
  measure/before/page.js   # page 2 : capture avant
  measure/after/page.js    # page 3 : capture après + sauvegarde
  measure/result/page.js   # page 4 : résultat
  history/page.js          # page 5
  stats/page.js            # page 6
  leaderboard/page.js      # page 7 (stub V2)
components/
  BigButton.js
  CameraCapture.js          # caméra + OCR, partagé avant/après
lib/
  firebase.js               # config Firebase
  firestore.js               # accès Firestore (profils, mesures)
  store.js                   # localStorage (profil actif, mesure en cours)
  ocr.js                     # Tesseract.js + parsing du poids
```

## 1. Setup local

```bash
npm install
```

## 2. Firebase

Console Firebase → crée un projet → active **Firestore** (mode production).
Pas de Storage nécessaire, on ne garde pas les photos.

Récupère la config web (Paramètres du projet > Général > Tes applications),
crée un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Règles Firestore de départ** (à durcir avant un usage public large) :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{profileId} {
      allow read, write: if true;
    }
    match /measurements/{measurementId} {
      allow read, write: if true;
    }
  }
}
```

## 3. Lancer en local

```bash
npm run dev
```
→ http://localhost:3000
La caméra ne fonctionne qu'en HTTPS ou sur `localhost` (contrainte navigateur).

## 4. GitHub + Vercel (gratuit)

```bash
git init
git add .
git commit -m "init"
```
Crée un repo vide sur github.com, puis :
```bash
git remote add origin https://github.com/TON-USER/calculateur-caca-web.git
git branch -M main
git push -u origin main
```

Sur vercel.com : **Add New Project** → importe le repo → Next.js est
détecté automatiquement. Avant de cliquer Deploy, ajoute les 6 variables
d'environnement `NEXT_PUBLIC_FIREBASE_*` (Settings > Environment Variables,
ou directement dans l'écran d'import) avec les mêmes valeurs que ton
`.env.local`. Puis **Deploy**.

## Comment marche la détection du poids

1. L'utilisateur cadre l'écran de la balance dans le rectangle affiché
   (zone fixe définie dans `CameraCapture.js`).
2. Toutes les 900 ms, une frame de la vidéo est capturée, recadrée sur
   cette zone, puis passée à Tesseract.js.
3. Dès que deux lectures consécutives donnent une valeur quasi identique
   (± 50 g), le poids est validé automatiquement.

Tout tourne dans le navigateur, rien n'est envoyé sur un serveur pour
l'OCR — seul le résultat final (les deux poids) part vers Firestore.

## Limites à connaître

- Premier chargement de la page de mesure un peu plus lent : Tesseract.js
  télécharge son modèle de langue (~2-4 Mo) au premier lancement. Ensuite
  c'est mis en cache par le navigateur.
- Tesseract.js est moins précis qu'un OCR natif mobile sur un afficheur
  LCD/LED avec reflets. Si ça galère en usage réel, la piste principale
  d'amélioration est d'ajuster `SCAN_ZONE` dans `CameraCapture.js` et le
  whitelist de caractères dans `lib/ocr.js`.
- Pas d'authentification : les profils sont juste un nom, pas de mot de
  passe. Les règles Firestore ci-dessus sont ouvertes en écriture — à
  restreindre si le site devient public au-delà d'un groupe d'amis.

## Après le MVP

- Mode amis / classement réel (le schéma `friendships` reste à créer)
- Badges 100 g / 250 g / 500 g, calculables côté client depuis l'historique
- Photo de profil (actuellement juste l'initiale du nom)
