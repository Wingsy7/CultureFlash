# CultureFlash

Application mobile Expo / React Native de quiz culturel quotidien.

## Installation

```bash
npm install
npm run start
```

## Variables d'environnement

Copier `.env.example` vers `.env.local`, puis renseigner :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

## Supabase

Executer le fichier `supabase/schema.sql` dans l'editeur SQL Supabase avant de
lancer l'application.

OAuth doit etre active cote Supabase pour Google et Apple. Ajouter aussi le
schema de redirection Expo `cultureflash://auth/callback` dans les URLs autorisees.

## Verification

```bash
npm run typecheck
```
