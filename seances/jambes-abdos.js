/* Séance : Jambes & Abdos
   Copie ce fichier pour en créer une nouvelle, change l'id (il doit être unique),
   puis ajoute la ligne <script src="seances/mon-fichier.js"></script> dans index.html. */
ajouterSeance({
    id:"jambes-abdos", nom:"Jambes & Abdos", sousTitre:"Bas du corps + ceinture", zone:"bas",
    blocs:[
      ECHAUFFEMENT_BAS,
      { nom:"Partie 1 · Jambes", tours:3, pauseExos:45, pauseTours:120,
        exercices:[
          { nom:"Fentes cosaques",        type:"reps",  objectif:12, parCote:true },
          { nom:"Fentes sautées alternées", type:"reps", objectif:10, parCote:true },
          { nom:"Chaise",                 type:"temps", objectif:45 },
          { nom:"Montée de mollets",      type:"reps",  objectif:20 },
          { nom:"Pistol squats",          type:"reps",  objectif:10, parCote:true, note:"Si tu t'entraînes 5 jours par semaine. Variante : pistol squats assistés" }
        ]},
      { nom:"Partie 2 · Abdos", tours:3, pauseExos:45, pauseTours:120,
        exercices:[
          { nom:"Gainage côté",              type:"temps", objectif:30, parCote:true },
          { nom:"Montées de hanches",        type:"reps",  objectif:10 },
          { nom:"Superman",                  type:"reps",  objectif:12 },
          { nom:"Montées de hanches une jambe tendue", type:"reps", objectif:10, parCote:true }
        ]}
    ]
});
