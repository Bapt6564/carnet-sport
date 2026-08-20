/* Séance : Étirements
   Copie ce fichier pour en créer une nouvelle, change l'id (il doit être unique),
   puis ajoute la ligne <script src="seances/mon-fichier.js"></script> dans index.html. */
ajouterSeance({
    id:"etirements", nom:"Étirements", sousTitre:"Après séance ou jour de repos", lieu:"maison", zone:"mobilite",
    blocs:[
      { nom:"Souplesse ciblée", tours:1, pauseExos:0, pauseTours:0,
        exercices:[
          { nom:"Toucher ses pieds assis",         type:"reps",  objectif:4,  note:"3s d'effort, 3s de relâchement" },
          { nom:"Squat profond",                   type:"temps", objectif:30, note:"3 séries, 2 min de pause" },
          { nom:"Relâchement des fléchisseurs",    type:"temps", objectif:20, parCote:true },
          { nom:"Étirement des pectoraux",         type:"temps", objectif:10, parCote:true },
          { nom:"Étirement des dorsaux",           type:"temps", objectif:10 },
          { nom:"Étirement des obliques",          type:"temps", objectif:10, parCote:true },
          { nom:"Étirement des abdos",             type:"temps", objectif:10 },
          { nom:"Fente avec torsion",              type:"temps", objectif:10, parCote:true }
        ]}
    ]
});
