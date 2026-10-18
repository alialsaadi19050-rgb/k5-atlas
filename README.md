# K5-atlas

Interaktiv studiesida för Tandläkarprogrammet, Kurs 5: oral medicin, knölar och nybildningar, virologi, Candida, mag-tarmkanalens fysiologi och energibalans. Klickbara bilder, animationer, sorteringsspel, flashcards och quiz.

**Öppna sidan:** https://alialsaadi19050-rgb.github.io/k5-atlas/

## Bygga om

Varje kapitel ligger i `src/chapters/`. Efter en ändring:

```bash
python src/build.py
```

Skriptet bygger `K5-atlas.html` och varnar för tankstreck, dubbla ordlisteord och krockande klassnamn.
