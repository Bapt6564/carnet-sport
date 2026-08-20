/* Séance : HIIT
   1 fois par semaine pour le cardio */
ajouterSeance({
  id:"hiit", nom:"HIIT", sousTitre:"4 tours · cardio", lieu:"maison", zone:"cardio",
  blocs:[
    { nom:"Circuit", tours:4, pauseExos:18, pauseTours:60,
      exercices:[
        { nom:"Burpee",           type:"reps",  objectif:10,
          note:"Débutant : sans pompe, ou pompe à genoux",
          detail:"Descends en squat, mains au sol, saute les pieds en arrière en position de planche.\nUne pompe, puis ramène les pieds sous les hanches et saute verticalement bras levés.\nDébutant : enlève la pompe, ou fais-la à genoux." },

        { nom:"Gainage bateau",   type:"temps", objectif:30,
          note:"Débutant : jambes pliées",
          detail:"Assis, jambes tendues. Relève les jambes et descends le buste : pieds et épaules à quelques centimètres du sol.\nTiens la position sans creuser le bas du dos.\nDébutant : jambes pliées." },

        { nom:"Jumping jack",     type:"reps",  objectif:50, secParRep:1 },

        { nom:"Twist russe",      type:"reps",  objectif:30, secParRep:1,
          note:"Débutant : jambes pliées",
          detail:"Assis, jambes légèrement relevées et buste incliné en arrière.\nTourne le buste à gauche puis à droite en accompagnant du regard et des mains.\nDébutant : jambes pliées, pieds au sol.\nAvancé : tiens un poids à deux mains." },

        { nom:"Mountain climber", type:"reps",  objectif:30, secParRep:1,
          note:"Débutant : mains surélevées",
          detail:"Position de planche, bras tendus. Ramène alternativement les genoux vers la poitrine à rythme soutenu.\nGarde les abdos engagés et les hanches basses.\nDébutant : mains surélevées sur un banc." },

        { nom:"Gainage côté",     type:"temps", objectif:30, parCote:true,
          detail:"Allongé sur le côté, en appui sur l'avant-bras, jambes tendues et corps aligné.\nContracte abdos et fessiers pour ne pas laisser tomber les hanches.\nDébutant : genou du bas posé au sol." },

        { nom:"Sit up en chaise", type:"reps",  objectif:15,
          note:"Débutant : crunchs",
          detail:"Allongé sur le dos, jambes pliées à 90° et pieds décollés.\nEngage les abdominaux pour ramener le buste vers les jambes, sans tirer sur la nuque.\nDébutant : crunchs, en décollant seulement les épaules." }
      ]}
  ]
});
