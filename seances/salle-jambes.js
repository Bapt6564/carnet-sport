/* Séance : Salle — jambes */
ajouterSeance({
  id:"salle-jambes", nom:"Salle · jambes", sousTitre:"Séries droites · machines et barre",
  lieu:"salle", materiel:["rack à squat", "presse", "machine à mollets"], zone:"bas",
  blocs:[
    { nom:"Squat barre", tours:4, pauseExos:0, pauseTours:180,
      exercices:[
        { nom:"Squat barre", type:"reps", objectif:8, charge:true,
          note:"Monte progressivement : la première série sert d'échauffement" }
      ]},

    { nom:"Presse à cuisses", tours:3, pauseExos:0, pauseTours:120,
      exercices:[
        { nom:"Presse à cuisses", type:"reps", objectif:12, charge:true }
      ]},

    { nom:"Soulevé de terre jambes tendues", tours:3, pauseExos:0, pauseTours:150,
      exercices:[
        { nom:"Soulevé de terre jambes tendues", type:"reps", objectif:10, charge:true,
          note:"Ischios en tension, dos gainé" }
      ]},

    { nom:"Fentes marchées", tours:3, pauseExos:0, pauseTours:90,
      exercices:[
        { nom:"Fentes marchées", type:"reps", objectif:12, parCote:true, charge:true }
      ]},

    { nom:"Mollets et gainage", tours:3, pauseExos:30, pauseTours:60,
      exercices:[
        { nom:"Mollets debout", type:"reps",  objectif:15, charge:true },
        { nom:"Gainage côté",   type:"temps", objectif:30, parCote:true }
      ]}
  ]
});
