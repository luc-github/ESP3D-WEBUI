# Tool change — consensus WebUI / pendant

> Statut : consensus validé par les deux équipes (2026-11-14), y compris
> « l'ack est de l'infrastructure, pas de l'ownership ». Rien n'est validé
> sur machine réelle — voir la liste des tests banc en §5, qui est la
> source de vérité pour les inconnues.
>
> Périmètre : changement d'outil grblHAL (`T<n> M6`, modes `$341`, `$TPW`)
> et mode SET (`M61Q`) partagés par le WebUI et le pendant. FluidNC inchangé
> (`M6T<n>` → `atc_manual` → `~`, le firmware palpe seul).

Objectif : un seul et même flow des deux côtés. Le WebUI se considère comme
un pendant ; les deux implémentations ne doivent pas diverger.

## 1. Flow commun

```
IDLE → MOVING_TO_CHANGE → (auto-ack) → WAITING_USER → (PROBING)
     → COMPLETING → SUCCESS / FAILED
```

- Noms d'états communs aux deux codes. WAITING_ACK reste un nom d'état
  transitoire uniquement (l'ack est automatique, voir §3).
- Modes `$341` lus avant Start : mode 4 (M6 ignoré) → Start désactivé avec
  message explicite ; modes 0 et 3 → bouton `$TPW` masqué ; modes 1 et 2 →
  `$TPW` affiché avec un texte de guidance propre au mode :
  - mode 1 (palpage à la position courante) : « Jog above the tool setter,
    then Probe » ;
  - mode 2 (palpage @ G59.3, le firmware s'y déplace seul) : « Install the
    tool, then Probe ».
- Timeouts : 60 s sur MOVING_TO_CHANGE, PROBING et COMPLETING ; aucun sur
  WAITING_USER (action humaine). Le timeout de COMPLETING couvre le palpage
  automatique du mode 3. Timeout → FAILED → règle d'annulation du §2.
- États terminaux explicites SUCCESS / FAILED avec message.
- Bouton Finish envoyant `~` ; le cycle start de la barre de statut reste
  utilisable en parallèle.
- Règle commune palpage : G38 uniquement machine Idle (jamais pendant
  Tool) ; `$TPW` uniquement pendant Tool, après l'ack. Le panel Probe
  classique est verrouillé pendant l'état Tool des deux côtés.

## 2. Annulation / récupération (règle commune)

1. Envoyer `0x18` (soft reset).
2. Attendre un état stable.
3. Si ALARM : l'afficher (« Unlock required, `$X` »), ne **pas** envoyer
   `M61Q` à l'aveugle (G-code verrouillé → error 9).
4. Une fois Idle : relire `$G` ; envoyer `M61Q<précédent>` **uniquement
   si** le numéro d'outil a réellement changé.

L'outil précédent est lu **au moment du Start** (parser state `$G`), pas au
montage du panel : un job ou l'autre UI peut avoir changé l'outil entre
temps.

## 3. Ack et ownership

- **Ack auto des deux côtés** à l'entrée de l'état Tool (comme ioSender) ;
  le pendant abandonne son clic Ack manuel. Si le test banc n°1 montre que
  l'ack déclenche un mouvement en `$341=3`, l'auto-ack devient conditionnel
  au mode, des deux côtés.
- **Ownership du flow UI** (`$TPW`, Finish, guidance) : l'UI qui a envoyé
  le M6 (ou qui streame le job) pilote ; l'autre affiche seulement.
- **L'ack est de l'infrastructure, pas de l'ownership** : les deux côtés
  ackent à la vue de l'état Tool. Tant qu'une UI est connectée, un M6 venu
  d'un job streamé est acquitté même si aucun écran de changement n'est
  ouvert, et une reconnexion ré-acquitte automatiquement dès que l'état
  Tool est revu. Cela ne couvre évidemment pas la CNC coupée ni la liaison
  perdue : dans ces cas le job reste en Tool jusqu'à ce qu'une UI se
  reconnecte — identique des deux côtés. Si le test banc n°5 montre qu'un
  double `0xA3` est nuisible, on bascule sur « seul l'owner acquite ».
- **M6 venu d'un job streamé** : l'UI qui streame possède le changement.
  Côté WebUI : ack global + panel piloté par l'état (rouvrir le panel en
  plein Tool reprend le flow) + cycle start de la barre de statut. Pas de
  navigation automatique vers le panel (pas le modèle du WebUI), mais le
  job n'est jamais bloqué tant qu'une UI est connectée.

## 4. Consensus (8 points)

1. Flow : IDLE → MOVING_TO_CHANGE → (auto-ack) → WAITING_USER → (PROBING)
   → COMPLETING → SUCCESS / FAILED.
2. `$341` lu avant Start : 4 bloque CHANGE ; 0 et 3 masquent `$TPW` ; 1 et
   2 affichent `$TPW` avec leur texte de guidance.
3. Timeouts : 60 s sur MOVING_TO_CHANGE, PROBING, COMPLETING ; aucun sur
   WAITING_USER.
4. Annulation : `0x18` → état stable → ALARM signalée → `M61Q<précédent>`
   seulement après relecture de `$G`, et seulement si nécessaire.
5. Outil précédent lu au Start.
6. G38 uniquement machine Idle ; `$TPW` uniquement en Tool après l'ack.
7. Ownership : l'UI qui a envoyé le M6 (ou streame le job) pilote ; l'autre
   affiche seulement. L'ack reste de l'infrastructure (sous réserve du
   test banc n°5).
8. M6 venu d'un job : traité par le même flow.

## 5. Tests banc (un seul banc, résultats partagés aux deux équipes)

| #   | Test | Tranche |
| --- | --- | --- |
| 1 | `$341=3` : l'ack seul déclenche-t-il un mouvement, ou seulement `~` ? | §3 auto-ack |
| 2 | `$TPW` en modes 1 et 2 : séquence d'états (Tool → Run → Tool ?) et messages de fin (`[PRB:]` ? `[TLO:]` ?) | détection fin de palpage |
| 3 | `$TPW` en mode 0 : réponse | règle de masquage |
| 4 | `0x18` pendant MOVING_TO_CHANGE et pendant PROBING : état résultant, numéro d'outil courant dans `$G` — et **quand** le numéro change-t-il (au `T<n>`, au M6, à l'ack, au cycle start) | §2 annulation + `M61Q` conditionnel |
| 5 | Double `0xA3` | §3 ownership |
| 6 | Outil de référence : comment il est établi (`$TLR` ?), survit-il à un reset | §1 guidance |
| 7 | `T<n> M6` dans un job streamé : comportement sans ack | §3 job |

Les comportements grblHAL cités dans ce document (palpage sur `~` en
mode 3, ALARM après reset en mouvement, `$TLR`) sont des lectures de code
**non vérifiées** — c'est pourquoi ils sont dans la liste de tests.

## 6. État d'implémentation WebUI (implémenté)

- Machine à états complète avec les trois timeouts.
- Annulation/récupération selon §2 ; outil précédent lu au Start.
- `$341` lu au montage : mode 4 bloque Start avec message, modes 0/3
  masquent `$TPW`, modes 1/2 affichent la guidance.
- Bouton Finish (`~`) ; toasts SUCCESS / FAILED.
- Panel Probe classique verrouillé pendant Tool.
- Ack unique via le handler global (BackgroundContainer) — l'ack doublon du
  panel est supprimé.
- Mock grblHAL : `$341` stocké et reflété dans `$$` ; `$TPW` simulé en
  Tool → Run (~2 s) → Tool puis `[PRB:]`/`ok` ou `ALARM:5` ; reset en
  mouvement → ALARM ; reset au repos → efface l'alarme ; `$X` débloque.
  Le flow complet est testable de bout en bout avant la session banc.
