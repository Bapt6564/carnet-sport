/* ==========================================================================
   1. LES SÉANCES — c'est ICI que tu ajoutes tes propres entraînements.
      Rien d'autre n'est à modifier dans le code pour ajouter une séance.

   Structure d'une séance :
   {
     id: "identifiant-unique",     // sans espaces ni accents
     nom: "Nom affiché",
     sousTitre: "petite description",
     chaud: true/false,            // true = chevrons rouges (HIIT, cardio)
     blocs: [ ... ]                // une séance = une suite de blocs
   }

   Structure d'un bloc (= une "partie" du circuit) :
   {
     nom: "Partie 1 · Force",
     tours: 3,                     // combien de fois on répète la liste
     pauseExos: 0,                 // repos en secondes ENTRE deux exercices
     pauseTours: 120,              // repos en secondes ENTRE deux tours
     exercices: [ ... ]
   }

   Structure d'un exercice :
   {
     nom: "Tractions pronation",
     type: "reps",                 // "reps" (on compte) ou "temps" (on chronomètre)
     objectif: 12,                 // un nombre, ou "MAX" pour les séries à l'échec
     parCote: true,                // facultatif : l'objectif s'entend par côté
     programme: "A",               // facultatif : exercice réservé au programme A ou B
     note: "Variante : ..."        // facultatif : consigne affichée sous le nom
   }
   ========================================================================== */

/* Ce fichier est chargé en premier. Il crée la liste vide des séances et la
   fonction ajouterSeance() que chaque fichier de séance appelle ensuite. */
const SEANCES = [];
function ajouterSeance(seance){ SEANCES.push(seance); }

/* Deux échauffements réutilisables : on les glisse dans les séances
   avec la syntaxe ...ECHAUFFEMENT_HAUT */
const ECHAUFFEMENT_HAUT = {
  nom: "Échauffement haut du corps · 5 minutes",
  tours: 1, pauseExos: 0, pauseTours: 0,
  exercices: [
    { nom:"Moulinets poignets",    type:"reps", objectif:15, note:"Avant-bras fixes, dans les deux sens" },
    { nom:"Moulinets coudes",      type:"reps", objectif:15, note:"Coudes fixes, dans les deux sens" },
    { nom:"Moulinets épaules",     type:"reps", objectif:15, note:"Avant puis arrière" },
    { nom:"Torsions de buste",     type:"reps", objectif:15, parCote:true, note:"Hanches fixes" },
    { nom:"Flexions de poignets",  type:"reps", objectif:5,  note:"A genoux, sur plusieurs angles : avant, intérieur, extérieur" },
    { nom:"Exercice pull facile",  type:"reps", objectif:10, note:"Exemple : tractions australiennes hautes" },
    { nom:"Exercice push facile",  type:"reps", objectif:15, note:"Exemple : pompes surélevées ou à genoux" },
    { nom:"Exercice abdos",        type:"temps",objectif:30, note:"Gainage selon la suite" }
  ]
};

const ECHAUFFEMENT_BAS = {
  nom: "Échauffement · bas du corps",
  tours: 1, pauseExos: 0, pauseTours: 0,
  exercices: [
    { nom:"Montées de mollets",    type:"temps", objectif:25 },
    { nom:"Montées d'orteils",     type:"temps", objectif:25 },
    { nom:"Squats",                type:"reps",  objectif:10 },
    { nom:"Fentes cosaques",       type:"temps", objectif:12 , parCote=true},
    { nom:"Fentes alternées",      type:"temps", objectif:12 },
    { nom:"Montées de genoux",     type:"temps", objectif:25, note:"Allongé sur le dos" }
  ]
};

/* Planning par défaut : 0 = dimanche, 1 = lundi ... 6 = samedi.
   Tu peux le changer ici, ou directement dans l'app (c'est enregistré). */
const PLANNING_DEFAUT = { 1:"push-pull", 2:null, 3:"jambes-abdos", 4:"etirements", 5:"epaules", 6:"hiit", 0:null };
