/* Séance : Travail technique de base */
ajouterSeance({
    id:"technique-base", nom:"Travail technique (base)", sousTitre:"Technique", zone:"tout le corps",
    blocs:[
      { nom:"Circuits", tours:4, pauseExos:30, pauseTours:120,
        exercices:[
          { nom:"Tractions",    type:"reps",  objectif:10,  note:"Débutant : tractions assistées" },
          { nom:"Pompes",       type:"reps",  objectif:20,  note:"Débutant : à genoux" },
          { nom:"Pistol squats",type:"reps",  objectif:5,   parCote:true,  note:"Avec un minimum d'assistance" },
          { nom:"Gainage",      type:"temps", objectif:60,  note:"Débutant : à genoux ou pieds écartés" },
          { nom:"Dips",         type:"reps",  objectif:10,  note:"Débutant : sur support jambes tendues" },
          { nom:"L-sit",        type:"temps", objectif:10,  note:"Débutant : se soulever, au sol, jambes pliées" }
        ]}
    ]
});
