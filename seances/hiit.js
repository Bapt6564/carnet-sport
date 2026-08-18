/* Séance : HIIT
   Copie ce fichier pour en créer une nouvelle, change l'id (il doit être unique),
   puis ajoute la ligne <script src="seances/mon-fichier.js"></script> dans index.html. */
ajouterSeance({
    id:"hiit", nom:"HIIT", sousTitre:"4 tours · cardio", zone:"cardio", chaud:true,
    blocs:[
      { nom:"Circuit", tours:4, pauseExos:18, pauseTours:60,
        exercices:[
          { nom:"Burpee",          type:"reps",  objectif:10, note:"Variante : sans pompe, ou pompe à genoux" },
          { nom:"Bateau",          type:"temps", objectif:30, note:"Variante : jambes pliées" },
          { nom:"Jumping jack",    type:"reps",  objectif:30 },
          { nom:"Twist russe",     type:"reps",  objectif:30, note:"Variante : jambes pliées" },
          { nom:"Mountain climber",type:"reps",  objectif:30, note:"Variante : mains surélevées" },
          { nom:"Gainage côté",    type:"temps", objectif:30, parCote:true }
        ]}
    ]
});
