#!/usr/bin/env python3
"""Importe les documents officiels P4 juin 2025 (fournis par le parent) : une image par page, texte extrait pour la recherche.
Aucun corrigé officiel n'étant fourni, aucun n'est inventé : 'corrige' reste vide et la correction revient à un adulte.
Usage : python3 tools/import_official.py <dossier_pdf> <sortie_public> <sortie_json>"""
import sys, re, glob, os, json, hashlib, subprocess
SRC, PUB, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(os.path.join(PUB, 'bank', 'off25'), exist_ok=True)
seen, docs = {}, []
for f in sorted(glob.glob(os.path.join(SRC, '*P4_Juin_2025_Doc_*.pdf'))):
    h = hashlib.md5(open(f, 'rb').read()).hexdigest()
    m = re.search(r'Doc_(\d+)_(.+)\.pdf', os.path.basename(f))
    if h in seen: continue
    seen[h] = 1
    num = int(m.group(1)); name = m.group(2).replace('_', ' ').replace('  ', ' ').strip()
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', f], capture_output=True, text=True).stdout).group(1))
    docs.append((num, name, f, n))
docs.sort()
items = []
for num, name, f, n in docs:
    first = subprocess.run(['pdftotext', '-f', '1', '-l', '1', '-layout', f, '-'], capture_output=True, text=True).stdout
    head = [' '.join(l.split()) for l in first.split('\n') if '➢' in l or 'Document' in l][:4]
    subprocess.run(['pdftoppm', '-r', '95', '-jpeg', '-jpegopt', 'quality=62,optimize=y', f, os.path.join(PUB, 'bank', 'off25', f'd{num}')], check=True)
    for p in range(1, n + 1):
        cands = glob.glob(os.path.join(PUB, 'bank', 'off25', f'd{num}-*{p}.jpg'))
        cands = [c for c in cands if re.search(rf'd{num}-0*{p}\.jpg$', c)]
        fn = os.path.basename(cands[0])
        txt = ' '.join(subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), f, '-'], capture_output=True, text=True).stdout.split())
        items.append({'id': f'off25-d{num}-p{p}', 'doc': num, 'docTitre': name, 'intro': head, 'page': p, 'pages': n, 'image': f'bank/off25/{fn}',
                      'texte': txt[:1500], 'corrige': '', 'source': os.path.basename(f), 'validation': 'a_valider'})
json.dump({'version': 1, 'note': 'Documents officiels Évaluations Interdiocésaines P4, juin 2025, fournis par le parent. Usage privé. Pas de corrigé fourni.', 'items': items}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(items), 'pages', [(d[0], d[3]) for d in docs])
