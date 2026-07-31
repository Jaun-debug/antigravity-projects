#!/usr/bin/env python3
# Additive 2027 pass: parses each sheet's 2027 pane into L['rates_2027'].
# Leaves existing 2026 rates[] untouched. Re-runnable (auto-updates as sheets gain 2027).
import json, os, re, datetime, shutil
from bs4 import BeautifulSoup
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX=os.path.join(ROOT,"assets","rates-index.json")
SHEET_DIR=os.path.join(ROOT,"ratesheets")
def clean(s): return re.sub(r'\s+',' ',(s or '')).strip()
def to_number(raw):
    if raw is None: return None
    t=raw.strip()
    if t=='' or t.lower() in ('n/a','na','-','—','free','n.c.','nc','included','incl','on request','o/r'): return None
    t2=re.sub(r'\([^)]*\)','',t).replace('N$','').replace('n$','').replace('NAD','').replace('ZAR','').replace('R ','').replace(',','').strip()
    return float(t2) if re.fullmatch(r'-?\d+(\.\d+)?',t2) else None
def cell_text(td):
    for inp in td.find_all('input'): inp.extract()
    return clean(td.get_text(' ',strip=True))
GEN=re.compile(r'rate|price|n\$|nad|per person|pp\b|p\.p|sto|net|amount|cost|tariff',re.I)
FEE=re.compile(r'rack|gross|\bfee\b|conservation|levy|park|tourism|commission|deposit',re.I)
NET=re.compile(r'\bsto\b|\bnet\b',re.I)
def parse_table(table):
    rates=[];headers=[];hdr_row=None
    thead=table.find('thead')
    if thead:
        trs=thead.find_all('tr')
        if trs: hdr_row=trs[-1]
    if hdr_row is None:
        for tr in table.find_all('tr'):
            if tr.find('th'): hdr_row=tr;break
    if hdr_row is not None:
        headers=[clean(c.get_text(' ',strip=True)) for c in hdr_row.find_all(['th','td'])]
    body=[];thead_trs=thead.find_all('tr') if thead else []
    for tr in table.find_all('tr'):
        if tr in thead_trs or tr is hdr_row: continue
        cells=tr.find_all(['td','th'])
        if len(cells)<2: continue
        body.append(cells)
    if not body: return rates
    ncol=max(len(r) for r in body)
    col_vals=[[] for _ in range(ncol)]
    for cells in body:
        for ci in range(ncol):
            col_vals[ci].append(cell_text(cells[ci]) if ci<len(cells) else '')
    price_cols=[]
    for ci in range(ncol):
        vals=[v for v in col_vals[ci] if v!='']
        if not vals: continue
        numc=sum(1 for v in vals if to_number(v) is not None)
        if numc>=max(1,len(vals)*0.5): price_cols.append(ci)
    if not price_cols: return rates
    first=min(price_cols)
    name_cols=[ci for ci in range(first) if ci not in price_cols] or [0]
    hdr=lambda ci: headers[ci] if ci<len(headers) else ''
    net_cols=[ci for ci in price_cols if NET.search(hdr(ci))]
    keep=net_cols or [ci for ci in price_cols if not FEE.search(hdr(ci))] or price_cols
    multi=len(keep)>1
    for cells in body:
        gt=lambda ci: cell_text(cells[ci]) if ci<len(cells) else ''
        parts=[gt(ci) for ci in name_cols if gt(ci)]
        base=' — '.join(parts).strip(' —')
        if not base: continue
        for ci in keep:
            val=to_number(gt(ci))
            if val is None: continue
            h=hdr(ci)
            if multi and h and not GEN.fullmatch(h or ''): label=f"{base} — {h}"
            elif multi: label=f"{base} — {h}" if h else base
            else: label=base
            rates.append({'n':label,'p':val})
    return rates
def table_is_2027(table):
    p=table
    for _ in range(8):
        p=p.parent
        if p is None: break
        dy=p.get('data-year') if hasattr(p,'get') else None
        if dy: return str(dy).strip()=='2027'
    return None
def parse_2027(path):
    soup=BeautifulSoup(open(path,encoding='utf-8',errors='ignore').read(),'html.parser')
    out,seen=[],set()
    for table in soup.find_all('table'):
        if table_is_2027(table)!=True: continue
        for r in parse_table(table):
            k=(r['n'],r['p'])
            if k in seen: continue
            seen.add(k);out.append(r)
    return out
j=json.load(open(INDEX,encoding='utf-8'))
added=0;lodges_with=0
for L in j['lodges']:
    path=os.path.join(SHEET_DIR,os.path.basename(L.get('file','')))
    if not L.get('file') or not os.path.exists(path):
        L.pop('rates_2027',None); continue
    rs=parse_2027(path)
    if rs: L['rates_2027']=rs; lodges_with+=1; added+=len(rs)
    else: L.pop('rates_2027',None)
print('lodges with 2027:',lodges_with,'total 2027 entries:',added)
for L in j['lodges']:
    if L.get('rates_2027'):
        print(' -',L['name'],'->',len(L['rates_2027']),'entries; sample:',json.dumps(L['rates_2027'][:2],ensure_ascii=False))
ts=datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy2(INDEX,INDEX+f'.bak_{ts}')
j['generated']=datetime.datetime.now().isoformat(timespec='seconds')
json.dump(j,open(INDEX,'w',encoding='utf-8'),ensure_ascii=False,indent=0)
print('wrote index; backup .bak_'+ts)
