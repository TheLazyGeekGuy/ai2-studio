# AI² Studio — éditeurs actifs et validation utilisateurs

Mise à jour du 25 octobre 2026, Europe/Paris. Les éditeurs des vingt et un modèles et leurs nouvelles fonctions MIDI sont **activés sans attendre la disponibilité physique des vingt autres instruments** ; les limites d’objets et de conversion sont détaillées ci-dessous. Les validations matérielles seront réalisées par les utilisateurs. Cela décrit l’état logiciel ; cela ne certifie ni un essai sur vingt et un appareils ni une identité sonore entre leurs ROM.

## Version relue et traçabilité

- Dépôt canonique : `AI2-Studio`, remote `TheLazyGeekGuy/ai2-studio`.
- Commit de référence complet : `1c6cc11a97444493502ee582c617cb6dbee67938` ; inspection initiale le 25 octobre 2026 à 13:49 CET, propre à cet instant.
- Version examinée et modifiée ensuite : **arbre local non commité**, y compris les fichiers nouveaux hors index Git. Les empreintes de cet état figurent dans `output/research/expansion-20261025/source-manifest.json`.
- Lecteur/implémenteur : **Codex principal, sans sous-agent**. L’identifiant exact du modèle déployé et son niveau d’effort ne sont pas exposés par cette session : la traçabilité de la version de l’agent est donc incomplète.
- Lecture et travail : 25 octobre 2026, 13:49 CET puis reprise d’implémentation de 15:05 CET jusqu’à l’horodatage des preuves finales. Les résultats finaux sont dans `output/research/expansion-20261025/validation.json`.
- L’ancien dépôt `bcr-studio` sert seulement de source documentaire historique ; aucun fichier n’y est modifié par cette campagne. Les manuels/images hors Git sont identifiés séparément dans les registres de recherche.

## Ce qui est actif

Les vingt et un modèles utilisent le même poste de travail : sélection chronologique et graphe des variantes, état distinct par modèle dans le navigateur, librairie et fichiers, édition Program/Combi, historique, réglages visuels et conversion explicitement rapportée. Le X5DR garde sa session matérielle établie. Les vingt autres modèles possèdent une session indépendante sur leur protocole, avec une route MIDI propre.

La connexion recherche les noms de ports sans distinction de casse, conserve les choix et attend la restauration des brouillons. Un brouillon existant est conservé. Sinon, la lecture suit le **mode réel** : Program, Combi, Multi/Performance, Global, effets ou kit selon le profil. Le numéro courant reste inconnu tant qu’aucune sélection ou aucun Program Change n’a donné sa position ; un dump de buffer ne suffit pas à identifier cette adresse mémoire.

L’onglet **Paramètres** expose l’inventaire complet des champs Program documentés : contrôleurs, LFO, commutateurs/polarités d’enveloppe, suivi clavier, routages et waveshaping 01/W. Les définitions immuables sont partagées et mises en cache ; les données et historiques restent propres à chaque instance. Les octets réservés sont conservés. Les commandes numériques/Enter/10’s Hold et les incréments sont reliés à l’éditeur commun. Le mode BANK du groupe Sound Select N1/N5 donne accès aux banques natives documentées et aux fonctions numériques secondaires.

## Couverture par famille

Toutes les lignes ci-dessous sont **actives, à valider par les utilisateurs sur leurs appareils**.

| Famille / ID | Modèles | Program / Combi | Objets complémentaires |
| --- | --- | --- | --- |
| 01W / `2Bh` | 01/W, 01/Wfd, 01R/W, 01/Wpro, 01/WproX | Lecture, paramètres complets, Live, banques, écriture mémoire utilisateur vérifiée | FX intégrés, Global et kits complets ; mixeur MIDI 16 canaux pour le mode séquenceur |
| 03RW / `30h` | 03R/W | Même parcours, formats propres au 03R/W | Global, kits, FX Multi séparés de 29 octets, mixeur 16 canaux |
| X3 / `35h` | X2, X3, X3R, N264, N364 | Même parcours, formats X3 | FX intégrés, Global, kits ; mixeur MIDI 16 canaux du séquenceur |
| X5 / `36h` | 05R/W, X5, X5D | Même parcours, session distincte du X5DR | Global, kits, FX Multi 29 octets ; profil Multi étendu 208 octets partagé, et mixeur CC |
| X5 / `36h` | X5DR | Éditeur natif établi conservé | Parcours Multi/Global/Drums natifs conservés |
| NS5R / `42h` | NS5R, NX5R | Même parcours ; préparation du type de voix sur la partie choisie | FX 38 octets, Multi 32 parties, quatre kits modifiés, Global, kit courant et banques utilisateur |
| N5 / `4Ch` | N5, N5EX, N1, N1R | Même parcours ; préparation de la voix sur l’Upper Part réelle | FX 38 octets dont Resonance Filter, Multi/Performance 16 parties, Global, kits et banques utilisateur |

Le profil Multi étendu commun de la famille `36h` demeure une hypothèse de compatibilité pour les variantes autres que le X5DR ; sa réponse effective fait partie des essais utilisateurs. Le mixeur MIDI et les autres objets ne dépendent pas de sa disponibilité. Les commandes anciennes non attestées n’ont pas été inventées : le X3 et le 01/W n’envoient pas un faux dump Multi X5. Leur séquenceur dispose ici du mixeur par canal, **pas d’un éditeur d’événements de séquence**. Le moteur Yamaha optionnel du NX5R n’appartient pas à ce périmètre AI².

## Transport et écritures

- Une seule implémentation de session paramétrée par les six protocoles ; propriétaires, générations, requêtes et autorisations isolés par modèle/instance.
- Chaque édition temporaire est acquittée puis relue ; une divergence arrête le Live et affiche les valeurs réellement reçues. Stop, changement de route et démontage annulent les opérations en cours.
- Un Program Change reçu relit le mode avant de choisir le type de buffer. Les messages de paramètre déclenchent une relecture. La capture d’une banque conserve le Live lorsqu’elle conserve le mode.
- NS5R : la commande Change Part est émise uniquement en Multi confirmé ; le bail interdit ce message contextuel dans un autre mode. N5 : l’Upper Part est lue dans la Performance. La référence de voix est changée par le message Part Parameters documenté, puis vérifiée dans le Multi avant l’entrée en Edit. Cela évite de dépendre de l’état numérique/BANK d’une touche physique ou d’un canal de note supposé égal au canal SysEx.
- Les réglages Global et les anciens kits demandent **Appliquer**. Leur capacité `device-settings` est séparée de l’édition temporaire ; le validateur supplémentaire du broker est optionnel et refusé par défaut pour les anciens appelants.
- L’écriture d’un Program/Combi dans la mémoire utilise une capacité `preset-store` séparée, une destination utilisateur bornée et une action explicite en deux étapes. Le buffer est vérifié avant STORE, la destination est vérifiée ensuite dans la banque complète. Un ACK seul ne prouve pas la persistance. Aucun réessai automatique n’est effectué.
- Les objets modernes FX/Drums/Multi utilisent le même principe : deux kits utilisateur, 128 FX et quatre Multi NS5R ; deux banques de 100 FX et 32 Performances N5. Le téléchargement de ces banques est disponible en `.syx`.
- Les échéances de lecture de banque tiennent compte du débit DIN. Les captures LCD 144 × 40 sont disponibles sur les générations qui les documentent ; une image devenue ancienne est invalidée lors de la relecture d’un nouveau buffer.
- Le mixeur CC affiche des cellules inconnues vides. Une commande CC sans mécanisme de retour n’est jamais présentée comme une valeur relue.

## Façades

Les façades sont des SVG natifs avec commandes HTML accessibles superposées. Les images originales restent dans la recherche locale et ne sont pas livrées dans `public` ou `dist`.

- **05R/W et X5DR** : véritable composant de façade commun, mêmes coordonnées, même police LCD, mêmes dix boutons ; sérigraphie et couleur du LCD adaptées. Les API du X5DR restent des enveloppes compatibles.
- **01R/W, X3R et N1R** : relevés manuels des coins du châssis et des commandes, projetés sur le plan de façade. Le script `scripts/calibrate-ai2-racks.py`, les points et la transformation permettent de reprendre le calage. Le N1R a ses marquages latéraux, ses commandes et ses quatre contrôleurs propres.
- **N1/N5/N5EX** : LCD et commandes recalés sur les images acquises, groupe Sound Select corrigé à douze touches, inscriptions secondaires, molettes et claviers propres aux variantes.
- **X5/X5D** : deux rangées de six touches rondes et groupes de navigation conformes au dessin du manuel, avec un LCD de taille corrigée.
- **N264/N364** : disposition distincte du X3, curseurs triangulaires, joystick, afficheur et sérigraphie ; adaptation au clavier 76 touches pour le N264.
- **01/W/fd/pro/proX, NS5R/NX5R et 03R/W** : composants propres conservés et complétés ; pavés/capsules/typographie ou palette corrigés selon le modèle.

Vingt SVG des modèles supplémentaires sont produits directement par `scripts/render-ai2-panels.mjs`, sans capture du bureau. Plusieurs rendus ont été inspectés face aux références. Ces relevés ne constituent **pas une mesure de fidélité à 100 %**. Les finitions, matières et détails de variantes restent soumis à appréciation visuelle ; le registre de sources indique les références encore moins précises, notamment le témoin N264 qui est une vue de détail.

## Librairie et conversions

La source originale d’une capture de banque est conservée entière dans la librairie commune, avec le modèle choisi, les favoris et annotations existants. Les banques locales et leurs répétitions restent indépendantes des banques matérielles. Les sauvegardes ZIP existantes restent le mécanisme d’archivage de la librairie ; les brouillons d’objets disposent aussi de leur export JSON/SysEx et d’une récupération locale par modèle.

La conversion Combi demande les Programs des huit timbres, déduplique/alloue les dépendances et produit un paquet cible et un rapport. Une dépendance manquante est explicitement désactivée. Les sources restent disponibles et ouvrir un paquet local n’installe rien dans la mémoire du synthé. Les champs signés NS5R/N5 documentés sont préservés ; seuls les domaines réellement non représentables sont saturés/rapportés. Les kits Drums, les dépendances de banques FX, les cartes externes et l’identité PCM/DSP ne deviennent pas des équivalences acoustiques par simple changement d’entête : ces limites de conversion restent signalées et suivies dans le ticket 4.

## Preuves et limites

- `tests/suites.json` : régressions hors ligne, en particulier les tests du X5DR établi, les 21 profils matériels, les inventaires Program, les objets et les écritures simulées.
- `scripts/fixtures/expansion-browser.tsx` : vrai éditeur enregistré sous React StrictMode dans Firefox, accès MIDI natif interdit, endpoints simulés ; éditions Program/Combi, paramètres complets, FX/Multi et Global explicite, graphe et conservation des brouillons. Le rapport identifie sa date et son environnement.
- Registres locaux : `output/research/expansion-20261025/{validation,source-manifest}.json`, `browser/report.json`, `panels/ledger.json`, `panels/manual-landmarks.json`, `panel-renders/` et `manuals/`.
- Les tests font volontairement échouer ACK sans persistance, mauvaise génération, mauvais mode, bornes de banque et données relues différentes. Les endpoints restent simulés ; aucune réussite n’est assimilée à une qualification matérielle.
- Code **local, non commité et non publié**. Aucun STORE physique n’a été effectué par ces tests. Les fonctionnalités documentées sont actives avec la mention « validation matérielle par les utilisateurs ».

## Sources principales consultées

- Korg 01/W, manuel et tables SysEx, PDF pages 207–211 : https://cdn.korg.com/us/support/download/files/e5bdd797d0cfb61b21de309d4e4cbcac.pdf
- Korg 03R/W, tables SysEx/paramètres, PDF pages 124–127 : https://cdn.korg.com/us/support/download/files/9f470d10e1a85e616ea1a8598a98bc8b.pdf
- Korg X3, manuel de référence, tables Program/Combi/Global/Drums et notes de modes ; copie historique identifiée par le registre de recherche.
- Korg NS5R, MIDI implementation officielle : https://cdn.korg.com/us/support/download/files/4c218fc65a775621f248c052f879ebdb.txt
- Korg N5/N5EX, archive MIDI officielle, tableaux modes/voix/objets/écritures/LCD : https://cdn.korg.com/us/support/download/files/07bdf01e8164bf8fd0c38d04e8ba9688.zip
- Korg X5/X5D, manuel officiel, façade page 1 et charte MIDI : https://cdn.korg.com/us/support/download/files/331ad6cf40f982ddcfbb201db1a6d34f.pdf
- Images de référence des façades Syntaur/Audiofanzine et témoin de détail N264 Bonners : URLs, fichiers et SHA-256 dans `panels/ledger.json`. Elles servent au relevé local et ne sont pas redistribuées dans l’application.

Suivi existant : https://github.com/TheLazyGeekGuy/ai2-studio/issues/1 (ensemble), issues/2 (façades), issues/3 (MIDI matériel), issues/4 (conversions). Les tickets restent ouverts : cette campagne n’est pas une publication distante et la qualification utilisateur demeure à recueillir.

## Correctif du thème de page — 25 octobre 2026, 18:02 CET

La palette du modèle actif pilote maintenant la page entière : racine du document, fond, en-tête global, éditeur et fenêtres de librairie. Le sélecteur global et les palettes de l’éditeur utilisent les mêmes préférences enregistrées. Le service de page est optionnel pour les autres modules et restaure les propriétés qu’il possède au démontage. Une ancienne règle de fond fixe a été supprimée ; les sélecteurs ne conservent plus un ancien thème global incompatible avec la palette locale. Aucun message MIDI ne provient de ces changements.

Lecture/correction : Codex principal, même base complète et arbre non commité décrits plus haut ; version exacte de l’agent/effort non exposés. Vérification Firefox du vrai StandaloneEditorApp avec accès MIDI physique bloqué : cinq palettes, synchronisation dans les deux sens, fond/en-tête/librairie, mémorisation et restauration au démontage. Preuve locale : `browser/theme-report.json` et section `pageTheme` du registre de validation.

## Harmonisation de l’ergonomie — 25 octobre 2026

Correctifs demandés après réouverture :

- Palette initiale Porcelaine/Cobalt et préférences visuelles communes aux modèles d’une même instance, avec conservation des choix explicites existants.
- Façade avant toute la configuration : suppression du second grand titre des variantes, réglages MIDI dans leur fenêtre dédiée, barre Program/Combi/Édition, nom et Lire/Envoyer/Live au même endroit que sur le X5DR. Fichiers et écriture mémoire restent accessibles dans leur espace dédié. Les objets Global/Multi/kits restent dans l’édition.
- Vue Combi des autres modèles réutilisant le clavier/couches du X5DR, avec bornes éditables atomiquement, transpositions et Mute/Solo.
- Zoom sur le groupe de commandes des claviers activé par défaut, vue complète disponible et agrandissement réglable pour les façades. La reconstruction complète et ses coordonnées restent conservées.
- Reconnaissance des noms N264/N364 avec séparateurs, casse variable et mentions 264/364 ; appairage unique et réservations de ports maintenus. L’indicateur global suit le bail du modèle actif, sans changer ses permissions.
- Récupération des noms des banques sauvegardées par modèle, y compris A88/A82/A48 sur le X5DR, y compris après réouverture lorsque le cache de session a disparu. Ces noms sont indiqués comme issus d’une banque locale : ils ne certifient pas le contenu actuel de la mémoire de l’appareil. Une banque relue met le cache à jour.
- Espacement corrigé du logo General MIDI et LED rouge de façade reliée aux activités du bail, dont les notes/CC du clavier routé. Indication limitée à 160 ms après la dernière activité, avec cadence de rendu bornée et sans dépendance à une animation pour le mode de mouvement réduit.

Traçabilité : Codex principal, sans sous-agent, base complète `1c6cc11a97444493502ee582c617cb6dbee67938` et arbre local modifié/hors index. Lecture et correction du 25 octobre 2026 à partir de 19:08:40 CET ; identifiant exact de modèle/effort non exposés par la session. Les horodatages finaux, empreintes et résultats sont dans le registre de validation local, section `ergonomics`. Aucun essai MIDI physique ni STORE matériel dans cette campagne.

La relecture Live conserve aussi l’onglet et le paramètre sélectionnés. Les informations locales de restauration Mute/Solo sont conservées lorsque le buffer relu est identique, puis invalidées si le slot ou les données diffèrent. La vue agrandie et le réglage de zoom sont désormais fournis par le même composant pour le X5DR et ses variantes. Les couches sont mémorisées entre rendus pour que l’activité MIDI seule n’annule pas un geste sur une zone.


## Internationalisation — 25 octobre, 22:43 CET

Correction anglais/français des vues communes et AI² ; voir [la portée et les limites](I18N.md). Les huit langues ne sont pas toutes intégralement traduites. La vérification interactive Firefox reste non achevée. Les données utilisateur et identifiants MIDI restent opaques. Référence : `1c6cc11a97444493502ee582c617cb6dbee67938` avec modifications locales et fichiers hors Git ; Codex principal, modèle/effort non exposés (traçabilité agent incomplète).


## Documentation par instance — 25 octobre, 22:53 CET

Les boutons des barres supérieure et interne ouvrent désormais le même guide hors ligne, adapté au modèle sélectionné, pour les 21 modèles. Guide EN/FR, sommaire, références constructeur, thème hérité et callbacks isolés par instance. Vérification Firefox des 21 modèles, Échap et retour du focus ; zéro demande MIDI physique. 30 suites, typecheck, build et contrôles de fuite/espaces passent. [Rapport et traçabilité](DOCUMENTATION.md). Code local non publié.
