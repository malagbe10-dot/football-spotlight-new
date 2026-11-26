# FOOTBALL SPOTLIGHT

Site de scores et robot de publication Facebook automatisé avec GitHub Actions.

## Fichiers inclus

- `index.html`, `style.css`, `script.js` : site web.
- `competitions.json` : liste de compétitions de départ.
- `scripts/football_bot.py` : récupération des matchs via API-Football et publication des résultats / changements de score sur Facebook.
- `.github/workflows/football-spotlight.yml` : exécution automatique toutes les 30 minutes.
- `data/live.json` : données affichées par le site.

## 1. Secrets GitHub requis

Dans le dépôt `football-spotlight-new` :

**Settings → Secrets and variables → Actions → New repository secret**

Créer ces trois secrets avec les valeurs exactes fournies par tes comptes :

| Nom du secret | Valeur |
|---|---|
| `API_FOOTBALL_KEY` | Clé API-Football |
| `FACEBOOK_PAGE_ID` | ID numérique de la page Facebook |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Jeton d'accès de la page Facebook |

Ne jamais écrire ces valeurs dans les fichiers du site, dans le code ou dans une publication.

## 2. Autoriser GitHub Actions à enregistrer les données

Dans **Settings → Actions → General → Workflow permissions**, choisir :

**Read and write permissions**, puis enregistrer.

## 3. Déploiement GitHub Pages

Dans **Settings → Pages** :
- Source : Deploy from a branch
- Branch : `main`
- Folder : `/ (root)`
- Save

Le site sera servi à l'adresse GitHub Pages affichée par GitHub.

## 4. Lancer un premier test

Ouvrir **Actions → Football Spotlight - mise à jour automatique → Run workflow**.

Vérifier le journal d'exécution. Le premier lancement doit créer ou actualiser `data/live.json`.

## Ce que le robot publie

Le robot publie les résultats finaux et les changements de score en direct détectés par API-Football. Il évite de republier le même score à chaque exécution.

**Limite importante :** API-Football fournit ici des données de matchs et de compétitions, pas un flux complet d'articles d'actualité ou de transferts. Ce paquet automatise les matchs, scores et résultats ; il ne prétend pas publier toutes les nouvelles du monde du football.

## Remarques

- Le workflow s'exécute toutes les 30 minutes. GitHub Actions peut parfois démarrer avec un retard.
- La couverture des compétitions dépend des droits et de la couverture du compte API-Football.
- Les tokens Meta peuvent expirer ou perdre leurs autorisations. En cas d'erreur Facebook, consulter le journal Actions et renouveler le jeton via Meta.
- Avant de laisser le robot fonctionner durablement, effectuer un lancement manuel et vérifier la première publication sur la page.
