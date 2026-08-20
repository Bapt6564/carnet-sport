#!/usr/bin/env python3
"""
Analyse des données du carnet d'entraînement.

Utilisation :
    python analyse.py series-2026-08-17.csv          # export CSV de l'app
    python analyse.py entrainement-2026-08-17.json   # export JSON (même résultat)
    python analyse.py series.csv --exo "Tractions pronation"

Produit dans le dossier courant :
    volume_hebdo.png       volume de répétitions par semaine et par zone
    progression.png        meilleure série par séance, pour les exercices les plus fréquents
    plateaux.txt           exercices qui ne progressent plus + résumé chiffré

Dépendances : pandas, matplotlib, numpy
    pip install pandas matplotlib numpy
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


# --------------------------------------------------------------------------
# 1. Lecture des données
# --------------------------------------------------------------------------
def charger(chemin: Path) -> pd.DataFrame:
    """Renvoie un tableau : une ligne par série effectuée."""
    if chemin.suffix.lower() == ".json":
        donnees = json.loads(chemin.read_text(encoding="utf-8"))
        lignes = [
            {
                "profil": donnees.get("profil", ""),
                "date": seance["date"],
                "seance": seance["nom"],
                "bloc": serie["bloc"],
                "tour": serie["tour"],
                "exercice": serie["exo"],
                "type": serie["type"],
                "valeur": serie["valeur"],
                "lest": serie.get("poids") or 0,
                "ressenti": seance.get("ressenti") or np.nan,
                "duree": seance.get("duree", np.nan),
            }
            for seance in donnees["historique"]
            for serie in seance["series"]
        ]
        df = pd.DataFrame(lignes)
    else:
        df = pd.read_csv(chemin, sep=";")
        df["lest"] = pd.to_numeric(df.get("lest"), errors="coerce").fillna(0)

    if df.empty:
        sys.exit("Aucune série dans ce fichier.")

    df["date"] = pd.to_datetime(df["date"], format="mixed", utc=True).dt.tz_localize(None)
    df["jour"] = df["date"].dt.normalize()
    df["semaine"] = df["date"].dt.to_period("W").dt.start_time
    # Charge d'une série : les reps comptent 1, le lest pèse davantage.
    df["charge"] = df["valeur"] * (1 + df["lest"] / 20)
    return df.sort_values("date").reset_index(drop=True)


# --------------------------------------------------------------------------
# 2. Volume hebdomadaire
# --------------------------------------------------------------------------
def volume_hebdo(df: pd.DataFrame):
    reps = df[df["type"] != "temps"]
    pivot = reps.pivot_table(index="semaine", columns="seance",
                             values="valeur", aggfunc="sum").fillna(0)

    # On passe l'index en texte : matplotlib n'aime pas les dates dans un diagramme en barres
    trace = pivot.copy()
    trace.index = [d.strftime("%d/%m") for d in pivot.index]

    fig, ax = plt.subplots(figsize=(9, 4.5))
    trace.plot(kind="bar", stacked=True, ax=ax, width=0.8, colormap="viridis")
    ax.set_xlabel("Semaine")
    ax.set_ylabel("Répétitions totales")
    ax.set_title("Volume hebdomadaire par séance")
    ax.tick_params(axis="x", labelrotation=45)
    ax.legend(fontsize=8, ncol=2)
    fig.tight_layout()
    fig.savefig("volume_hebdo.png", dpi=140)
    plt.close(fig)
    return pivot


# --------------------------------------------------------------------------
# 3. Progression par exercice
#    Pour chaque séance, on garde la meilleure série : c'est l'indicateur
#    le plus stable, il ne dépend pas du nombre de tours effectués.
# --------------------------------------------------------------------------
def meilleures_series(df: pd.DataFrame, exercice: str) -> pd.DataFrame:
    sous = df[df["exercice"] == exercice]
    return (sous.groupby("jour", as_index=False)["charge"].max()
                .rename(columns={"charge": "meilleure"}))


def pente_par_semaine(serie: pd.DataFrame) -> float:
    """Ajustement linéaire : progression moyenne en unités par semaine."""
    if len(serie) < 3:
        return np.nan
    x = (serie["jour"] - serie["jour"].iloc[0]).dt.days.to_numpy() / 7
    y = serie["meilleure"].to_numpy()
    return float(np.polyfit(x, y, 1)[0])


def progression(df: pd.DataFrame, exercices):
    n = len(exercices)
    cols = min(2, n)
    lignes = int(np.ceil(n / cols))
    fig, axes = plt.subplots(lignes, cols, figsize=(6 * cols, 3.2 * lignes), squeeze=False)

    resume = []
    for ax, exo in zip(axes.flat, exercices):
        serie = meilleures_series(df, exo)
        ax.plot(serie["jour"], serie["meilleure"], "o-", color="#2b6cb0", ms=4)
        pente = pente_par_semaine(serie)
        if not np.isnan(pente):
            x = (serie["jour"] - serie["jour"].iloc[0]).dt.days.to_numpy() / 7
            a, b = np.polyfit(x, serie["meilleure"].to_numpy(), 1)
            ax.plot(serie["jour"], a * x + b, "--", color="#c8574a", lw=1,
                    label=f"{pente:+.2f} / semaine")
            ax.legend(fontsize=8)
        ax.set_title(exo, fontsize=10)
        ax.set_ylabel("Meilleure série")
        ax.tick_params(axis="x", labelrotation=30, labelsize=8)
        resume.append((exo, len(serie), pente, serie["meilleure"].max()))

    for ax in axes.flat[n:]:
        ax.axis("off")
    fig.suptitle("Progression : meilleure série par séance", y=1.0)
    fig.tight_layout()
    fig.savefig("progression.png", dpi=140)
    plt.close(fig)
    return resume


# --------------------------------------------------------------------------
# 4. Détection de plateau
#    Un plateau = les 4 dernières séances ne dépassent pas le record
#    établi avant elles. Signal utile pour changer de variante.
# --------------------------------------------------------------------------
def plateaux(df: pd.DataFrame, exercices, fenetre=4):
    lignes = []
    for exo in exercices:
        serie = meilleures_series(df, exo)
        if len(serie) < fenetre + 2:
            continue
        avant = serie["meilleure"].iloc[:-fenetre].max()
        recent = serie["meilleure"].iloc[-fenetre:].max()
        if recent <= avant:
            depuis = (serie["jour"].iloc[-1] - serie["jour"].iloc[-fenetre]).days
            lignes.append(f"  {exo} : record {avant:.0f} inchangé sur {fenetre} séances ({depuis} jours)")
    return lignes


# --------------------------------------------------------------------------
# 5. Programme principal
# --------------------------------------------------------------------------
# --------------------------------------------------------------------------
# 5 bis. Course à pied (présente uniquement dans les exports JSON)
# --------------------------------------------------------------------------
def courses(chemin: Path):
    if chemin.suffix.lower() != ".json":
        return []
    données = json.loads(chemin.read_text(encoding="utf-8")).get("courses", [])
    if not données:
        return []
    c = pd.DataFrame(données)
    c["jour"] = pd.to_datetime(c["date"])
    c["allure"] = (c["duree"] / 60) / c["distance"]        # min/km
    c = c.sort_values("jour")

    fig, ax = plt.subplots(figsize=(9, 3.6))
    ax.plot(c["jour"], c["allure"], "o-", color="#2b6cb0", ms=4)
    ax.invert_yaxis()                                       # plus bas = plus rapide
    ax.set_ylabel("Allure (min/km)")
    ax.set_title("Allure au fil des sorties")
    ax.tick_params(axis="x", labelrotation=30, labelsize=8)
    fig.tight_layout()
    fig.savefig("course.png", dpi=140)
    plt.close(fig)

    return [
        "",
        f"Course : {len(c)} sorties, {c['distance'].sum():.1f} km",
        f"  allure moyenne {c['allure'].mean():.2f} min/km, meilleure {c['allure'].min():.2f} min/km",
        "  figure : course.png",
    ]


def main():
    ap = argparse.ArgumentParser(description="Analyse du carnet d'entraînement")
    ap.add_argument("fichier", type=Path, help="export CSV ou JSON de l'app")
    ap.add_argument("--exo", action="append", default=None,
                    help="exercice à tracer (répétable ; par défaut les 6 plus fréquents)")
    ap.add_argument("--min-seances", type=int, default=2,
                    help="nombre minimum de séances pour qu'un exercice soit tracé")
    args = ap.parse_args()

    df = charger(args.fichier)

    if args.exo:
        exercices = args.exo
    else:
        compte = df.groupby("exercice")["jour"].nunique()
        exercices = compte[compte >= args.min_seances].sort_values(ascending=False).head(6).index.tolist()
    if not exercices:
        sys.exit("Pas encore assez de séances pour tracer une progression.")

    pivot = volume_hebdo(df)
    resume = progression(df, exercices)
    stagnants = plateaux(df, exercices)

    # Corrélation ressenti / volume, si le ressenti a été renseigné
    correlation = ""
    if df["ressenti"].notna().any():
        par_seance = df.groupby("jour").agg(volume=("valeur", "sum"), ressenti=("ressenti", "first")).dropna()
        if len(par_seance) >= 4:
            r = par_seance["volume"].corr(par_seance["ressenti"])
            correlation = f"\nCorrélation volume / ressenti : r = {r:+.2f} sur {len(par_seance)} séances"

    rapport = [
        f"Période : {df['jour'].min():%d/%m/%Y} → {df['jour'].max():%d/%m/%Y}",
        f"Séances : {df['jour'].nunique()}   Séries : {len(df)}   Répétitions : {int(df[df['type'] != 'temps']['valeur'].sum())}",
        f"Volume hebdomadaire moyen : {pivot.sum(axis=1).mean():.0f} répétitions",
        "",
        "Progression (unités par semaine) :",
        *[f"  {exo:35s} {n:2d} séances   {p:+.2f}/sem   record {rec:.0f}"
          for exo, n, p, rec in resume if not np.isnan(p)],
        "",
        "Plateaux détectés :" if stagnants else "Aucun plateau détecté.",
        *stagnants,
        correlation,
        *courses(args.fichier),
    ]
    texte = "\n".join(rapport)
    Path("plateaux.txt").write_text(texte + "\n", encoding="utf-8")
    print(texte)
    print("\nFigures écrites : volume_hebdo.png, progression.png")


if __name__ == "__main__":
    main()
