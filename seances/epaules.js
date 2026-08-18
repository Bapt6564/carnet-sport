/* Séance : Épaules
   Copie ce fichier pour en créer une nouvelle, change l'id (il doit être unique),
   puis ajoute la ligne <script src="seances/mon-fichier.js"></script> dans index.html. */
ajouterSeance({
    id:"epaules", nom:"Épaules", sousTitre:"Équilibre + endurance", zone:"haut",
    blocs:[
      ECHAUFFEMENT_HAUT,
      { nom:"Partie 1 · Équilibre", tours:3, pauseExos:60, pauseTours:120,
        exercices:[
          { nom:"Équilibre dos au mur",  type:"temps", objectif:30 },
          { nom:"Équilibre face au mur", type:"temps", objectif:30, note:"Variante : maintien piqué surélevé" }
        ]},
      { nom:"Partie 2 · Endurance musculaire", tours:3, pauseExos:45, pauseTours:120,
        exercices:[
          { nom:"Pompes piquées",   type:"reps",  objectif:12, note:"Variante : pompes classiques pieds surélevés" },
          { nom:"Pseudo-pompes",    type:"reps",  objectif:12, note:"Variante : à genoux" },
          { nom:"Épaule à épaule",  type:"reps",  objectif:20 },
          { nom:"Gainage reach up", type:"reps",  objectif:12, parCote:true },
          { nom:"Planche inversée", type:"temps", objectif:30 }
        ]}
    ]
});
