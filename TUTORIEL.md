# Tutoriel — comprendre le code, fichier par fichier

L'app tient en trois fichiers de code plus un dossier de données.

```
index.html          structure
style.css           apparence
app.js              comportement
seances/*.js        données
```


## 1. `index.html` — le squelette

Le fichier ne contient aucun contenu d'entraînement : uniquement des **boîtes vides** que le JavaScript remplira.

```html
<section id="vue-planning" class="vue active">
  <div class="page">
    <h1>Planning</h1>
    <div class="carte" id="liste-planning"></div>   <!-- rempli par app.js -->
  </div>
</section>
```

Cinq `<section class="vue">` : Planning, Séances, Historique, Poids, et la vue
Séance en direct. Une seule porte la classe `active` à la fois, les autres sont
masquées par le CSS. En bas, `<nav id="onglets">` avec un bouton par vue.

Les deux attributs à connaître :

| Attribut | À quoi il sert |
|---|---|
| `id="liste-planning"` | une **adresse** : le JS écrit dedans avec `$("#liste-planning").innerHTML = ...` |
| `data-action="valider"` | une **intention** : le JS lit cet attribut pour savoir quoi faire au clic |

Tout en bas, les scripts sont chargés dans l'ordre : les séances d'abord,
`app.js` en dernier. Cet ordre compte — `app.js` a besoin que la liste des
séances existe déjà quand il démarre.

> **Le point à comprendre :** plusieurs fichiers `.js` chargés dans une même page
> partagent leurs variables. `const SEANCES` écrit dans `commun.js` est
> directement visible depuis `app.js`, comme si tout était dans un seul fichier.
> C'est pour ça qu'aucun `import` n'apparaît nulle part.

---

## 2. `style.css` — l'apparence

Les vingt premières lignes contiennent **toutes** les couleurs et les espacements
du projet, sous forme de variables :

```css
:root{
  --fond:    #12161c;
  --acier:   #7fb2e5;   /* l'accent bleu, force et technique */
  --brique:  #c8574a;   /* l'accent rouge, HIIT et suppressions */
}
```

Ensuite, tout le reste y fait référence : `background: var(--surface)`. Change
`--acier` en vert et l'app entière devient verte. C'est le seul endroit où tu
devrais avoir besoin de toucher aux couleurs.

Trois blocs à repérer plus bas :

- `.carte`, `.btn`, `input` : les briques réutilisées partout.
- `.dose` : le triangle en bas à droite des exercices, repris des fiches de ton
  livre. Il est dessiné par `clip-path`, qui découpe un rectangle en triangle.
- `#onglets` : la barre du bas, en `position: fixed` pour rester visible pendant
  le défilement.

---

## 3. `seances/commun.js` — le format d'une séance

À lire en premier quand tu veux ajouter un entraînement. Le fichier contient :

1. **La documentation du format** en commentaire (séance → blocs → exercices).
2. `const SEANCES = []` et `ajouterSeance()`, appelée par chaque fichier de séance.
3. Les deux échauffements réutilisables.
4. `PLANNING_DEFAUT`, utilisé tant que tu n'as rien choisi dans l'app.

Le modèle en une phrase : **une séance contient des blocs, un bloc se répète en
plusieurs tours, un tour parcourt une liste d'exercices.**

```js
{ nom:"Partie 1 · Force", tours:3, pauseExos:0, pauseTours:120,
  exercices:[
    { nom:"Tractions explosives", type:"reps", objectif:"MAX" }
  ]}
```

`type` vaut `"reps"` (tu comptes) ou `"temps"` (l'app chronomètre). `objectif`
est un nombre, ou `"MAX"` pour une série à l'échec. Les champs facultatifs :
`parCote`, `note`.

---

## 4. `seances/push-pull.js` — une séance

Chaque fichier fait une seule chose : appeler `ajouterSeance({...})` avec ses
données. Pas de logique, pas de calcul. C'est volontaire : tu peux tout modifier
sans risquer de casser l'app, au pire une séance s'affichera de travers.

**Pour en ajouter une :** copier le fichier, changer l'`id`, ajouter une ligne
`<script src="seances/ma-seance.js"></script>` dans `index.html`, et le même
chemin dans `sw.js`.

---

## 5. `app.js` — le comportement

886 lignes découpées en 13 sections numérotées, dans l'ordre où elles servent.
Cherche `2. STOCKAGE`, `7. SÉANCE`, etc. pour naviguer.

| Section | Rôle | Quand y aller |
|---|---|---|
| 2. Stockage | `Store.lire` / `Store.ecrire` | ajouter une donnée à enregistrer |
| 3. Petits outils | `mmss()`, `txt()`, bip, vibration | — |
| 4. Navigation | montrer une vue, masquer les autres | ajouter un onglet |
| 5. Planning | l'écran d'accueil | — |
| 6. Séances | la bibliothèque et la fiche détaillée | — |
| 7. Séance en direct | le cœur de l'app | modifier le déroulé d'une séance |
| 8. Chronos | exercice tenu + repos | changer les sons, les durées |
| 9. Historique | liste, records, alerte d'équilibre | ajouter une statistique |
| 10. Poids | saisie et courbe | — |
| 11. Export/import | JSON, CSV, gist | — |
| 12. Écouteurs | tous les clics de l'app | brancher un nouveau bouton |
| 13. Démarrage | charge les données puis affiche | — |

### L'idée centrale : aplatir la séance

La fonction la plus importante est `construireSeries()`. Elle transforme la
structure imbriquée (séance → blocs → tours → exercices) en une **simple liste
de séries à faire, dans l'ordre** :

```
[ {tour:1, exo:"Pompes diamant"}, {tour:1, exo:"Tractions"},
  {tour:2, exo:"Pompes diamant"}, ... ]
```

À partir de là, la séance en cours se résume à un compteur : `active.index`
désigne la série actuelle. « Valider » incrémente le compteur. C'est tout.
Sans cet aplatissement il faudrait suivre trois compteurs imbriqués, et chaque
fonction deviendrait deux fois plus longue.

### Deux mécanismes à connaître

**Les gabarits (`` ` ``) construisent le HTML.** Le JS fabrique du texte HTML puis
le colle dans une boîte vide :

```js
$("#liste-seances").innerHTML = SEANCES.map(s => `
  <div class="carte">${txt(s.nom)}</div>
`).join("");
```

`map()` transforme chaque séance en un morceau de HTML, `join("")` les recolle.
`txt()` neutralise les caractères `<` et `&` d'un nom d'exercice, pour qu'ils
s'affichent au lieu d'être interprétés comme du HTML.

**Un seul écouteur pour tous les clics** (section 12). Plutôt que d'attacher un
gestionnaire à chaque bouton — impossible, puisqu'ils sont recréés à chaque
affichage — on écoute la page entière et on lit `data-action` :

```js
document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-action]");
  if (!el) return;
  if (el.dataset.action === "valider") validerSerie();
});
```

`closest()` remonte depuis l'élément touché jusqu'au bouton qui porte l'attribut,
ce qui règle le cas où tu cliques sur le texte à l'intérieur du bouton.

**Pour ajouter un bouton**, il suffit donc de deux lignes : le HTML avec
`data-action="mon-truc"`, et une ligne `else if` dans la section 12.

### `async` / `await`

Certaines fonctions sont marquées `async` et contiennent des `await`. C'est
uniquement à cause du stockage : écrire une donnée peut prendre un instant, et
`await` veut dire « attends que ce soit écrit avant de continuer ». Partout
ailleurs, le code est ordinaire.

---

## 6. `sw.js` et `manifest.json` — l'installation sur le téléphone

`manifest.json` donne le nom et l'icône. `sw.js` (« service worker ») garde une
copie des fichiers pour que l'app fonctionne sans réseau. Il ne s'active qu'en
https, donc jamais quand tu ouvres le fichier depuis ton disque.

Sa seule contrainte : la liste `FICHIERS` doit être à jour, et `VERSION` doit
changer à chaque modification. Sinon ton téléphone continue de servir l'ancienne
copie — c'est la cause n°1 de « j'ai modifié mais rien ne change ».

---

## 7. `analyse.py` — l'analyse hors app

Indépendant du reste : il lit un export (CSV ou JSON) et sort deux figures et un
rapport. `charger()` met les données à plat dans un tableau pandas, une ligne par
série ; ensuite c'est de l'analyse de données classique.

---

## Trois exercices pour prendre la main

1. **Changer la couleur d'accent.** Une seule ligne dans `style.css`. Sans risque,
   et ça te montre la portée des variables CSS.
2. **Ajouter un bouton « +1 rép » à côté du champ de répétitions.** Un `<button
   data-action="plus-un">` dans le gabarit de la section 7, une ligne dans la
   section 12 qui fait `$("#champ-valeur").value = Number(...) + 1`.
3. **Afficher le nombre de séries restantes** dans la barre du haut de la séance.
   L'information existe déjà : `active.series.length - active.index`.

Le troisième est le plus formateur : il te fait toucher au calcul, au gabarit et
au rendu, sur trois lignes.
