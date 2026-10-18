"""Parser for the EZOTI list of maximum prices of basic goods (PDF on gov.sr).

The ministry publishes a new 'Lijst Basis goederen' about every two weeks. Columns are
found from word positions, so small layout changes between lists do not break it.
"""
import re
import sys
from collections import Counter

import pdfplumber


def _lines(words):
    out, cur, top = [], [], None
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        if top is None or abs(w['top'] - top) <= 3:
            cur.append(w); top = w['top'] if top is None else top
        else:
            out.append(sorted(cur, key=lambda w: w['x0'])); cur, top = [w], w['top']
    if cur: out.append(sorted(cur, key=lambda w: w['x0']))
    return out


def _num(t, i):
    j, buf = i, ''
    while j < len(t) and re.fullmatch(r'[\d.,]+', t[j]):
        buf += t[j]; j += 1
    return float(buf.replace(',', '')), j


def parse(path):
    """Rows of the EZOTI 'Lijst Basis goederen' PDF: product, importer, wholesale pack and max price,
    retail pack and max consumer price. Columns are found from the word positions."""
    cand, period = [], None
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            if not period:
                m = re.search(r'Geldigheidsduur:\s*(.+)', page.extract_text() or '')
                if m: period = m.group(1).strip()
            for ws in _lines(page.extract_words(x_tolerance=1.5)):
                t = [w['text'] for w in ws]
                srd = [i for i, x in enumerate(t) if x == 'SRD']
                if len(srd) != 2 or srd[0] < 2:
                    continue
                try:
                    wv, wj = _num(t, srd[0] + 1); rv, _ = _num(t, srd[1] + 1)
                except Exception:
                    continue
                cand.append((ws[:srd[0]], wv, ' '.join(t[wj:srd[1]]), rv))
    if not cand:
        return period, []
    pcol = Counter(round(w['x0']) for head, *_ in cand for w in head if w['text'] == 'per').most_common(1)
    pcol = pcol[0][0] - 4 if pcol else 10 ** 6
    xs = Counter()
    for head, *_ in cand:
        h = [w for w in head if w['x0'] < pcol]
        gaps = [(h[i + 1]['x0'] - h[i]['x1'], i) for i in range(len(h) - 1)]
        if gaps: xs[round(h[max(gaps)[1] + 1]['x0'])] += 1
    icol = xs.most_common(1)[0][0] - 3 if xs else 0
    rows = []
    for head, wv, rp, rv in cand:
        product = ' '.join(w['text'] for w in head if w['x0'] < icol).strip()
        importer = ' '.join(w['text'] for w in head if icol <= w['x0'] < pcol).strip()
        importer = re.sub(r'fact\.?\s*nr\.?:?\s*\S+', '', importer, flags=re.I).strip()
        wp = ' '.join(w['text'] for w in head if w['x0'] >= pcol).strip()
        if wp.lower().startswith('fact'):
            wp = ''
        if product and 0 < rv < 100000:
            rows.append({'product': product, 'importer': importer, 'w_pack': wp, 'w_price': wv, 'r_pack': rp, 'r_price': rv})
    return period, rows


if __name__ == '__main__':
    p, r = parse(sys.argv[1]); print(p, len(r))
    for x in r: print(x['product'], '|', x['importer'], '|', x['w_pack'], x['w_price'], '|', x['r_pack'], x['r_price'])
