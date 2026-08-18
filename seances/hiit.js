/* Séance : HIIT
   1 fois par semaine pour le cardio */
ajouterSeance({
    id:"hiit", nom:"HIIT", sousTitre:"4 tours · cardio", zone:"cardio", chaud:true,
    blocs:[
      { nom:"Circuit", tours:4, pauseExos:18, pauseTours:60,
        exercices:[
          { nom:"Burpee",          type:"reps",  objectif:10, note:"Débutant : sans pompe, ou pompe à genoux" },
          { nom:"Gainage bateau",  type:"temps", objectif:30, note:"Débutant : jambes pliées" },
          { nom:"Jumping jack",    type:"reps",  objectif:50 },
          { nom:"Twist russe",     type:"reps",  objectif:30, note:"Débutant : jambes pliées. Avancé : avec un poids." },
          { nom:"Mountain climber",type:"reps",  objectif:30, note:"Débutant : mains surélevées" },
          { nom:"Gainage côté",    type:"temps", objectif:30, parCote:true },
          { nom:"Sit up en chaise",type:"reps",  objectif:15, note:"Débutant : crunchs"}
        ]}
    ]
});
