# Documentation par instance et modèle

Le bouton de la barre supérieure passait par le contrat optionnel `EditorViewRuntime.openDocumentation`. La vue AI² ne le fournissait pas : le composant générique ouvrait alors `./docs/`, répertoire absent de la distribution. Les commandes propres à l’éditeur n’avaient pas d’accès commun au guide.

La vue fournit désormais cette action avec une liaison créée séparément pour chaque instance, sur le même principe que ses réglages MIDI. Elle est retirée au démontage et à la destruction. Le contexte de documentation de la vue relie ses commandes internes à la même fenêtre que le bouton du haut. Les 21 modèles utilisent ce mécanisme ; le contenu suit le modèle sélectionné sans remplacer la session ni toucher au transport MIDI. Le contrat hôte reste inchangé et optionnel.

Le guide intégré couvre la prise en main, la connexion et le clavier, Program/effets, Combi/Multi, librairie/sauvegardes, conversions et objets du modèle. Il affiche le modèle et ses comptes de catalogue, propose un sommaire, suit le thème et la langue, et fonctionne hors ligne. Le complément du 26 octobre fournit les huit langues proposées : anglais, français, italien, allemand, japonais, espagnol, russe et chinois simplifié. Les références constructeur sont des liens externes, avec les documents de famille identifiés comme tels. Le guide de l’application ne remplace pas le manuel matériel exact d’une variante.

La fenêtre utilise le dialogue modal natif : navigation au clavier, titre accessible, fermeture par Échap, croix ou fond. La fermeture déclenchée par l’arrêt de l’effet dans StrictMode est ignorée si le dialogue a déjà été rouvert ; cela évite une fermeture différée immédiatement après l’ouverture.

## Preuves et limites

- `scripts/test-ai2-documentation.mjs` : rendu des 21 guides en anglais/français, références constructeur, callbacks de deux instances indépendantes, retrait des actions au démontage/destruction et accès commun depuis les deux barres.
- `scripts/fixtures/documentation-browser.tsx` : vrais composants dans Firefox sous StrictMode, 21 modèles, deux accès, changement de langue sans perte du dialogue et présence du lien constructeur. Résultat conservé dans `output/research/expansion-20261025/documentation/browser-report.json`.
- Contrôle natif Firefox supplémentaire : ouverture du guide N1R depuis la barre supérieure, fermeture par Échap et retour du focus au bouton Documentation. Aucune capture d’écran. Aucun accès MIDI physique ni STORE.
- 30 suites passent, ainsi que le typecheck, le build de distribution, le contrôle de fuite incluant les artefacts et le contrôle des espaces. Les liens externes restent distincts du guide embarqué ; le scénario de navigateur ne télécharge pas les documents constructeur.

## Traçabilité

Codex principal, sans sous-agent, lecture et modification le 25 octobre 2026 entre 22:44 et 22:53 CET. Le modèle exact et le niveau d’effort ne sont pas exposés : traçabilité de version de l’agent incomplète.

Dépôt `TheLazyGeekGuy/ai2-studio`, racine `.`, HEAD complet `1c6cc11a97444493502ee582c617cb6dbee67938`. Lecture du contrat et des composants `src/editor-host/view-contract.ts`, des composants `src/editor-host/{DocumentationLink,StandaloneEditorApp}.tsx`, de `src/main.tsx`, de la vue X5DR et de l’atelier AI². Modifications locales et fichiers hors Git préexistants conservés ; nouveaux fichiers du guide non commités. Le manifeste de sources horodaté identifie l’état local exact.

Comparaison en lecture seule avec BCR Studio, HEAD `d4f024b2fa1a198d44e772003c53edae307e4bcf`, arbre modifié (108 entrées à la lecture), fichiers `src/editors/fireworx/{registration,view,UserManual}.tsx`. Références externes reprises de `docs/EXPANSION-20261025.md`, du descripteur X5DR et des registres de recherche hors Git `output/research/korg-ai2/primary/{ledger.json,x3-reference.source.json}` de BCR Studio ; leurs documents sont explicitement distingués des guides de variantes exactes. Aucun fichier BCR Studio modifié. Code AI² local, non commité, non publié.
