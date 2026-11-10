# L'Atelier des Savoirs

L'Atelier des Savoirs (Gest Empr) est une application frontend de gestion des emprunts d'une
bibliothèque universitaire. Elle est développée avec React, TypeScript, Vite et
Tailwind CSS.

## Fonctionnalités

- Connexion frontend avec choix du rôle **Consultant** ou **Gérant**.
- Accès séparé : le Consultant consulte le catalogue et ses réservations, le
  Gérant accède uniquement au pilotage des prêts.
- Persistance locale contrôlée de la session, du rôle, du catalogue, des
  réservations, des favoris et de l'historique des retours via `localStorage`.
- Recherche robuste par titre, auteur, domaine, ISBN ou rayon, filtres par
  domaine/disponibilité/année, tri, compteur de résultats et affichage
  grille/liste.
- Favoris locaux, réservation avec synchronisation du stock, file d'attente et
  réinitialisation des données de démonstration.
- Réinitialisation complète et explicite : toutes les données locales de
  l'application sont supprimées, les données de démonstration sont restaurées
  et la session revient à l'état déconnecté.
- Fiche détaillée centrée dans la fenêtre, statut de disponibilité, fermeture
  avec Échap, verrouillage du défilement et navigation clavier accessible.
- Tableau de bord gérant avec statistiques frontend, recherche, filtres de
  retards, états vides, validation des retours et historique local.
- Mode clair/sombre, états de chargement, toasts de confirmation, responsive
  mobile et respect de la préférence de réduction des animations.

L'application reste volontairement frontend-only : la connexion est une
simulation locale et aucun backend ni service d'authentification réel n'est
requis.

## Installation et lancement

Depuis ce dossier :

```bash
npm install
npm run dev
```

Vite indique ensuite l'adresse locale de l'application, généralement
`http://localhost:5173`.

## Vérification de production

```bash
npm run build
```
