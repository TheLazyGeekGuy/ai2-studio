# AI² Studio

Éditeur et librairie dans le navigateur pour la famille de synthèse Korg AI², sur l'hôte MIDI Studio.

- **X5DR** : éditeur natif avec édition matérielle par MIDI (Program, Combination, Multi, Drums, Global), envoi live, édition automatique, librairie et banques.
- **Les 20 autres modèles AI²** (série 01/W, 03R/W, 05R/W, X2, X3, X3R, X5, X5D, N264, N364, NS5R, NX5R, N5, N5EX, N1, N1R) : édition de fichiers (SysEx, espace de travail JSON), conversion hors ligne entre modèles, édition des Combis, routage clavier / contrôleur. L'édition matérielle de ces modèles n'est pas activée.
- Un même poste de travail pour tous les modèles : curseur de modèle, colonnes d'oscillateur alignées (Source / VDF / VDA puis leurs enveloppes), enveloppes déplaçables, barre d'outils unique, un seul panneau de connexion MIDI et un tiroir bas (moniteur, jeu au clavier, A/B, fichiers, présentation).

```sh
npm install
npm run dev        # http://127.0.0.1:5173 ; ?midi=manual pour démarrer sans demande d'autorisation MIDI
npm test           # suites hors ligne + vérification des types
npm run build      # dist/, utilisable sous n'importe quel sous-chemin
```

Aucun STORE matériel n'est envoyé : les modifications vont dans le buffer d'édition volatil. Les brouillons et la librairie restent dans ce navigateur (IndexedDB).
