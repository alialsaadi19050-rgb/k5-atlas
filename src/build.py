"""Bygger K5-atlas.html av kapitelfilerna i src/chapters.

Kör:  python src/build.py
Varje kapitel är en fil med blocken <!--@meta-->, <!--@rail-->, <!--@body-->,
<!--@css-->, <!--@js--> och <!--@data--> (strikt JSON). Motorn i src/engine
klistras in i varje kapitel. Skriptet bygger också sökregistret och fliken
"Alla begrepp", och varnar för tankstreck och dubbla ordlisteord.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "K5-atlas.html")

def read(*p):
    with open(os.path.join(SRC, *p), encoding="utf-8") as f:
        return f.read()

ENGINE_CSS = read("engine", "engine.css")
ENGINE_JS = read("engine", "engine.js")
ENGINE_CLASSES = set(re.findall(r"(?<![\w#-])\.([a-zA-Z][\w-]*)", ENGINE_CSS)) | {"front", "back", "q", "a", "on", "past", "right", "wrong", "sel", "flip"}
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800'
         '&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@500&display=swap">')

def blocks(text):
    parts = re.split(r"<!--@(\w+)-->", text)
    out = {}
    for i in range(1, len(parts), 2):
        out[parts[i]] = parts[i + 1].strip()
    return out

def strip_tags(s):
    s = re.sub(r"<(svg|script|style)\b.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()

def practice_html(d, meta):
    rail, body = [], []
    rail.append('<i class="sep"></i>')
    rail.append('<a href="#fragor"><span>▶</span>Studiefrågor</a>')
    body.append('<section class="ch" id="fragor"><div class="head"><h2>Studiefrågor</h2>'
                '<span class="mono">från föreläsningen och lärandemålen</span></div>'
                '<p class="txt">Försök svara högt själv innan du öppnar svarsförslaget.</p><div id="qaList"></div></section>')
    for i, s in enumerate(d.get("sort", [])):
        rail.append(f'<a href="#spel{i}"><span>▶</span>{html.escape(s["short"])}</a>')
        tree = ""
        if s.get("tree"):
            tree = ('<div><h3 style="margin-top:0">Frågorna du ställer dig</h3><ol class="tree">'
                    + "".join(f"<li>{t}</li>" for t in s["tree"]) + "</ol></div>")
        game = (f'<div class="panel"><span class="mono" id="srt{i}Count"></span>'
                f'<p class="verdict" id="srt{i}Q" style="margin:.3rem 0 .6rem"></p>'
                f'<div class="route" id="srt{i}Opts"></div><div class="why" id="srt{i}Why" aria-live="polite" hidden></div>'
                f'<div class="row"><button class="btn" id="srt{i}Next" type="button">Nästa påstående</button>'
                f'<span class="score" id="srt{i}Score"></span></div></div>')
        inner = f'<div class="cols"><div>{game}</div>{tree}</div>' if tree else game
        body.append(f'<section class="ch" id="spel{i}"><div class="head"><h2>{s["title"]}</h2>'
                    f'<span class="mono">{s.get("sub","sorteringsspel")}</span></div>{inner}</section>')
    rail.append('<a href="#fusk"><span>▶</span>Snabböversikt</a>')
    rail.append('<a href="#ord"><span>▶</span>Ordlista</a>')
    rail.append('<a href="#kort"><span>▶</span>Flashcards</a>')
    rail.append('<a href="#quiz"><span>▶</span>Quiz</a>')
    srcbtn = ('<div class="seg" id="deckSrc" aria-label="Källa"><button type="button" data-v="" aria-pressed="true">Alla källor</button>'
              '<button type="button" data-v="F" aria-pressed="false">Föreläsning</button>'
              '<button type="button" data-v="A" aria-pressed="false">Anteckningar</button></div>')
    body.append('<section class="ch" id="fusk"><div class="head"><h2>Snabböversikt</h2><span class="mono">läs den kvällen före tentan</span></div><div class="cheat" id="cheatList"></div></section>')
    body.append('<section class="ch" id="ord"><div class="head"><h2>Ordlista</h2><span class="mono" id="glCount"></span></div>'
                f'<input type="search" id="glSearch" class="gl-search" placeholder="Sök ett ord, t.ex. {html.escape(meta.get("glossHint","…"))}" aria-label="Sök i ordlistan"><dl class="gl" id="glList"></dl></section>')
    body.append(flash_html(meta.get("typeSeg") or TYPESEG, srcbtn))
    body.append('<section class="ch" id="quiz"><div class="head"><h2>Quiz</h2><span class="mono">tentafrågor</span></div>'
                '<div class="row"><span class="score" id="qScore">0 / 0</span><button class="btn ghost" id="qReset" type="button">Gör om quizet</button></div><div id="qList"></div></section>')
    return "\n".join(rail), "\n".join(body)

TYPESEG = ('<div class="seg" id="deckType"><button type="button" data-v="" aria-pressed="true">Alla typer</button>'
           '<button type="button" data-v="Begrepp" aria-pressed="false">Begrepp</button>'
           '<button type="button" data-v="Förklara varför" aria-pressed="false">Förklara varför</button>'
           '<button type="button" data-v="Siffror och exempel" aria-pressed="false">Siffror och exempel</button></div>')

def flash_html(typeseg, extra):
    return ('<section class="ch" id="kort"><div class="head"><h2>Flashcards</h2><span class="mono">klicka på kortet för att vända det</span></div>'
            '<div class="fcbar"><div class="seg" id="deckMode"><button type="button" data-v="all" aria-pressed="true">Alla kort</button>'
            '<button type="button" data-v="left" aria-pressed="false">Bara de jag inte kan</button>'
            '<button type="button" data-v="until" aria-pressed="false">Kör tills jag kan alla</button>'
            '<button type="button" data-v="star" aria-pressed="false">★ Markerade</button></div>'
            + typeseg + extra + '</div>'
            '<div class="row"><button class="btn ghost" id="fcShuffle" type="button">Blanda</button><div class="fc-restart">'
            '<button class="btn ghost" id="fcRestart" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="fcRestartMenu">↺ Börja om</button>'
            '<div class="fc-menu" id="fcRestartMenu" role="menu" hidden><button type="button" role="menuitem" data-r="soft"><b>Börja om från första kortet</b>'
            '<span>Samma kortlek i ursprunglig ordning. Det du kan och dina ★-kort sparas.</span></button>'
            '<button type="button" role="menuitem" data-r="hard" class="danger"><b>Nollställ allt</b><span>Rensar vad du kan och filtren (★-kort sparas).</span></button></div></div>'
            '<span class="mono" id="fcStat"></span></div>'
            '<div class="card3d"><div class="flash" id="flash" tabindex="0" role="button" aria-label="Vänd kortet">'
            '<div class="face front"><span class="mono" id="fcTag"></span><div class="q" id="fcQ"></div></div>'
            '<div class="face back"><span class="mono">Svar</span><div class="a" id="fcA"></div></div></div></div>'
            '<div class="fcprog" id="fcProg" aria-hidden="true"><i></i></div>'
            '<div class="row"><button class="btn ghost" id="fcPrev" type="button">← Förra</button>'
            '<button class="btn" id="fcKnow" type="button">Jag kan den ✓</button><button class="btn" id="fcAgain" type="button">Öva mer</button>'
            '<button class="btn ghost" id="fcStar" type="button" aria-pressed="false" title="Markera kortet (M)">☆ Markera</button>'
            '<button class="btn ghost" id="fcNext" type="button">Nästa →</button></div>'
            '<div class="fc-done" id="fcDone" hidden><p>Varvet klart!</p><button class="btn" id="fcDoneRestart" type="button">↺ Kör igen</button>'
            '<button class="btn ghost" id="fcDoneLeft" type="button">Kör tills jag kan alla</button></div>'
            '<p class="mono">Tangentbord: mellanslag vänder · ← → bläddrar · M markerar · R börjar om</p></section>')

def page(meta, rail, body, css, js, data_json, init):
    acc = f':root{{--acc:{meta["color"]}}}@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--acc:{meta["dark"]}}}}}:root[data-theme="dark"]{{--acc:{meta["dark"]}}}'
    safe = lambda s: s.replace("</script", "<\\/script")
    return (f'<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{html.escape(meta["title"])}</title>{FONTS}<style>{ENGINE_CSS}\n{acc}\n{css}</style></head><body>'
            f'<div class="wrap"><nav class="rail" id="rail" aria-label="Avsnitt">{rail}</nav><main>{body}</main></div>'
            f'<script>{safe(ENGINE_JS)}</script>'
            f'<script>var DATA={safe(data_json)};\n(function(){{try{{\n{safe(js)}\n}}catch(e){{console.error("Kapitel-JS:",e)}}}})();\n{init}</script>'
            '</body></html>')

def build():
    files = sorted(f for f in os.listdir(os.path.join(SRC, "chapters")) if f.endswith(".html"))
    metas, pages, sidx, allrows = [], {}, [], []
    warnings, seen = [], {}
    for fn in files:
        b = blocks(read("chapters", fn))
        meta = json.loads(b["meta"])
        d = json.loads(b["data"])
        cid = meta["id"]
        prail, pbody = practice_html(d, meta)
        footer = f'<footer>{meta["footer"]}</footer>'
        body = b["body"] + "\n" + pbody + footer
        init = f'practice(DATA,"k5_{cid}");railSpy();'
        pages[cid] = page(meta, b["rail"] + prail, body, b.get("css", ""), b.get("js", ""), json.dumps(d, ensure_ascii=False), init)
        metas.append({k: meta[k] for k in ("id", "title", "sub", "desc", "color")})
        # sökregister
        for m in re.finditer(r'<section class="ch[^"]*" id="([^"]+)">(.*?)(?=<section class="ch|\Z)', body, flags=re.S):
            sid, sec = m.group(1), m.group(2)
            if sid in ("ord", "kort", "quiz", "fusk"):
                continue
            h = re.search(r"<h2>(.*?)</h2>", sec, flags=re.S)
            head = strip_tags(re.sub(r'<span class="src.*?</span>', "", h.group(1))) if h else sid
            sidx.append({"t": cid, "s": sid, "h": head, "x": strip_tags(sec)[:3000]})
        hh = re.search(r'<header class="hero" id="start">(.*?)</header>', body, flags=re.S)
        if hh:
            sidx.append({"t": cid, "s": "start", "h": meta["title"], "x": strip_tags(hh.group(1))})
        for qa in d.get("qa", []):
            sidx.append({"t": cid, "s": "fragor", "h": qa[0], "x": strip_tags(qa[1])})
        for g in d["gloss"]:
            sidx.append({"t": cid, "s": "ord", "h": g[0], "x": g[2], "g": 1, "c": meta["title"]})
            key = g[0].lower()
            if key in seen:
                warnings.append(f"Ordlisteordet '{g[0]}' finns i både {seen[key]} och {cid}")
            seen[key] = cid
            src = "F" if g[1].lower().startswith("bild") else ("A" if g[1].lower().startswith("ant") else "X")
            allrows.append([g[0], meta["title"] + " · " + g[1], g[2], meta["title"], src])
        # kontroller
        raw = read("chapters", fn)
        clash = set(re.findall(r"(?:^|[},])\s*\.([a-zA-Z][\w-]*)", b.get("css", ""), flags=re.M)) & ENGINE_CLASSES
        if clash:
            warnings.append(f"{cid}: kapitel-CSS använder motorns klassnamn {sorted(clash)}")
        if "—" in raw:
            warnings.append(f"Tankstreck (—) i {fn}: {raw.count('—')} st")
        for i, c in enumerate(d["cards"]):
            if len(c) != 5 or c[4] not in "FAX":
                warnings.append(f"{cid}: kort {i} har fel format")
        for i, q in enumerate(d["quiz"]):
            if len(q[1]) != 4 or not 0 <= q[2] < 4:
                warnings.append(f"{cid}: quizfråga {i} har fel format")
        for s in d.get("sort", []):
            for r in s["rows"]:
                if not 0 <= r[1] < len(s["groups"]):
                    warnings.append(f"{cid}: sorteringsrad fel index: {r[0]}")
        print(f"{cid:10} gloss {len(d['gloss']):3}  kort {len(d['cards']):3}  quiz {len(d['quiz']):3}  frågor {len(d.get('qa',[])):2}  spel {sum(len(s['rows']) for s in d.get('sort',[])):3}  {len(pages[cid])//1024} kB")

    # Alla begrepp
    allrows.sort(key=lambda r: r[0].lower())
    titles = [m["title"] for m in metas]
    typeseg = ('<div class="seg" id="deckType"><button type="button" data-v="" aria-pressed="true">Alla kapitel</button>'
               + "".join(f'<button type="button" data-v="{html.escape(t)}" aria-pressed="false">{html.escape(t)}</button>' for t in titles) + "</div>")
    dirseg = '<div class="seg" id="deckDir"><button type="button" data-v="t" aria-pressed="true">Begrepp först</button><button type="button" data-v="d" aria-pressed="false">Förklaring först</button></div>'
    srcseg = ('<div class="seg" id="deckSrc" aria-label="Källa"><button type="button" data-v="" aria-pressed="true">Alla källor</button>'
              '<button type="button" data-v="F" aria-pressed="false">Föreläsning</button><button type="button" data-v="A" aria-pressed="false">Anteckningar</button></div>')
    counts = "".join(f'<div><b>{html.escape(t)}</b>{sum(1 for r in allrows if r[3]==t)} begrepp</div>' for t in titles)
    bmeta = {"id": "begrepp", "title": "Alla begrepp", "color": "#2D8452", "dark": "#63C28E"}
    bbody = (f'<header class="hero" id="start"><div class="mono">Kurs 5 · alla flikar · {len(allrows)} begrepp</div><h1>Alla <em>begrepp</em></h1>'
             '<p class="lead">Varje begrepp från alla flikars ordlistor, samlat som flashcards, quiz och ordlista. Välj ett kapitel eller kör allt på en gång. Du kan också vända korten och få förklaringen först.</p>'
             f'<div class="cheat">{counts}</div></header>'
             + flash_html(typeseg, dirseg + srcseg)
             + '<section class="ch" id="quiz"><div class="head"><h2>Quiz</h2><span class="mono">vilket begrepp beskrivs? nya frågor varje gång</span></div>'
             '<div class="row"><span class="score" id="qScore">0 / 0</span><button class="btn ghost" id="qReset" type="button">Nya frågor</button></div><div id="qList"></div></section>'
             '<section class="ch" id="ord"><div class="head"><h2>Ordlista</h2><span class="mono" id="glCount"></span></div>'
             '<input type="search" id="glSearch" class="gl-search" placeholder="Sök bland alla begrepp" aria-label="Sök i ordlistan"><dl class="gl" id="glList"></dl></section>'
             '<footer>Samlar ordlistorna från alla flikar. Uppdateras automatiskt när byggskriptet körs.</footer>')
    brail = '<a href="#start"><span>▶</span>Start</a><a href="#kort"><span>▶</span>Flashcards</a><a href="#quiz"><span>▶</span>Quiz</a><a href="#ord"><span>▶</span>Ordlista</a>'
    bjs = read("engine", "begrepp.js")
    pages["begrepp"] = page(bmeta, brail, bbody, "", bjs, json.dumps(allrows, ensure_ascii=False), "railSpy();")
    metas.append({"id": "begrepp", "title": "Alla begrepp", "sub": "Flashcards · hela atlasen", "color": "#2D8452",
                  "desc": "Alla begrepp från alla flikars ordlistor som flashcards, quiz och sökbar ordlista. Välj kapitel eller kör allt."})
    shell = read("shell.html")
    def jscript(o):
        return json.dumps(o, ensure_ascii=False).replace("<", "\\u003c")
    shell = (shell.replace("/*META*/", jscript(metas))
                  .replace("<!--PAGES-->", jscript(pages))
                  .replace("<!--SIDX-->", jscript(sidx))
                  .replace("<!--TITLES-->", jscript({m["id"]: m["title"] for m in metas})))
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(shell)
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write('<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>K5-atlas</title>'
                '<meta http-equiv="refresh" content="0; url=K5-atlas.html"></head>'
                '<body><a href="K5-atlas.html">Öppna K5-atlas</a></body></html>')
    print(f"\nAlla begrepp: {len(allrows)}   Sökregister: {len(sidx)} poster   Fil: {os.path.getsize(OUT)//1024} kB")
    for w in warnings:
        print("VARNING:", w)
    return not warnings

if __name__ == "__main__":
    sys.exit(0 if build() else 1)
