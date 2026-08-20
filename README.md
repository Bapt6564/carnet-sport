# Carnet d'entraînement

App perso de suivi d'entraînement : planning, séances chronométrées, historique,
records, suivi du poids.

## Organisation des fichiers

```
index.html          structure de la page (les 4 onglets + la vue séance)
style.css           feuille de style
app.js              fonctionnement de l'app
seances/
  commun.js         format d'une séance, échauffements réutilisables, planning par défaut
  push-pull.js      une séance par fichier
  pull-a.js
  jambes-abdos.js
  epaules.js
  hiit.js
  etirements.js
manifest.json       nom et icône quand l'app est installée sur le téléphone
sw.js               cache hors ligne
analyse.py          analyse des exports (progression, plateaux, volume)
TUTORIEL.md         détail du code
```

## Ajouter une séance

1. Copier un fichier de `seances/` et lui donner un nom de fichier libre.
2. Changer `id:` (unique, sans espaces ni accents) et le reste du contenu.
3. Ajouter une ligne dans `index.html`, à la suite des autres :
   `<script src="seances/ma-seance.js"></script>`
4. Ajouter le même chemin dans la liste `FICHIERS` de `sw.js`, et incrémenter `VERSION`.

Le format complet d'une séance est documenté en commentaire en haut de
`seances/commun.js`.

## Sauvegardes

Onglet Historique : export JSON (sauvegarde complète), export CSV (pour
`analyse.py`), et synchronisation vers un gist GitHub privé.

```
python analyse.py series-2026-08-17.csv
```

## Licence

Code sous licence MIT — voir le fichier `LICENSE`. Réutilisation, modification
et partage libres, en conservant la mention de copyright. La mention apparaît
aussi en bas de l'écran Planning.

Les contenus d'entraînement (choix des exercices, dosages) proviennent en partie
d'un livre de street workout ; ils sont là pour un usage personnel.