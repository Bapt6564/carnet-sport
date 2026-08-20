/* Séance : Pull A
   Copie ce fichier pour en créer une nouvelle, change l'id (il doit être unique),
   puis ajoute la ligne <script src="seances/mon-fichier.js"></script> dans index.html. */
ajouterSeance({
    id:"pull-a", nom:"Pull A", sousTitre:"Tirage · force puis volume", lieu:"maison", materiel:["barre de traction", "barre basse", "barre de dips"], zone:"haut",
    blocs:[
      ECHAUFFEMENT_HAUT,
      { nom:"Partie 1 · Force et explosivité", tours:3, pauseExos:0, pauseTours:150,
        exercices:[
          { nom:"Tractions explosives", type:"reps", objectif:"MAX", note:"Variante : tractions lestées 2-3 kg" }
        ]},
      { nom:"Partie 2 · Endurance musculaire", tours:3, pauseExos:50, pauseTours:120,
        exercices:[
          { nom:"Muscle ups négatifs",       type:"reps", objectif:6 },
          { nom:"Dips droits",               type:"reps", objectif:15 },
          { nom:"Tractions supination",      type:"reps", objectif:10 },
          { nom:"Tractions pronation",       type:"reps", objectif:10 },
          { nom:"Tractions australiennes",   type:"reps", objectif:20 },
          { nom:"Montées de jambes explosives", type:"reps", objectif:10 }
        ]}
    ]
});
