# Prompt: bygg en studiesida (förbättrad version)

Kopiera allt mellan strecken, fyll i hakparenteserna och skicka med allt material (föreläsningar som PDF, egna eller andras anteckningar, förberedelseinstruktioner, boksidor).

---

Bygg en interaktiv studiesida för **[KURS]** som jag ska plugga inför tentan med. Sidan ska heta **[NAMN]** och se ut och fungera som min tidigare sida **[MALLFIL, t.ex. Biologiatlas_15.html]**. Allt innehåll skrivs på **svenska**. Allt ska ligga i **en enda HTML-fil** som fungerar offline och på GitHub Pages.

Jag skickar allt material i samma meddelande, så du kan börja direkt. Säg först kort vad du har fått, vilka källor som hör ihop och om något verkar saknas jämfört med förberedelseinstruktionerna.

## 1. Källor och etiketter
- Bygg allt på **mitt material**. Hitta inte på fakta.
- Varje fakta får en **källetikett** som visar var den kommer ifrån:
  - **Föreläsning**: `Bild 12` (bildnummer i föreläsningens PDF).
  - **Anteckningar**: `Ant. s. 3` (sidnummer i anteckningarna).
  - **Inte i materialet** men behövs för att förstå: röd etikett **Extra · ej från materialet** och en streckad ruta som säger varför den finns där.
- Rubriker visar intervallet, till exempel `bild 23–32 · ant. s. 8–9`.
- Jämför med förberedelseinstruktionerna och lärandemålen. Säg till om något mål saknar material, och täck det då med en Extra-ruta.
- **Fel och oklarheter i anteckningarna** (felstavade läkemedel, förväxlade begrepp, siffror som inte stämmer med föreläsningen) rättas inte i tysthet. Visa dem i en ruta "Obs! Står annorlunda i källorna" så att jag vet vad som gäller.

## 2. Ingen upprepning mellan källor
- Flera källor tar ofta upp samma sak (till exempel både föreläsningen och anteckningarna). Slå ihop dem till **en** förklaring på **ett** ställe, och sätt båda källetiketterna där.
- Bestäm för varje begrepp **vilket kapitel som äger det**. Där förklaras det fullt ut. Andra kapitel får bara en kort mening och en länk dit ("Mer i fliken Candida → Protesstomatit").
- Samma regel gäller ordlistor, flashcards och quiz: ett begrepp finns bara i det kapitel som äger det. Fliken "Alla begrepp" samlar allt.
- Skriv en tabell i början av arbetet över vilket kapitel som äger vilka överlappande ämnen, och följ den.

## 3. Hjälp mig förstå, inte bara läsa
- Förklara **varför** saker händer, inte bara **vad**. Varje avsnitt ska ha minst en mening som börjar med "Det betyder att ..." eller "Därför ...".
- Använd **animationer** för allt som är en process eller förändras över tid: vågor, transporter, cykler, sjukdomsförlopp, läkemedels verkan, hormonsvar. Eleven ska kunna styra dem (spela, pausa, steg för steg, reglage).
- Varje kapitel har minst **tre** interaktiva delar, valda efter innehållet:
  - klickbar SVG med förklaringspanel och knappar under som gör samma sak
  - steg-för-steg-trappa ("Nästa steg", "Börja om") där bilden ändras för varje steg
  - lägesknappar som byter bild (före/efter, med/utan, akut/kronisk)
  - reglage som ändrar en bild (till exempel blodsocker → insulin och glukagon)
  - animation med spela/pausa
  - "Vad händer om ...?"-knappar där man väljer en orsak och ser följden
  - sorteringsspel med förklaring efter varje svar
- Kliniska ämnen får en **jämförelsetabell för differentialdiagnoser** (utseende, läge, går att skrapa bort, smärta, orsak, behandling).
- Varje kapitel får ett minnesknep för hela kapitlet och minnesknep i de svåraste avsnitten.

## 4. Uppbyggnad
**Skalet**
- Sidhuvud med namnet (klick tar dig till startsidan), flikar som runda knappar med en färgprick per kapitel, en sökruta för hela sidan (`/` fokuserar den) och en knapp för **ljust/mörkt läge**.
- Startsida med liten rubrik i monospace, stor rubrik, kort inledning och kapitelkort (färgad överkant, källa och datum, beskrivning, "Öppna →"). Korten glider in ett i taget.
- Kapitlen ligger inbäddade som JSON och laddas i en `iframe` via `srcdoc` första gången fliken öppnas. Öppen flik sparas i hash och localStorage.
- Sökningen använder ett register över alla avsnitt och ordlisteord, är okänslig för accenter, öppnar rätt flik, scrollar till avsnittet och får ordet att lysa gult en stund.
- Sista fliken **Alla begrepp**: alla ordlistor som flashcards (filter per kapitel, "begrepp först" eller "förklaring först"), automatiskt quiz och sökbar ordlista.

**Varje kapitel**
- Meny till vänster som följer med (sidled-scroll på mobil), aktiv rubrik markeras, källintervall i monospace.
- Startdel: rubrik med ett ord i accentfärg, inledning, tre steg för hur sidan används och ett minnesknep för hela kapitlet.
- Avsnitt med rubrik, underrubrik och källa. Linjen under rubriken ritas fram vid scroll. Byggstenar: text i två kolumner, rutor med färgad vänsterkant (**måste kunna**), gula rutor (**minnesknep**), jämförelsetabeller, egna SVG-bilder med bildtext.
- Slutet, alltid i denna ordning:
  1. **Studiefrågor** från föreläsningen och lärandemålen, med "Visa svarsförslag"
  2. **Sorteringsspel**
  3. **Snabböversikt** (`<b>term</b>` + korta fakta)
  4. **Ordlista** med sökfält
  5. **Flashcards** (3D-vändning, lägena Alla / Bara de jag inte kan / Kör tills jag kan alla / ★ Markerade, filter för korttyp och för källa, framstegsmätare, konfetti, kortkommandon mellanslag ←/→ M R, sparat läge per kapitel)
  6. **Quiz** med fyra alternativ, förklaring och poäng
  7. **Sidfot** med källorna

## 5. Design
- Typsnitt: Bricolage Grotesque (rubriker), Atkinson Hyperlegible (brödtext), JetBrains Mono (etiketter i versaler).
- Färger som CSS-variabler: `--bg --paper --ink --muted --line`, fyra accentfärger med `-soft`-varianter och en accentfärg per kapitel.
- Ljust läge mjukt och varmt (bakgrund `#EEE7DB`, rutor `#F7F2E8`), mörkt läge varmt mörkt. Styrs av `prefers-color-scheme` och `[data-theme]`. Knappen sätter `data-theme` på skalet och i alla iframes och sparar valet.
- Animationer: avsnitt glider in, rätt svar studsar, fel svar skakar, flashcards byter med fjädrande rörelse. Respektera `prefers-reduced-motion` (animationer pausade, allt går att stega manuellt).
- Fungerar på 375 px bredd, knappar minst 44 px.
- Tillgänglighet: `aria-pressed` på växlingsknappar, `aria-live` på paneler, klickbara SVG-delar nåbara med tangentbordet.
- Korta, tydliga meningar, fetmarkera nyckelord, inga tankstreck (—), inga långa citat.

## 6. Data i varje kapitel
```js
// strikt JSON, matar ordlistan, "Alla begrepp" och sökningen
{"qa":   [["Fråga","Svarsförslag","Källa"]],
 "sort": [{"title":"...","groups":["A","B"],"rows":[["Påstående",rättIndex,"Varför"]]}],
 "cheat":[["Term","korta fakta"]],
 "gloss":[["Term","Bild 12","Förklaring"]],
 "cards":[["Ämne","Begrepp|Förklara varför|Siffror och exempel","Fråga","Svar","F|A|X"]],
 "quiz": [["Fråga",["A","B","C","D"],rättIndex,"Förklaring"]]}
```
Sista fältet i korten är källan: F = föreläsning, A = anteckningar, X = extra. Sikta på 20–35 ord i ordlistan, 25–40 flashcards och 18–22 quizfrågor per kapitel.

## 7. Bygg och kontrollera
- Varje kapitel är en egen källfil. Gemensam CSS och JS (flashcards, quiz, ordlista, sorteringsspel, stegtrappor, utforskare) ligger i en motor som byggskriptet (Python) klistrar in i varje kapitel. Skriptet bygger också sökregistret och "Alla begrepp". Då är det lätt att lägga till kapitel senare.
- Kontrollera med skriptet att inga tankstreck finns och att inget ordlisteord finns i två kapitel.
- Testa i webbläsare via lokal server: inga konsolfel, paneler fyllda, animationer går, spel, flashcards och quiz fungerar, sökningen hoppar rätt, båda lägena fungerar, mobilbredd fungerar.
- Lägg till `index.html` som skickar vidare till huvudfilen.

## 8. Kapitel
[LISTA KAPITLEN OCH VILKA KÄLLOR SOM HÖR TILL VARJE, t.ex.
1. Oral medicin · Föreläsning Liedholm 2/9 + anteckningar Munslemhinneförändringar
2. Virologi · Föreläsning Özkaya 16/9 + anteckningar Virus
…]

---
