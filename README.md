# Carnet d'entraînement

App perso de suivi d'entraînement : planning, séances chronométrées, historique,
records, suivi du poids. Aucun serveur, aucune dépendance : du HTML, du CSS et du
JavaScript ordinaires.

## Organisation des fichiers

```
index.html          structure de la page (les 4 onglets + la vue séance)
style.css           toutes les couleurs et tailles, regroupées en variables en haut
app.js              la logique, en 12 sections numérotées
seances/
  commun.js        format d'une séance, échauffements réutilisables, planning par défaut
  push-pull.js      une séance = un fichier
  pull-a.js
  jambes-abdos.js
  epaules.js
  hiit.js
  etirements.js
manifest.json       nom et icône quand l'app est installée sur le téléphone
sw.js               cache hors ligne
analyse.py          analyse des exports (progression, plateaux, volume)
TUTORIEL.md         explication du code, fichier par fichier
```

## Ajouter une séance

1. Copier un fichier de `seances/` et lui donner un nom de fichier libre.
2. Changer `id:` (unique, sans espaces ni accents) et le reste du contenu.
3. Ajouter une ligne dans `index.html`, à la suite des autres :
   `<script src="seances/ma-seance.js"></script>`
4. Ajouter le même chemin dans la liste `FICHIERS` de `sw.js`, et incrémenter `VERSION`.

Le format complet d'une séance est documenté en commentaire en haut de
`seances/commun.js`.

## Pourquoi des fichiers `.js` et pas du `.json`

Un `<script src="...">` fonctionne partout, y compris en ouvrant `index.html`
directement depuis le disque. Un `fetch()` sur un fichier `.json` local est bloqué
par le navigateur : il faudrait lancer un serveur à chaque fois.

## Mettre en ligne

Déposer le dossier dans un dépôt GitHub, puis activer GitHub Pages (Settings →
Pages → branche `main`). L'app est alors installable sur l'écran d'accueil et
fonctionne hors ligne. Le service worker ne s'active qu'en https : en local, tout
marche sauf le mode hors ligne.

## Sauvegardes

Onglet Historique : export JSON (sauvegarde complète), export CSV (pour
`analyse.py`), et synchronisation vers un gist GitHub privé.

```
python analyse.py series-2026-08-17.csv
```
