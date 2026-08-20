/* Séance : Salle — haut du corps
   Exemple de séance en SÉRIES DROITES : un bloc par exercice, et autant de
   tours que de séries. C'est la structure habituelle en salle, à l'inverse
   des circuits où l'on enchaîne plusieurs exercices avant de se reposer.
   `charge:true` fait apparaître "Charge (kg)" au lieu de "Lest (kg)". */
ajouterSeance({
  id:"salle-haut", nom:"Salle · haut du corps", sousTitre:"Séries droites · machines et haltères",
  lieu:"salle", materiel:["banc", "haltères", "poulie", "barre"], zone:"haut",
  blocs:[
    { nom:"Développé couché", tours:4, pauseExos:0, pauseTours:150,
      exercices:[
        { nom:"Développé couché", type:"reps", objectif:8, charge:true,
          note:"Échauffe-toi avec une série légère avant la première série lourde" }
      ]},

    { nom:"Tirage vertical", tours:4, pauseExos:0, pauseTours:120,
      exercices:[
        { nom:"Tirage vertical", type:"reps", objectif:10, charge:true }
      ]},

    { nom:"Développé militaire haltères", tours:3, pauseExos:0, pauseTours:120,
      exercices:[
        { nom:"Développé militaire haltères", type:"reps", objectif:10, charge:true }
      ]},

    { nom:"Rowing barre", tours:3, pauseExos:0, pauseTours:120,
      exercices:[
        { nom:"Rowing barre", type:"reps", objectif:10, charge:true,
          note:"Dos plat, buste à 45°",
          detail:"Buste penché à environ 45°, dos gainé et jambes légèrement fléchies.\nTire la barre vers le nombril en serrant les omoplates, contrôle la descente.\nSi le dos s'arrondit ou que tu prends de l'élan avec les jambes, allège." }
      ]},

    { nom:"Superset bras", tours:3, pauseExos:0, pauseTours:90,
      exercices:[
        { nom:"Curl haltères",        type:"reps", objectif:12, charge:true },
        { nom:"Extensions triceps poulie", type:"reps", objectif:12, charge:true }
      ]},

    { nom:"Finition épaules", tours:3, pauseExos:30, pauseTours:60,
      exercices:[
        { nom:"Élévations latérales", type:"reps",  objectif:15, charge:true },
        { nom:"Gainage",              type:"temps", objectif:45 }
      ]}
  ]
});
