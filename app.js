"use strict";

/* ==========================================================================
   2. STOCKAGE
   ========================================================================== */
const Store = {
  async lire(cle, defaut){
    try{
      if (window.storage){
        const r = await window.storage.get(cle);
        return r && r.value ? JSON.parse(r.value) : defaut;
      }
      const brut = localStorage.getItem(cle);
      return brut ? JSON.parse(brut) : defaut;
    }catch(e){ return defaut; }
  },
  async ecrire(cle, valeur){
    try{
      const txt = JSON.stringify(valeur);
      if (window.storage) await window.storage.set(cle, txt);
      else localStorage.setItem(cle, txt);
    }catch(e){ console.warn("Enregistrement impossible :", e); }
  }
};

const CLE = { hist:"entr:historique", poids:"entr:poids", plan:"entr:planning",
               active:"entr:seance-active", obj:"entr:objectifs", reg:"entr:reglages" };

/* L'état de l'app, chargé au démarrage. */
let historique = [];   // séances terminées
let poids      = [];   // { date:"2026-08-17", valeur:72.4 }
let planning   = {};   // { 1:"push-pull", ... }
let active     = null;  // séance en cours (voir démarrerSeance)
let objectifs  = {};   // objectifs relevés par la progression auto : { "Pompes diamant": 17 }
let reglages   = { programme:"A", gistToken:"", gistId:"" };


/* ==========================================================================
   3. PETITS OUTILS
   ========================================================================== */
const $  = (sel) => document.querySelector(sel);
const JOURS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const JOUR = 24 * 60 * 60 * 1000;   // un jour en millisecondes

/** 95 -> "1:35" */
function mmss(secondes){
  secondes = Math.max(0, Math.round(secondes));
  const m = Math.floor(secondes/60), s = secondes%60;
  return m + ":" + String(s).padStart(2,"0");
}
/** "2026-08-17" -> "17 août" */
function dateCourte(iso){
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
}
/** Date d'aujourd'hui au format "2026-08-17" (heure locale, pas UTC). */
function aujourdhuiISO(){
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mois + "-" + jour;
}
function seanceParId(id){ return SEANCES.find(s => s.id === id) || null; }
/** Échappe le texte avant de l'injecter en HTML (sécurité + accents cassés). */
function txt(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/** Objectif du jour : celui du catalogue, sauf si la progression auto l'a relevé. */
function objectifEffectif(exo){
  return (objectifs[exo.nom] !== undefined) ? objectifs[exo.nom] : exo.objectif;
}
/** Retrouve un exercice du catalogue par son nom. */
function trouverExo(nom){
  for (const s of SEANCES) for (const b of s.blocs){
    const e = b.exercices.find(x => x.nom === nom);
    if (e) return e;
  }
  return null;
}

/** Texte du chevron de dosage : { haut:"12", bas:"REP /CÔTÉ" } */
function dosage(exo){
  const obj = objectifEffectif(exo);
  if (exo.type === "temps") return { haut:String(obj), bas:"sec" + (exo.parCote?" /côté":"") };
  const haut = obj === "MAX" ? "MAX" : "x"+obj;
  return { haut, bas:"rép" + (exo.parCote?" /côté":"") };
}
function htmlDose(exo, chaud){
  const d = dosage(exo);
  return `<div class="dose${chaud?" chaud":""}"><b>${txt(d.haut)}</b><span>${txt(d.bas)}</span></div>`;
}

/* --- Retours physiques : son, vibration, écran allumé ------------------- */
let audioCtx = null;
function bip(frequence = 660, duree = 0.18){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = frequence; o.type = "sine";
    g.gain.setValueAtTime(.001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.35, audioCtx.currentTime + .02);
    g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duree);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + duree + .02);
  }catch(e){}
}
function vibrer(motif){ if (navigator.vibrate) navigator.vibrate(motif); }

let verrouEcran = null;
async function garderEcranAllume(){
  try{ if ("wakeLock" in navigator) verrouEcran = await navigator.wakeLock.request("screen"); }catch(e){}
}
function libererEcran(){ if (verrouEcran){ verrouEcran.release().catch(()=>{}); verrouEcran = null; } }


/* ==========================================================================
   4. NAVIGATION ENTRE LES VUES
   ========================================================================== */
function naviguer(nom){
  document.querySelectorAll(".vue").forEach(v => v.classList.remove("active"));
  $("#vue-" + nom).classList.add("active");
  document.querySelectorAll("#onglets button").forEach(b =>
    b.classList.toggle("actif", b.dataset.vue === nom));
  $("#onglets").style.display = (nom === "seance") ? "none" : "flex";
  window.scrollTo(0,0);
}


/* ==========================================================================
   5. VUE PLANNING
   ========================================================================== */
function rendrePlanning(){
  const auj = new Date().getDay();
  $("#date-jour").textContent = new Date().toLocaleDateString("fr-FR",{ weekday:"long", day:"numeric", month:"long" });

  // Les jours affichés du lundi au dimanche
  const ordre = [1,2,3,4,5,6,0];
  $("#liste-planning").innerHTML = ordre.map(j => {
    const id = planning[j];
    const s  = seanceParId(id);
    const options = ['<option value="">Repos</option>'].concat(
      SEANCES.map(x => `<option value="${x.id}"${x.id===id?" selected":""}>${txt(x.nom)}</option>`)
    ).join("");
    return `
      <div class="jour${j===auj?" aujourdhui":""}">
        <span class="nom-jour">${JOURS[j]}</span>
        <div class="contenu"><select data-jour="${j}">${options}</select></div>
        ${s ? `<button class="btn plein" data-action="demarrer" data-id="${s.id}">Go</button>` : ""}
      </div>`;
  }).join("");

  // Programme A ou B (les circuits du livre se déclinent en deux versions)
  $("#choix-programme").innerHTML = ["A","B"].map(v => `
    <div><button class="btn large${reglages.programme===v?" plein":""}" data-action="programme" data-v="${v}">Programme ${v}</button></div>`
  ).join("");

  // Proposition de reprise si une séance a été interrompue
  $("#reprise").innerHTML = active ? `
    <div class="carte" style="margin-top:16px; border-color:var(--acier)">
      <p class="oeil">Séance interrompue</p>
      <h3 style="margin:4px 0 10px">${txt(active.nom)}</h3>
      <div class="ligne-champs">
        <div><button class="btn plein large" data-action="reprendre">Reprendre</button></div>
        <div><button class="btn large danger" data-action="abandonner">Abandonner</button></div>
      </div>
    </div>` : "";
}


/* ==========================================================================
   6. VUE SÉANCES (la bibliothèque)
   ========================================================================== */
function rendreSeances(){
  $("#liste-seances").innerHTML = SEANCES.map(s => {
    const nbExos = s.blocs.reduce((n,b) => n + b.exercices.length, 0);
    const nbSeries = s.blocs.reduce((n,b) => n + b.exercices.length * b.tours, 0);
    return `
      <div class="carte cliquable" data-action="ouvrir-seance" data-id="${s.id}">
        <h2>${txt(s.nom)}</h2>
        <p class="petit gris" style="margin-top:2px">${txt(s.sousTitre||"")}</p>
        <p class="petit mono" style="margin-top:10px; color:var(--acier)">
          ${s.blocs.length} blocs · ${nbExos} exercices · ${nbSeries} séries
        </p>
      </div>`;
  }).join("");
}

/** Fiche détaillée d'une séance, avec le bouton pour la lancer. */
function ouvrirSeance(id){
  const s = seanceParId(id);
  if (!s) return;
  const blocs = s.blocs.map(b => `
    <p class="oeil" style="margin:18px 0 8px">${txt(b.nom)} — ${b.tours} tour${b.tours>1?"s":""}${b.pauseTours?` · pause ${mmss(b.pauseTours)}`:""}</p>
    ${b.exercices.map(e => `
      <div class="carte" style="padding-right:80px">
        <h3>${txt(e.nom)}</h3>
        ${e.note ? `<p class="petit gris" style="margin-top:4px">${txt(e.note)}</p>` : ""}
        ${dernierePerfTexte(e.nom)}
        ${htmlDose(e, s.chaud)}
      </div>`).join("")}
  `).join("");

  $("#liste-seances").innerHTML = `
    <button class="btn" style="margin-bottom:14px" data-action="retour-seances">← Toutes les séances</button>
    <h2>${txt(s.nom)}</h2>
    <p class="petit gris">${txt(s.sousTitre||"")}</p>
    ${blocs}
    <button class="btn plein large" style="margin-top:18px" data-action="demarrer" data-id="${s.id}">Démarrer la séance</button>`;
  window.scrollTo(0,0);
}

/** "Dernière fois : 10 · 8 · 7" pour un exercice donné. */
function dernierePerfTexte(nomExo){
  for (let i = historique.length - 1; i >= 0; i--){
    const faites = historique[i].series.filter(x => x.exo === nomExo);
    if (faites.length){
      const detail = faites.map(x => x.type === "temps" ? x.valeur + "s"
                       : x.valeur + (x.poids ? `@${x.poids}kg` : "")).join(" · ");
      return `<p class="petit mono" style="margin-top:8px; color:var(--gris)">Dernière fois (${dateCourte(historique[i].date)}) : ${txt(detail)}</p>`;
    }
  }
  return "";
}


/** Valeurs brutes de la dernière série faite sur cet exercice (pour préremplir). */
function dernierePerfValeurs(nomExo){
  for (let i = historique.length - 1; i >= 0; i--){
    const faites = historique[i].series.filter(x => x.exo === nomExo);
    if (faites.length) return faites[faites.length - 1];
  }
  return null;
}

/* ==========================================================================
   7. SÉANCE EN DIRECT
      On "aplatit" la séance en une simple liste de séries à faire,
      dans l'ordre. C'est ce qui rend le reste du code très court.
   ========================================================================== */
function construireSeries(seance, programme){
  const liste = [];
  seance.blocs.forEach((bloc, ib) => {
    // On ne garde que les exercices du programme choisi (ceux sans mention sont communs)
    const exos = bloc.exercices.filter(e => !e.programme || e.programme === programme);
    for (let tour = 1; tour <= bloc.tours; tour++){
      exos.forEach((exo, ie) => {
        liste.push({
          bloc: bloc.nom, ibloc: ib, tour, tours: bloc.tours,
          dernierExoDuTour: ie === exos.length - 1,
          pauseExos: bloc.pauseExos, pauseTours: bloc.pauseTours,
          exo, fait:false, valeur:null, poidsLest:null
        });
      });
    }
  });
  return liste;
}

async function demarrerSeance(id){
  const s = seanceParId(id);
  if (!s) return;
  active = { seanceId:s.id, nom:s.nom, chaud:!!s.chaud, debut:Date.now(),
             programme:reglages.programme, ressenti:null,
             index:0, series:construireSeries(s, reglages.programme) };
  await Store.ecrire(CLE.active, active);
  garderEcranAllume();
  naviguer("seance");
  rendreSeanceActive();
  lancerChronoSeance();
}

let minuteurSeance = null;
function lancerChronoSeance(){
  clearInterval(minuteurSeance);
  minuteurSeance = setInterval(() => {
    if (!active) return;
    $("#seance-chrono").textContent = mmss((Date.now() - active.debut)/1000);
  }, 500);
}

function rendreSeanceActive(){
  if (!active) return;
  const serie = active.series[active.index];
  $("#seance-nom").textContent = active.nom;

  // Séance terminée : on affiche le résumé
  if (!serie){ rendreFinSeance(); return; }

  const exo = serie.exo;
  const faitesCeSerie = active.series.filter(x => x.exo.nom === exo.nom && x.ibloc === serie.ibloc);
  const pastilles = faitesCeSerie.map(x =>
    `<i class="${x.fait ? "fait" : (x === serie ? "encours" : "")}"></i>`).join("");

  const total = active.series.length;
  const faites = active.series.filter(x => x.fait).length;

  // Le champ de saisie dépend du type d'exercice
  const obj = objectifEffectif(exo);
  const derniere = dernierePerfValeurs(exo.nom);
  const saisie = exo.type === "temps" ? `
      <div class="chrono-exo mono" id="chrono-exo">${mmss(obj)}</div>
      <div class="ligne-champs">
        <div><button class="btn large" data-action="chrono-exo">Démarrer le chrono</button></div>
      </div>
      <div class="ligne-champs" style="margin-top:10px">
        <div>
          <label for="champ-valeur">Tenu (secondes)</label>
          <input id="champ-valeur" class="mono" type="number" inputmode="numeric" value="${obj}">
        </div>
      </div>`
    : `
      <div class="ligne-champs" style="margin-top:4px">
        <div>
          <label for="champ-valeur">Répétitions</label>
          <input id="champ-valeur" class="mono" type="number" inputmode="numeric"
                 value="${obj === "MAX" ? "" : obj}" placeholder="0">
        </div>
        <div>
          <label for="champ-poids-lest">Lest (kg, facultatif)</label>
          <input id="champ-poids-lest" class="mono" type="number" step="0.5" inputmode="decimal" placeholder="—">
        </div>
      </div>`;

  $("#seance-corps").innerHTML = `
    <div class="progression"><i style="width:${Math.round(faites/total*100)}%"></i></div>
    <p class="oeil" style="margin:14px 0 6px">${txt(serie.bloc)} · tour ${serie.tour}/${serie.tours}</p>

    <div class="carte exo-actuel" style="padding-right:80px">
      <h2>${txt(exo.nom)}</h2>
      ${exo.note ? `<p class="petit gris" style="margin-top:4px">${txt(exo.note)}</p>` : ""}
      ${dernierePerfTexte(exo.nom)}
      <div class="pastilles">${pastilles}</div>
      ${htmlDose(exo, active.chaud)}
    </div>

    ${saisie}

    ${derniere ? `<button class="btn large" style="margin-top:10px" data-action="copier-derniere">
        Comme la dernière fois (${derniere.valeur}${exo.type==="temps"?" s":" rép"}${derniere.poids?` · ${derniere.poids} kg`:""})
      </button>` : ""}

    <button class="btn plein large" style="margin-top:14px" data-action="valider">Valider la série</button>
    <button class="btn large" style="margin-top:8px" data-action="sauter">Passer cet exercice</button>

    ${rendreSeriesFaites()}`;
}

function rendreSeriesFaites(){
  // On garde la position de chaque série dans la liste : elle sert au bouton "corriger".
  const faites = [];
  active.series.forEach((serie, i) => { if (serie.fait) faites.push({ serie, i }); });
  if (!faites.length) return "";
  return `<hr><p class="oeil" style="margin-bottom:6px">Séries validées <span class="gris">— touche une ligne pour corriger</span></p>` +
    faites.slice().reverse().map(({ serie, i }) => `
      <div class="serie-faite cliquable" data-action="corriger" data-i="${i}">
        <span>${txt(serie.exo.nom)} <span class="gris petit">· tour ${serie.tour}</span></span>
        <span class="mono">${serie.exo.type === "temps" ? serie.valeur + " s" : serie.valeur + " rép"}${serie.poidsLest ? ` · ${serie.poidsLest} kg` : ""}</span>
      </div>`).join("");
}

async function validerSerie(){
  const serie = active.series[active.index];
  if (!serie) return;
  const champ = $("#champ-valeur");
  const lest  = $("#champ-poids-lest");
  serie.valeur = champ && champ.value !== "" ? Number(champ.value) : 0;
  serie.poidsLest = lest && lest.value !== "" ? Number(lest.value) : null;
  serie.fait = true;
  active.index++;
  await Store.ecrire(CLE.active, active);

  arreterChronoExo();
  vibrer(30);

  // Quel repos déclencher ? Fin de tour = pause longue, sinon pause courte.
  const suivante = active.series[active.index];
  const duree = serie.dernierExoDuTour ? serie.pauseTours : serie.pauseExos;
  if (suivante && duree > 0) demarrerRepos(duree, serie.dernierExoDuTour, suivante);
  else rendreSeanceActive();
}

/** Correction d'une série déjà validée (faute de frappe, série ratée...). */
function corrigerSerie(i){
  const serie = active.series[i];
  if (!serie || !serie.fait) return;
  const etiquette = serie.exo.type === "temps" ? "Secondes tenues" : "Répétitions";
  const v = prompt(etiquette + " — " + serie.exo.nom, serie.valeur);
  if (v === null) return;
  serie.valeur = Number(v) || 0;
  if (serie.exo.type !== "temps"){
    const p = prompt("Lest en kg (laisse vide si aucun)", serie.poidsLest === null ? "" : serie.poidsLest);
    serie.poidsLest = (p === null || p === "") ? null : Number(p);
  }
  Store.ecrire(CLE.active, active);
  rendreSeanceActive();
}

function sauterSerie(){
  active.index++;
  arreterChronoExo();
  rendreSeanceActive();
  Store.ecrire(CLE.active, active);
}

function rendreFinSeance(){
  const faites = active.series.filter(x => x.fait);
  const duree  = (Date.now() - active.debut)/1000;
  $("#seance-corps").innerHTML = `
    <p class="oeil" style="margin:18px 0 6px">Séance terminée</p>
    <h1>${txt(active.nom)}</h1>
    <div class="stat" style="margin-top:16px">
      <div><b>${mmss(duree)}</b><span>Durée</span></div>
      <div><b>${faites.length}</b><span>Séries</span></div>
      <div><b>${faites.filter(x=>x.exo.type!=="temps").reduce((n,x)=>n+x.valeur,0)}</b><span>Répétitions</span></div>
    </div>
    <p class="oeil" style="margin:20px 0 8px">Ressenti — 1 facile, 5 très dur</p>
    <div class="ligne-champs">
      ${[1,2,3,4,5].map(n => `<div><button class="btn large${active.ressenti===n?" plein":""}"
          data-action="ressenti" data-v="${n}">${n}</button></div>`).join("")}
    </div>
    <div style="margin:14px 0 16px">
      <label for="champ-note">Note (sensations, douleurs, conditions…)</label>
      <input id="champ-note" type="text" placeholder="facultatif">
    </div>

    <button class="btn plein large" data-action="enregistrer-seance">Enregistrer dans l'historique</button>
    <button class="btn large danger" style="margin-top:8px" data-action="abandonner">Jeter cette séance</button>`;
}

async function enregistrerSeance(){
  const faites = active.series.filter(x => x.fait);
  if (faites.length){
    historique.push({
      id: Date.now(),
      seanceId: active.seanceId,
      nom: active.nom,
      programme: active.programme,
      ressenti: active.ressenti,
      note: ($("#champ-note") ? $("#champ-note").value : "") || "",
      date: new Date().toISOString(),
      duree: Math.round((Date.now() - active.debut)/1000),
      series: faites.map(x => ({
        exo:x.exo.nom, bloc:x.bloc, tour:x.tour,
        type:x.exo.type, valeur:x.valeur, poids:x.poidsLest
      }))
    });
    await Store.ecrire(CLE.hist, historique);
    await verifierProgression(historique[historique.length - 1]);
  }
  await terminerEtQuitter();
  naviguer("historique");
  rendreHistorique();
}

/** Progression auto : objectif atteint 3 séances de suite -> on propose de relever la cible. */
async function verifierProgression(nouvelle){
  const noms = [...new Set(nouvelle.series.map(s => s.exo))];
  let propositions = 0;
  for (const nom of noms){
    if (propositions >= 2) break;                       // pas plus de 2 questions à la fois
    const exo = trouverExo(nom);
    if (!exo || exo.objectif === "MAX") continue;       // les séries à l'échec n'ont pas de cible
    const cible = objectifEffectif(exo);
    const concernees = historique.filter(h => h.series.some(s => s.exo === nom)).slice(-3);
    if (concernees.length < 3) continue;
    const troisFoisReussi = concernees.every(h =>
      h.series.filter(s => s.exo === nom).every(s => s.valeur >= cible));
    if (!troisFoisReussi) continue;
    const pas = exo.type === "temps" ? 5 : 1;
    if (confirm(nom + " : objectif tenu 3 séances de suite.\nPasser de " + cible + " à " + (cible + pas) + " ?")){
      objectifs[nom] = cible + pas;
      propositions++;
    }
  }
  await Store.ecrire(CLE.obj, objectifs);
}

async function terminerEtQuitter(){
  active = null;
  await Store.ecrire(CLE.active, null);
  clearInterval(minuteurSeance);
  arreterChronoExo();
  libererEcran();
  rendrePlanning();
}


/* ==========================================================================
   8. LES CHRONOS — celui d'un exercice tenu, et celui du repos.
   ========================================================================== */

/* --- Chrono d'exercice (gainage, équilibre, L-sit...) ------------------- */
let minuteurExo = null;
function demarrerChronoExo(){
  const serie = active.series[active.index];
  if (!serie || serie.exo.type !== "temps") return;
  arreterChronoExo();
  const fin = Date.now() + objectifEffectif(serie.exo)*1000;
  bip(880, .1);
  minuteurExo = setInterval(() => {
    const reste = (fin - Date.now())/1000;
    const el = $("#chrono-exo");
    if (el) el.textContent = mmss(reste);
    if (reste <= 0){
      arreterChronoExo();
      bip(520,.35); vibrer([80,60,80]);
      validerSerie();
    }
  }, 100);
}
function arreterChronoExo(){ clearInterval(minuteurExo); minuteurExo = null; }


/* --- Repos entre séries ------------------------------------------------- */
let minuteurRepos = null, finRepos = 0;
function demarrerRepos(secondes, entreTours, suivante){
  finRepos = Date.now() + secondes*1000;
  $("#repos-titre").textContent = entreTours ? "Repos entre tours" : "Repos";
  $("#repos-suite").textContent = suivante ? "Ensuite : " + suivante.exo.nom + " · tour " + suivante.tour : "";
  $("#repos").classList.add("actif");
  tickRepos();
  clearInterval(minuteurRepos);
  minuteurRepos = setInterval(tickRepos, 200);
}
function tickRepos(){
  const reste = (finRepos - Date.now())/1000;
  const el = $("#repos-compte");
  el.textContent = mmss(reste);
  el.classList.toggle("urgent", reste <= 3);
  if (reste <= 0) finirRepos(true);
}
function finirRepos(sonner){
  clearInterval(minuteurRepos);
  $("#repos").classList.remove("actif");
  $("#repos-compte").classList.remove("urgent");
  if (sonner){ bip(700,.25); vibrer([100,60,100,60,180]); }
  rendreSeanceActive();
}


/* ==========================================================================
   9. VUE HISTORIQUE
   ========================================================================== */
function rendreHistorique(){
  // Statistiques rapides sur les 7 derniers jours
  const semaine = historique.filter(h => Date.now() - new Date(h.date) < 7 * JOUR);
  const tempsTotal = semaine.reduce((n,h) => n + h.duree, 0);
  $("#stats").innerHTML = `
    <div><b>${semaine.length}</b><span>Séances / 7 j</span></div>
    <div><b>${Math.round(tempsTotal/60)}</b><span>Minutes / 7 j</span></div>
    <div><b>${historique.length}</b><span>Total</span></div>`;

  $("#alerte").innerHTML = alerteEquilibre();

  if (!historique.length){
    $("#liste-historique").innerHTML = `<p class="vide">Aucune séance enregistrée. Lance-en une depuis le planning.</p>`;
  } else {
    $("#liste-historique").innerHTML = historique.slice().reverse().map(h => {
      const reps = h.series.filter(s => s.type !== "temps").reduce((n,s) => n + s.valeur, 0);
      return `
        <div class="carte cliquable" data-action="detail-seance" data-id="${h.id}">
          <div style="display:flex; justify-content:space-between; align-items:baseline; gap:10px">
            <h3>${txt(h.nom)}</h3>
            <span class="petit mono gris">${dateCourte(h.date)}</span>
          </div>
          <p class="petit mono" style="margin-top:6px; color:var(--acier)">
            ${mmss(h.duree)} · ${h.series.length} séries · ${reps} rép
          </p>
          <div class="detail" hidden></div>
        </div>`;
    }).join("");
  }
  rendreRecords();
}

/** Rappel quand une zone du corps est délaissée depuis trop longtemps. */
function alerteEquilibre(){
  if (!historique.length) return "";
  const messages = [];
  [["bas","les jambes"], ["haut","le haut du corps"]].forEach(([zone, libelle]) => {
    const faites = historique.filter(h => { const s = seanceParId(h.seanceId); return s && s.zone === zone; });
    const derniere = faites[faites.length - 1];
    const jours = derniere ? Math.floor((Date.now() - new Date(derniere.date)) / JOUR) : null;
    if (jours === null) messages.push("Aucune séance pour " + libelle + " pour l'instant.");
    else if (jours >= 10) messages.push("Rien pour " + libelle + " depuis " + jours + " jours.");
  });
  if (!messages.length) return "";
  return `<div class="carte" style="border-color:var(--brique)">
    <p class="oeil" style="color:var(--brique)">Équilibre</p>
    ${messages.map(m => `<p class="petit" style="margin-top:6px">${txt(m)}</p>`).join("")}
  </div>`;
}

function detailSeance(id, carte){
  const h = historique.find(x => x.id === Number(id));
  const zone = carte.querySelector(".detail");
  if (!h || !zone) return;
  if (!zone.hasAttribute("hidden")){ zone.setAttribute("hidden",""); zone.innerHTML=""; return; }
  zone.removeAttribute("hidden");
  const entete = (h.ressenti || h.note)
    ? `<p class="petit gris" style="margin-top:10px">${h.ressenti ? "Ressenti " + h.ressenti + "/5" : ""}${h.note ? " · " + txt(h.note) : ""}</p>`
    : "";
  zone.innerHTML = "<hr>" + entete + h.series.map(s => `
    <div class="serie-faite">
      <span>${txt(s.exo)} <span class="gris petit">· tour ${s.tour}</span></span>
      <span class="mono">${s.type==="temps" ? s.valeur+" s" : s.valeur+" rép"}${s.poids?` · ${s.poids} kg`:""}</span>
    </div>`).join("") +
    `<button class="btn large danger" style="margin-top:12px" data-action="supprimer-seance" data-id="${h.id}">Supprimer cette séance</button>`;
}

/** Meilleure performance par exercice, toutes séances confondues. */
function rendreRecords(){
  const best = {};
  historique.forEach(h => h.series.forEach(s => {
    const cle = s.exo;
    const score = s.valeur + (s.poids ? s.poids*2 : 0); // le lest compte double
    if (!best[cle] || score > best[cle].score) best[cle] = { ...s, score, date:h.date };
  }));
  const noms = Object.keys(best).sort();
  if (!noms.length){ $("#records").innerHTML = `<p class="vide">Tes records apparaîtront ici.</p>`; return; }
  $("#records").innerHTML = `<div id="courbe-exo"></div><div class="carte" style="padding:6px 14px">` + noms.map(n => `
    <div class="serie-faite cliquable" data-action="courbe-exo" data-exo="${txt(n)}">
      <span>${txt(n)}</span>
      <span class="mono">${best[n].type==="temps" ? best[n].valeur+" s" : best[n].valeur+" rép"}${best[n].poids?` · ${best[n].poids} kg`:""}</span>
    </div>`).join("") + `</div>`;
}


/** Courbe de progression d'un exercice : meilleure série de chaque séance. */
function courbeExercice(nom){
  const points = historique
    .filter(h => h.series.some(s => s.exo === nom))
    .map(h => ({ date:h.date, valeur:Math.max(...h.series.filter(s => s.exo === nom).map(s => s.valeur)) }));
  const zone = $("#courbe-exo");
  zone.innerHTML = points.length < 2
    ? `<div class="carte"><p class="petit gris">${txt(nom)} — il faut au moins deux séances pour tracer une courbe.</p></div>`
    : `<div class="carte"><p class="oeil" style="margin-bottom:6px">${txt(nom)} — meilleure série par séance</p>${courbeSVG(points)}</div>`;
  zone.scrollIntoView({ behavior:"smooth", block:"nearest" });
}

/* ==========================================================================
   10. VUE POIDS
   ========================================================================== */
function rendrePoids(){
  if (!$("#champ-date-poids").value) $("#champ-date-poids").value = aujourdhuiISO();

  const points = poids.slice().sort((a,b) => a.date.localeCompare(b.date));
  $("#carte-courbe").innerHTML = points.length < 2
    ? `<p class="vide">Ajoute au moins deux mesures pour voir la courbe.</p>`
    : courbeSVG(points);

  $("#liste-poids").innerHTML = points.length
    ? points.slice().reverse().map(p => `
        <div class="carte" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px">
          <span class="petit gris mono">${dateCourte(p.date)}</span>
          <span class="mono" style="font-size:19px">${p.valeur} kg</span>
          <button class="btn danger petit" data-action="supprimer-poids" data-date="${p.date}">Supprimer</button>
        </div>`).join("")
    : "";
}

/** Petite courbe dessinée à la main en SVG (pas de bibliothèque). */
function courbeSVG(points){
  const L = 320, H = 150, m = 22;
  const vals = points.map(p => p.valeur);
  const min = Math.min(...vals) - .4, max = Math.max(...vals) + .4;
  const x = i => m + i * (L - 2*m) / (points.length - 1);
  const y = v => H - m - (v - min) / (max - min) * (H - 2*m);
  const ligne = points.map((p,i) => `${i?"L":"M"}${x(i).toFixed(1)},${y(p.valeur).toFixed(1)}`).join(" ");
  const aire  = `${ligne} L${x(points.length-1).toFixed(1)},${H-m} L${x(0).toFixed(1)},${H-m} Z`;
  const ronds = points.map((p,i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.valeur).toFixed(1)}" r="2.6" fill="#7fb2e5"/>`).join("");
  return `
    <svg class="courbe" viewBox="0 0 ${L} ${H}" preserveAspectRatio="none" aria-label="Courbe de poids">
      <path d="${aire}" fill="rgba(127,178,229,.12)"/>
      <path d="${ligne}" fill="none" stroke="#7fb2e5" stroke-width="2" stroke-linejoin="round"/>
      ${ronds}
    </svg>
    <div style="display:flex; justify-content:space-between" class="petit gris mono">
      <span>${dateCourte(points[0].date)}</span>
      <span>${min.toFixed(1)} – ${max.toFixed(1)} kg</span>
      <span>${dateCourte(points[points.length-1].date)}</span>
    </div>`;
}

async function ajouterPoids(){
  const valeur = Number($("#champ-poids").value);
  const date   = $("#champ-date-poids").value || aujourdhuiISO();
  if (!valeur) return;
  poids = poids.filter(p => p.date !== date);   // une seule mesure par jour
  poids.push({ date, valeur });
  await Store.ecrire(CLE.poids, poids);
  $("#champ-poids").value = "";
  rendrePoids();
}


/* ==========================================================================
   11. EXPORT / IMPORT (ta sauvegarde : à faire de temps en temps !)
   ========================================================================== */
function exporter(){
  const donnees = { version:1, historique, poids, planning, objectifs };
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "entrainement-" + aujourdhuiISO() + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Export CSV : une ligne par série, pour analyser dans Python. */
function exporterCSV(){
  const lignes = ["date;seance;programme;bloc;tour;exercice;type;valeur;lest;ressenti"];
  historique.forEach(h => h.series.forEach(s => {
    lignes.push([
      h.date, h.nom, h.programme || "", s.bloc, s.tour, s.exo, s.type,
      s.valeur, s.poids === null || s.poids === undefined ? "" : s.poids, h.ressenti || ""
    ].join(";"));
  }));
  const blob = new Blob(["\ufeff" + lignes.join("\n")], { type:"text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "series-" + aujourdhuiISO() + ".csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* --- Sauvegarde en ligne dans un Gist GitHub privé ----------------------
   Il te faut un jeton personnel GitHub avec la seule permission "gist",
   et l'identifiant d'un gist que tu as créé (il est dans son URL).
   Le jeton reste sur ton téléphone : ne fais ça que sur un appareil à toi. */
async function gistEnvoyer(){
  if (!reglages.gistToken || !reglages.gistId) return alert("Renseigne d'abord le jeton et l'identifiant du gist.");
  try{
    const r = await fetch("https://api.github.com/gists/" + reglages.gistId, {
      method:"PATCH",
      headers:{ "Authorization":"Bearer " + reglages.gistToken, "Accept":"application/vnd.github+json" },
      body: JSON.stringify({ files:{ "entrainement.json":{ content:JSON.stringify({ version:1, historique, poids, planning, objectifs }, null, 2) } } })
    });
    alert(r.ok ? "Sauvegarde envoyée." : "GitHub a refusé (" + r.status + "). Vérifie le jeton et l'identifiant.");
  }catch(e){ alert("Envoi impossible : pas de réseau ?"); }
}

async function gistRecuperer(){
  if (!reglages.gistId) return alert("Renseigne l'identifiant du gist.");
  try{
    const entetes = reglages.gistToken ? { "Authorization":"Bearer " + reglages.gistToken } : {};
    const r = await fetch("https://api.github.com/gists/" + reglages.gistId, { headers:entetes });
    if (!r.ok) return alert("GitHub a refusé (" + r.status + ").");
    const g = await r.json();
    const fichier = g.files["entrainement.json"];
    if (!fichier) return alert("Ce gist ne contient pas entrainement.json.");
    if (!confirm("Remplacer les données locales par celles du gist ?")) return;
    const d = JSON.parse(fichier.content);
    historique = d.historique || []; poids = d.poids || [];
    planning = d.planning || PLANNING_DEFAUT; objectifs = d.objectifs || {};
    await Store.ecrire(CLE.hist, historique); await Store.ecrire(CLE.poids, poids);
    await Store.ecrire(CLE.plan, planning);   await Store.ecrire(CLE.obj, objectifs);
    rendrePlanning(); rendreHistorique(); rendrePoids();
    alert("Données récupérées.");
  }catch(e){ alert("Récupération impossible."); }
}

function importer(fichier){
  const lecteur = new FileReader();
  lecteur.onload = async () => {
    try{
      const d = JSON.parse(lecteur.result);
      historique = d.historique || [];
      poids      = d.poids || [];
      planning   = d.planning || PLANNING_DEFAUT;
      objectifs  = d.objectifs || {};
      await Store.ecrire(CLE.obj, objectifs);
      await Store.ecrire(CLE.hist, historique);
      await Store.ecrire(CLE.poids, poids);
      await Store.ecrire(CLE.plan, planning);
      rendrePlanning(); rendreHistorique(); rendrePoids();
      alert("Données importées.");
    }catch(e){ alert("Fichier illisible : ce n'est pas une sauvegarde de l'app."); }
  };
  lecteur.readAsText(fichier);
}


/* ==========================================================================
   12. ÉCOUTEURS — un seul écouteur pour toute l'app (délégation).
       Chaque bouton porte un attribut data-action, traité ici.
   ========================================================================== */
document.addEventListener("click", async (ev) => {
  const onglet = ev.target.closest("#onglets button");
  if (onglet){ naviguer(onglet.dataset.vue); return; }

  const el = ev.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;

  if (a === "demarrer")            { ev.stopPropagation(); demarrerSeance(el.dataset.id); }
  else if (a === "ouvrir-seance")  { ouvrirSeance(el.dataset.id); }
  else if (a === "retour-seances") { rendreSeances(); }
  else if (a === "valider")        { validerSerie(); }
  else if (a === "sauter")         { sauterSerie(); }
  else if (a === "corriger")       { corrigerSerie(Number(el.dataset.i)); }
  else if (a === "ressenti")       { active.ressenti = Number(el.dataset.v); rendreSeanceActive(); }
  else if (a === "copier-derniere"){
    const d = dernierePerfValeurs(active.series[active.index].exo.nom);
    if (d){
      if ($("#champ-valeur")) $("#champ-valeur").value = d.valeur;
      if ($("#champ-poids-lest") && d.poids) $("#champ-poids-lest").value = d.poids;
    }
  }
  else if (a === "chrono-exo")     { demarrerChronoExo(); }
  else if (a === "repos-passer")   { finirRepos(false); }
  else if (a === "repos-plus")     { finRepos += 30000; tickRepos(); }
  else if (a === "terminer-seance"){
    if (!active){ naviguer("planning"); return; }
    active.index = active.series.length;   // plus aucune série à faire -> écran de fin
    rendreSeanceActive();
  }
  else if (a === "enregistrer-seance"){ enregistrerSeance(); }
  else if (a === "reprendre")      { naviguer("seance"); garderEcranAllume(); rendreSeanceActive(); lancerChronoSeance(); }
  else if (a === "abandonner")     { if (confirm("Abandonner cette séance ?")){ await terminerEtQuitter(); naviguer("planning"); } }
  else if (a === "detail-seance")  { detailSeance(el.dataset.id, el); }
  else if (a === "supprimer-seance"){
    ev.stopPropagation();
    if (confirm("Supprimer cette séance de l'historique ?")){
      historique = historique.filter(h => h.id !== Number(el.dataset.id));
      await Store.ecrire(CLE.hist, historique);
      rendreHistorique();
    }
  }
  else if (a === "ajouter-poids")  { ajouterPoids(); }
  else if (a === "supprimer-poids"){
    poids = poids.filter(p => p.date !== el.dataset.date);
    await Store.ecrire(CLE.poids, poids);
    rendrePoids();
  }
  else if (a === "exporter")       { exporter(); }
  else if (a === "exporter-csv")   { exporterCSV(); }
  else if (a === "courbe-exo")     { courbeExercice(el.dataset.exo); }
  else if (a === "gist-envoyer")   { gistEnvoyer(); }
  else if (a === "gist-recuperer") { gistRecuperer(); }
  else if (a === "programme")      {
    reglages.programme = el.dataset.v;
    await Store.ecrire(CLE.reg, reglages);
    rendrePlanning();
  }
  else if (a === "importer")       { $("#fichier-import").click(); }
});

// Changement d'une séance dans le planning
document.addEventListener("change", async (ev) => {
  if (ev.target.matches("#liste-planning select")){
    planning[ev.target.dataset.jour] = ev.target.value || null;
    await Store.ecrire(CLE.plan, planning);
    rendrePlanning();
  }
  if (ev.target.id === "champ-gist-id" || ev.target.id === "champ-gist-token"){
    reglages.gistId    = $("#champ-gist-id").value.trim();
    reglages.gistToken = $("#champ-gist-token").value.trim();
    await Store.ecrire(CLE.reg, reglages);
  }
  if (ev.target.id === "fichier-import" && ev.target.files[0]){
    importer(ev.target.files[0]);
    ev.target.value = "";
  }
});

// Si l'écran se rallume, on remet le verrou d'écran (il saute automatiquement)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && active) garderEcranAllume();
});


/* ==========================================================================
   13. DÉMARRAGE
   ========================================================================== */
(async function demarrer(){
  historique = await Store.lire(CLE.hist, []);
  poids      = await Store.lire(CLE.poids, []);
  planning   = await Store.lire(CLE.plan, PLANNING_DEFAUT);
  active     = await Store.lire(CLE.active, null);
  objectifs  = await Store.lire(CLE.obj, {});
  reglages   = Object.assign({ programme:"A", gistToken:"", gistId:"" }, await Store.lire(CLE.reg, {}));

  $("#champ-gist-id").value    = reglages.gistId;
  $("#champ-gist-token").value = reglages.gistToken;

  // Mode application installable : ne fonctionne qu'en https (GitHub Pages), pas en fichier local
  if ("serviceWorker" in navigator && location.protocol === "https:"){
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  rendrePlanning();
  rendreSeances();
  rendreHistorique();
  rendrePoids();
})();
