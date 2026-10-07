# Registre — sensations et compétition

> Visites du 6 octobre 2026 · America/Toronto  
> Collecte ciblée sur les mécaniques d’une direction artistique déjà établie.

**7 expériences officielles accessibles**, dont **3 visuellement observées** et 4 par contenu textuel officiel. Les pages d’une même expérience sont regroupées. Ces revisites ne sont pas ajoutées aux totaux historiques des lots A–F ou de la recherche footer/jeu. MDN est une référence technique, hors décompte de jeux.

| ID | Expérience / URL finale | Preuve et niveau | Observation applicable | Transposition et limite |
|---|---|---|---|---|
| R01 | [Monkeytype](https://monkeytype.com/settings) | Rendu et texte de la page via navigateur. Navigation à la section sonore. **Visuel observé + texte extrait** ; pas d’audition des sons du site | Choix son de frappe, son d’erreur, avertissement de temps, volume ; relance et curseur de rythme décrits | Son facultatif et configurable ; prototype original. Ne pas importer les modes qui font bouger/cacher le texte |
| R02 | [TypeRacer Competitions 2.0](https://blog.typeracer.com/2026/02/24/introducing-competitions-2-0/) | Article officiel du 24 février 2026 ouvert par outil web. **Texte extrait**, pas de partie ou de classement parcouru | Citation commune quotidienne, badges évolutifs, critères différents selon compétition | Comparaisons cohérentes et progression personnelle ; aucune mesure indépendante d’engagement |
| R03 | [Nitro Type, Nitro Radio](https://www.nitrotype.com/news/read/275/tune-in-and-turn-it-up-introducing-nitro-radio) ; [actualités](https://www.nitrotype.com/news/) | L’outil web n’extrait que « Loading ». Page réellement ouverte et article lu dans le navigateur, rendu examiné. **Visuel observé + texte extrait** ; musique non écoutée | Publication du 6 décembre 2025 : musique continue entre course, podium et relance, choix de stations. Le rôle des récompenses est également décrit dans la liste d’actualités | Continuité facultative d’ambiance ; ne pas reprendre sons, véhicules ou économie de saison |
| R04 | [Kahoot, paramètres](https://support.kahoot.com/hc/en-us/articles/115016055107-Live-game-settings) ; [calcul des points](https://support.kahoot.com/hc/en-us/articles/115002303908-How-points-work) | Pages d’aide officielles ouvertes par outil web. **Texte extrait**, aucune session Kahoot jouée | Musique prévisualisable, effets désactivables par option, contraste réglable. La FAQ précise que les séries de bonnes réponses ne donnent pas de points supplémentaires | Ritualiser les événements sans multiplier le score par une série. Aucun bénéfice causal prétendu |
| R05 | [Mario Kart World, Nintendo UK](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-2-games/Mario-Kart-World-2790000.html) | Page officielle ouverte, sections Items/Techniques et courses lues. **Texte extrait**, gameplay non joué | Objets offensifs, esquive, courses multiples, fantômes et personnalisation décrits | Attaque courte avec réponse ; mini-série plus tard. Pas d’affirmation sur les probabilités d’objets selon le rang, qui n’ont pas été étudiées |
| R06 | [Gimkit, Quick Actions](https://help.gimkit.com/en/article/quick-actions-149wiq2/) ; [Mode Picker](https://help.gimkit.com/en/article/select-a-game-mode-6v16fo/) | Deux pages d’aide officielles ouvertes. **Texte extrait**, pas de jeu derrière un compte | Certains modes permettent à l’hôte des ajustements de balance ; ambiance décrite par les labels des modes | Afficher le choix d’ambiance. Ne pas confondre actions de l’hôte avec pouvoirs entre joueurs ni les adopter comme score compétitif |
| R07 | [ZType](https://zty.pe/) | Menu et première vague sur le canvas observés dans le navigateur après « new game ». **Visuel observé + interaction partielle**. L’envoi de mots via l’outil n’a pas pu être exécuté ; tirs et qualité audio non vérifiés | Mots liés à des cibles, descente visible, objectif de jeu immédiat | Piste expressive autour du texte fixe. Ne pas promettre avoir mesuré sa boucle de frappe |

## Accès incomplets et remplacements

- La première URL américaine Mario Kart 8 Deluxe n’était pas exploitable avec l’outil web ; remplacement par la page officielle Nintendo UK de Mario Kart World. Une même marque n’est pas comptée deux fois.
- Monkeytype et Nitro Type étaient incomplets dans l’extraction web ; le navigateur a fourni des pages lisibles. Le blocage de l’extraction n’est pas présenté comme un blocage de l’expérience finale.
- Les résultats de recherche Reddit, Wikipedia, Nintendo Life et tutoriels tiers ne servent pas de preuve pour les règles retenues.

## Références techniques et sources locales

- [MDN — AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) : réutilisation d’un contexte audio, état et reprise.
- [MDN — bonnes pratiques Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) : activation audio après interaction et contrôles.
- [Cahier consolidé](../01-cahier-des-charges.md) et [source PDF du projet](../../sources/cahier-des-charges-2026-10-02.pdf).
- Audit local : `lib/domain/engine.ts`, `lib/client/preferences.ts`, `components/typing-zone.tsx`, `components/race-interface.tsx`.
- [Recherche précédente et corpus étendu](../21-recherche-footer-et-jeu.md).

Les règles Virgule, durées d’avertissement, plafonds, sons du laboratoire et mesures d’évaluation sont **des propositions originales de conception**, pas des comportements attribués aux sites étudiés.
