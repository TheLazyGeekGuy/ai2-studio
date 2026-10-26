# AI² Studio

Éditeur et librairie dans le navigateur pour la famille de synthèse Korg AI², sur l'hôte MIDI Studio.

- **X5DR** : éditeur natif avec édition matérielle par MIDI (Program, Combination, Multi, Drums, Global), envoi live, édition automatique, librairie et banques.
- **Les 20 autres modèles AI²** : interfaces et éditeurs Program/Combi actifs, paramètres complets, MIDI Live avec relecture, banques, écriture mémoire utilisateur explicite, Global/kits et objets propres aux familles. Les générations NS5R/N5 ajoutent les FX et Multi/Performances séparés, leurs banques et leur écriture. Les tests utilisent des instruments simulés ; **la validation matérielle est confiée aux utilisateurs**, sans désactiver les pilotes.
- Un même poste de travail pour tous les modèles : frise de modèles et graphe cliquable des variantes/compatibilités, colonnes d'oscillateur alignées (Source / VDF / VDA puis leurs enveloppes), enveloppes déplaçables, barre d'outils unique, un seul panneau de connexion MIDI et un tiroir bas (moniteur, jeu au clavier, A/B, fichiers, présentation).

```sh
npm install
npm run dev        # http://127.0.0.1:5173 ; ?midi=manual pour démarrer sans demande d'autorisation MIDI
npm test           # suites hors ligne + vérification des types
npm run build      # dist/, utilisable sous n'importe quel sous-chemin
```

L’édition Live utilise les buffers temporaires. Les réglages Global/anciens kits demandent Appliquer ; l’enregistrement en mémoire utilisateur utilise une action explicite et une relecture de la banque. Aucun STORE automatique. Les brouillons et la librairie sont conservés dans ce navigateur (IndexedDB).

[État des lieux et matrice de qualification](docs/EXPANSION-20261025.md). Les façades sont des reconstructions propres aux modèles ; plusieurs variantes restent à qualifier visuellement. Les conversions entre familles documentent leurs correspondances partielles et conservent les sources, sans promettre une identité sonore.
