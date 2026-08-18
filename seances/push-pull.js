/* Séance : Push & Pull
   Copie ce fichier pour en créer une nouvelle, change l'id (il doit être unique),
   puis ajoute la ligne <script src="seances/mon-fichier.js"></script> dans index.html. */
ajouterSeance({
    id:"push-pull", nom:"Push & Pull", sousTitre:"Force + endurance · haut du corps", zone:"haut",
    blocs:[
      ECHAUFFEMENT_HAUT,
      { nom:"Partie 1 · Force et explosivité", tours:3, pauseExos:0, pauseTours:120,
        exercices:[
          { nom:"90° + pompes",         type:"reps",  objectif:"MAX", note:"Variante : pseudo-pompes" },
          { nom:"Tractions explosives", type:"reps",  objectif:"MAX", programme:"A" },
          { nom:"Montées en front lever", type:"temps", objectif:8,   programme:"B", note:"Variante : jambes pliées" }
        ]},
      { nom:"Partie 2 · Endurance musculaire", tours:3, pauseExos:0, pauseTours:120,
        exercices:[
          { nom:"Pompes diamant",       type:"reps",  objectif:15 },
          { nom:"Tractions pronation",  type:"reps",  objectif:12 },
          { nom:"Dips droits",          type:"reps",  objectif:15, programme:"A" },
          { nom:"Pompes archer alternées", type:"reps", objectif:12, programme:"B" },
          { nom:"Tractions supination", type:"reps",  objectif:12 },
          { nom:"Planche inversée",     type:"temps", objectif:30 },
          { nom:"L-sit suspendu",       type:"temps", objectif:15 }
        ]}
    ]
});
