/* Séance : Travail technique de base
   Les six figures de fond, en circuit. */
ajouterSeance({
  id:"technique-base", nom:"Travail technique (base)", sousTitre:"Technique · tout le corps",
  lieu:"maison", materiel:["barre de traction", "barre de dips"], zone:"tout",
  blocs:[
    { nom:"Circuits", tours:4, pauseExos:30, pauseTours:120,
      exercices:[
        { nom:"Tractions",     type:"reps",  objectif:10,
          note:"Débutant : tractions assistées",
          detail:"Suspendu à une barre haute, mains en overgrip à largeur d'épaules, corps gainé.\nTire jusqu'à passer le menton au-dessus de la barre, contrôle la descente jusqu'aux bras tendus.\nDébutant : tractions assistées (élastique, pied au sol) ou tractions australiennes." },

        { nom:"Pompes",        type:"reps",  objectif:20,
          note:"Débutant : à genoux",
          detail:"Mains un peu plus écartées que les épaules, corps aligné de la tête aux talons.\nDescends jusqu'à frôler le sol de la poitrine, remonte jusqu'à tendre les bras.\nDébutant : à genoux, ou mains surélevées sur un support." },

        { nom:"Pistol squats", type:"reps",  objectif:5, parCote:true,
          note:"Avec un minimum d'assistance",
          detail:"Debout sur une jambe, l'autre tendue devant.\nDescends lentement en contrôlant, buste légèrement penché en avant, puis repousse le sol.\nDébutant : tiens un support d'une main, ou descends sur une marche." },

        { nom:"Gainage",       type:"temps", objectif:60,
          note:"Débutant : à genoux ou pieds écartés",
          detail:"Appui sur les avant-bras et les pointes de pieds, corps aligné.\nContracte abdos et fessiers, ne creuse pas le bas du dos.\nDébutant : genoux au sol, ou pieds plus écartés." },

        { nom:"Dips",          type:"reps",  objectif:10,
          note:"Débutant : sur support jambes tendues",
          detail:"En appui bras tendus sur les barres, corps gainé.\nFléchis les coudes jusqu'à un angle de 90°, coudes rentrés, puis remonte jusqu'à tendre les bras.\nDébutant : dips sur un banc, jambes tendues devant, talons au sol." },

        { nom:"L-sit",         type:"temps", objectif:10,
          note:"Débutant : se soulever au sol, jambes pliées",
          detail:"En appui bras tendus, épaules basses, monte les jambes tendues jusqu'à former un angle de 90° avec le buste.\nEngage les abdominaux et garde les pointes de pieds tendues.\nDébutant : au sol, décolle le bassin avec les jambes pliées (tuck)." }
      ]}
  ]
});
