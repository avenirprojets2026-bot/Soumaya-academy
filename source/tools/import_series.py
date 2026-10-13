#!/usr/bin/env python3
"""Importe les 5 séries « Examen complet » + corrigés (PDF fournis par le parent) en banque de questions tracée.
Usage : python3 tools/import_series.py <dossier_pdf> <sortie_public> <sortie_json>
Chaque question est découpée en image (aucune retranscription de figures), avec : série, partie, page, points, texte extrait,
corrigé du guide parent. Statut de validation = 'a_valider' tant qu'un adulte n'a pas relu l'extraction."""
import sys, re, glob, os, json, html, subprocess, tempfile
from PIL import Image

SRC, PUB, OUTJSON = sys.argv[1], sys.argv[2], sys.argv[3]
DPI = 100
PAGES = {'grandeurs': [8, 9, 29], 'geometrie': [10, 11, 12, 13], 'arithmetique': [16, 17, 18, 19], 'statistiques': [26, 27, 28]}
PART_LABEL = {'arithmetique': 'Arithmétique', 'grandeurs': 'Grandeurs', 'geometrie': 'Géométrie', 'statistiques': 'Statistiques et logique'}
SKILL = {'arithmetique': 'nombres', 'grandeurs': 'grandeurs', 'geometrie': 'geometrie', 'statistiques': 'donnees'}

def pdf(n, kind):
    c = sorted(glob.glob(os.path.join(SRC, f'*Serie_{n}_{kind}.pdf')))
    return c[0] if c else None

def page_lines(path, p):
    x = subprocess.run(['pdftotext', '-bbox-layout', '-f', str(p), '-l', str(p), path, '-'], capture_output=True, text=True).stdout
    m = re.search(r'<page width="([\d.]+)" height="([\d.]+)"', x)
    W, H = float(m.group(1)), float(m.group(2))
    lines = []
    for lm in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', x, re.S):
        words = [html.unescape(w) for w in re.findall(r'<word[^>]*>(.*?)</word>', lm.group(5), re.S)]
        lines.append((float(lm.group(2)), float(lm.group(4)), ' '.join(words)))
    return W, H, sorted(lines)

def paragraphs(text):
    return [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]

def entries(block):
    out = {}
    block = re.sub(r'Entraînement original[^\n]*', '', block)
    parts = re.split(r'(?m)^(?=\d{1,2} ?/ ?[\d,.]+(?: |:))', block)
    for para in parts:
        m = re.match(r'^\s*(\d+)\s*/\s*([\d,.]+)\s*:?\s*(.*)$', para, re.S)
        if m:
            out[int(m.group(1))] = (float(m.group(2).replace(',', '.')), ' '.join(m.group(3).split()))
    return out

def section(text, start_re, end_res):
    m = re.search(start_re, text, re.M)
    if not m: return ''
    rest = text[m.end():]
    ends = [re.search(e, rest, re.M) for e in end_res]
    ends = [e.start() for e in ends if e]
    return rest[:min(ends)] if ends else rest

def corrige(n):
    path = pdf(n, 'Corrige')
    t = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout
    t = re.sub(r'\n[ \t]*\d{1,2}[ \t]*\n', '\n', t)
    C = {}
    ari = section(t, r'^\x0c?CORRIGÉ \d+ • Arithmétique.*$', [r'^\x0c?CORRIGÉ \d+'])
    C['arithmetique'] = entries(ari)
    gr = section(t, r'^Grandeurs /20', [r'^\x0c?CORRIGÉ \d+', r'^Grandeurs • TML'])
    C['grandeurs'] = entries(gr)
    tml = section(t, r'^Grandeurs • TML /5', [r'^\x0c?CORRIGÉ \d+'])
    C['grandeurs_tml'] = ' '.join(re.sub(r'Entraînement original.*', '', tml, flags=re.S).split())
    geo = section(t, r'Géométrie et sciences', [r'^Sciences /12'])
    C['geometrie'] = entries(geo)
    st = section(t, r'^Statistiques /10', [r'^Tâche logique', r'^\x0c?CORRIGÉ \d+'])
    C['statistiques'] = entries(st)
    tl = section(t, r'^Tâche logique /5', [r'^Grandeurs • TML', r'^\x0c?CORRIGÉ \d+'])
    C['logique'] = ' '.join(re.sub(r'Entraînement original.*', '', tl, flags=re.S).split())
    return C

def serie_title(path):
    t = subprocess.run(['pdftotext', '-f', '8', '-l', '8', '-layout', path, '-'], capture_output=True, text=True).stdout
    m = re.search(r'Série \d+ • ([^\n•]+?)\s*(?:•|\n)', t)
    return (m.group(1).strip() if m else '')

bank = []
os.makedirs(PUB, exist_ok=True)
for n in range(1, 6):
    ex = pdf(n, 'Examen_complet')
    C = corrige(n)
    title = serie_title(ex)
    outdir = os.path.join(PUB, f's{n}'); os.makedirs(outdir, exist_ok=True)
    for part, pages in PAGES.items():
        for p in pages:
            tmp = tempfile.mkdtemp()
            subprocess.run(['pdftoppm', '-r', str(DPI), '-f', str(p), '-l', str(p), '-png', ex, os.path.join(tmp, 'pg')], check=True)
            png = sorted(glob.glob(os.path.join(tmp, 'pg*.png')))[0]
            im = Image.open(png).convert('RGB'); sc = DPI / 72
            W, H, lines = page_lines(ex, p)
            foot = [l for l in lines if l[2].startswith('Entraînement original')]
            bottom = (foot[0][0] - 3) if foot else H - 10
            hdr = [(l[0], l[2]) for l in lines if re.match(r'^Question\s+(\d+|Étape)', l[2]) and not re.search(r':\s*/', l[2])]
            alltext = ' '.join(l[2] for l in lines)
            tml_page = any('Étape' in h[1] for h in hdr) or not hdr
            real_part = part
            if p == 29: real_part = 'grandeurs'
            blocks = []  # (label, y0, y1, points)
            if tml_page:
                pm = re.search(r'(?:TML|Question[^/]*)\s*:?\s*/\s*(\d+)', alltext)
                pts = float(pm.group(1)) if pm else None
                blocks.append(('TML' if 'TML' in alltext else 'Question', 0, bottom, pts))
            else:
                for i, (y, txt) in enumerate(hdr):
                    y1 = hdr[i + 1][0] - 12 if i + 1 < len(hdr) else bottom
                    num = re.match(r'^Question\s+(\d+)', txt)
                    pm = re.search(r'/\s*([\d,.]+)\s*$', txt)
                    if not pm:
                        near = [l[2] for l in lines if abs(l[0] - y) < 8 and re.search(r'/\s*[\d,.]+\s*$', l[2])]
                        pm = re.search(r'/\s*([\d,.]+)\s*$', near[0]) if near else None
                    blocks.append((f'Question {num.group(1)}' if num else txt[:20], 0 if i == 0 else y - 4, y1, float(pm.group(1).replace(',', '.')) if pm else None))
            for (label, y0, y1, pts) in blocks:
                crop = im.crop((0, int(max(0, y0) * sc), im.width, int(y1 * sc)))
                if crop.height < 20: continue
                qn = re.search(r'\d+', label)
                slug = f'p{p}-' + (re.sub(r'\W+', '', label.lower()))
                fn = f'{slug}.jpg'
                crop.save(os.path.join(outdir, fn), quality=62, optimize=True)
                txt = ' '.join(l[2] for l in lines if l[0] >= y0 - 1 and l[1] <= y1 + 1 and not l[2].startswith('Entraînement'))
                if label == 'TML':
                    cor = C['grandeurs_tml'] if p == 29 else (C['arithmetique'].get(10, '') if part == 'arithmetique' else (C['logique'] if part == 'statistiques' else C['geometrie'].get(9, '')))
                else:
                    cor = C[real_part].get(int(qn.group(0)), '') if qn else ''
                if part == 'arithmetique' and p == 19: cor = C['arithmetique'].get(10, '')
                if part == 'geometrie' and p == 13: cor = C['geometrie'].get(9, '')
                cpts = None
                if isinstance(cor, tuple): cpts, cor = cor
                if pts is None: pts = cpts
                bank.append({'id': f's{n}-{slug}', 'serie': n, 'serieTitre': title, 'partie': real_part, 'page': p, 'label': label if label != 'Question' else 'Question',
                             'points': pts, 'image': f'bank/s{n}/{fn}', 'texte': txt, 'corrige': cor, 'source': f'Soumaya_Serie_{n}_Examen_complet.pdf p.{p}',
                             'validation': 'a_valider'})
            os.remove(png)
json.dump({'version': 1, 'note': 'Documents d’entraînement originaux fournis par le parent (non officiels). Extraction automatique à faire valider par un adulte.', 'items': bank}, open(OUTJSON, 'w'), ensure_ascii=False, indent=1)
print(len(bank), 'questions')
