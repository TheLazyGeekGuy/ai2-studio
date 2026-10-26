# Mise à jour automatique AI² Studio

Le build de production génère `app-version.json` et une balise `ai2-build`. L’identifiant dépend du contenu des fichiers, du worker et de sa politique de cache ; reconstruire les mêmes fichiers ne déclenche pas de fausse mise à jour. Le serveur local de prévisualisation bénéficie du détecteur, sans installer de worker hors ligne pour localhost. Le développement conserve le HMR Vite.

## Comportement

- Vérification toutes les 30 secondes, au retour au premier plan et à la reconnexion réseau. Une mise à jour prête attend la fin d’une saisie, d’une fenêtre modale, d’un import ou d’une transaction MIDI. Les notes tenues retardent aussi le rechargement.
- Vérification SHA-256 des fichiers HTML/JS/CSS du nouveau déploiement avant son adoption ; un déploiement partiel, une erreur réseau ou une sauvegarde refusée laisse l’éditeur actuel ouvert. Les requêtes de version évitent le cache hors ligne.
- Sauvegarde attendue du workspace familial dans IndexedDB, avec la protection existante contre les onglets concurrents. Pour le X5DR, une transmission de session liée à la version cible conserve le buffer courant sans écraser un ancien brouillon qui attend encore le choix de restauration.
- Identité d’instance transmise séparément dans chaque onglet. Un autre onglet ne peut pas détourner cette restauration en changeant le dernier identifiant mémorisé globalement. Les préférences MIDI, le modèle et les banques restent dans leurs stockages habituels.
- Pour les sites publiés, préparation du worker en attente puis activation explicite et attente de son contrôle effectif avant navigation. Les anciens fichiers restent accessibles tant que les autres clients n’ont pas annoncé la nouvelle version ; seul le cache d’assets de cette portée est ensuite purgé. Aucune base IndexedDB ni librairie n’est supprimée.
- Rafraîchissement automatique, sans validation manuelle supplémentaire, une fois les sauvegardes terminées. Une tentative récente non aboutie évite une boucle de rechargement rapide. Un indicateur dans l’en-tête explique la préparation ou l’attente.

Le premier chargement de cette fonctionnalité exige une actualisation de l’ancienne page. Elle ne peut pas modifier rétroactivement un ancien JavaScript qui ne contenait aucun détecteur. Aucun STORE MIDI n’est associé à une mise à jour. Une reconnexion suit les réglages et les protections de restauration ordinaires de l’éditeur.

## Vérification

`test-app-update.mjs` couvre l’identifiant déterministe, les inventaires malformés, les fichiers incomplets, les sauvegardes attendues, les travaux en cours, les erreurs de stockage, l’unicité du rechargement, la restauration par onglet, l’activation exacte du worker et la conservation/purge des caches selon les clients.

L’essai Firefox A → B utilise le vrai `StandaloneEditorApp`, le module X5DR et le client de mise à jour. Une saisie native a modifié les Programs en `KEEPLOCAL` et `KEEPWORKER`. Après le changement de déploiement et le délai naturel de vérification : les deux nouvelles pages B retrouvent les noms et les originaux témoins IndexedDB. Le second scénario est effectivement contrôlé par un service worker ; le premier ne l’est pas. Le second passage ne réécrit pas le dernier identifiant global avant la restauration, pour vérifier l’identité propre à l’onglet. Accès MIDI physique bloqué.

Reproduire : lancer `node scripts/verify-app-update-browser.mjs`, ouvrir les chemins `/local/` et `/worker/` du serveur d’essai sur le port 4286, passer le Program en Édition et saisir les noms attendus, puis basculer `stage.json` vers B. Les rapports B constituent les assertions après rechargement ; la préparation A demande une interaction native. Traces locales : `output/research/expansion-20261025/update-browser/` et section `automaticUpdate` du registre de validation.

## Traçabilité

Codex principal, sans sous-agent ; identifiant exact du modèle et effort non exposés par cette session. Lecture et travail le 25 octobre 2026 à partir de 20:06:18 CET ; heure de validation finale et empreintes dans `validation.json` et `source-manifest.json` du registre local. Base du dépôt AI2-Studio : `1c6cc11a97444493502ee582c617cb6dbee67938`, arbre local modifié et fichiers nouveaux hors index, non publiés.

Comparaison en lecture seule avec BCR Studio, commit `d4f024b2fa1a198d44e772003c53edae307e4bcf`, chemins `src/offline.ts` et `build/offline-worker.js` propres au moment de la lecture. Sa préparation hors ligne et sa conservation de session sont réutilisées ; l’adoption automatique, les checkpoints et les tests ci-dessus sont ajoutés dans AI² Studio.
