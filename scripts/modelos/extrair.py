"""Lê os modelos .docx do curso e gera uma estrutura intermediária (JSON) por documento.

Uso: python3 -I scripts/modelos/extrair.py <pasta_docx> <pasta_saida>

Para cada documento gera:
  <id>.json      blocos (parágrafos e tabelas) com formatação e os campos marcados como P1..Pn
  <id>.txt       texto corrido com os campos marcados como ⟦P1|[...]⟧ (usado para nomear os campos)
"""

import json
import os
import re
import sys
import unicodedata
import zipfile
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

CAMPO = re.compile(
    r"\[[^\[\]\n]{0,90}\]"          # [NOME], [...], [estado civil]
    r"|_{3,}"                       # _______
    r"|(?<![A-Za-zÀ-ÿ])[Xx]{3,}(?![A-Za-zÀ-ÿ])"  # XXXXX
    r"|\.{5,}"                      # ..........
)


def slug(nome: str) -> str:
    s = unicodedata.normalize("NFD", nome)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"\.(docx?|DOCX?)$", "", s)
    s = re.sub(r"\(\d+\)", "", s)
    s = re.sub(r"v\.?final", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-{2,}", "-", s)


def ler_numeracao(z: zipfile.ZipFile):
    """numId -> ilvl -> (formato, texto do nível)."""
    if "word/numbering.xml" not in z.namelist():
        return {}
    raiz = ET.fromstring(z.read("word/numbering.xml"))
    abstratos = {}
    for a in raiz.findall(f"{W}abstractNum"):
        niveis = {}
        for lvl in a.findall(f"{W}lvl"):
            fmt = lvl.find(f"{W}numFmt")
            txt = lvl.find(f"{W}lvlText")
            ini = lvl.find(f"{W}start")
            niveis[int(lvl.get(f"{W}ilvl"))] = (
                fmt.get(f"{W}val") if fmt is not None else "decimal",
                txt.get(f"{W}val") if txt is not None else "%1.",
                int(ini.get(f"{W}val")) if ini is not None else 1,
            )
        abstratos[a.get(f"{W}abstractNumId")] = niveis
    mapa = {}
    for n in raiz.findall(f"{W}num"):
        ref = n.find(f"{W}abstractNumId")
        if ref is not None:
            mapa[n.get(f"{W}numId")] = abstratos.get(ref.get(f"{W}val"), {})
    return mapa


ROMANOS = [(1000, "m"), (900, "cm"), (500, "d"), (400, "cd"), (100, "c"), (90, "xc"), (50, "l"), (40, "xl"), (10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i")]


def romano(n):
    r = ""
    for v, s in ROMANOS:
        while n >= v:
            r += s
            n -= v
    return r


def formatar(n, fmt):
    if fmt == "lowerLetter":
        return chr(96 + (n - 1) % 26 + 1)
    if fmt == "upperLetter":
        return chr(64 + (n - 1) % 26 + 1)
    if fmt == "lowerRoman":
        return romano(n)
    if fmt == "upperRoman":
        return romano(n).upper()
    if fmt == "ordinal":
        return f"{n}º"
    return str(n)


class Extrator:
    def __init__(self, z):
        self.numeracao = ler_numeracao(z)
        self.contadores = {}
        self.n_campo = 0

    def rotulo_lista(self, ppr):
        num = ppr.find(f"{W}numPr") if ppr is not None else None
        if num is None:
            return ""
        nid = num.find(f"{W}numId")
        lvl = num.find(f"{W}ilvl")
        if nid is None:
            return ""
        nid = nid.get(f"{W}val")
        ilvl = int(lvl.get(f"{W}val")) if lvl is not None else 0
        niveis = self.numeracao.get(nid)
        if not niveis or ilvl not in niveis:
            return ""
        fmt, texto, inicio = niveis[ilvl]
        if fmt == "bullet":
            return "• "
        if fmt == "none":
            return ""
        cont = self.contadores.setdefault(nid, {})
        cont[ilvl] = cont.get(ilvl, inicio - 1) + 1
        for k in list(cont):
            if k > ilvl:
                del cont[k]
        def troca(m):
            nivel = int(m.group(1)) - 1
            f = niveis.get(nivel, ("decimal", "", 1))[0]
            return formatar(cont.get(nivel, niveis.get(nivel, ("", "", 1))[2]), f)
        return re.sub(r"%(\d)", troca, texto) + " "

    def runs(self, el, saida):
        """Coleta (texto, b, i, u) dos runs, entrando em hyperlinks, inserções e smartTags."""
        for filho in el:
            tag = filho.tag
            if tag == f"{W}r":
                rpr = filho.find(f"{W}rPr")
                def liga(nome):
                    if rpr is None:
                        return 0
                    e = rpr.find(f"{W}{nome}")
                    if e is None:
                        return 0
                    v = e.get(f"{W}val")
                    return 0 if v in ("0", "false", "none") else 1
                b, i, u = liga("b"), liga("i"), liga("u")
                caps = liga("caps")
                for c in filho:
                    if c.tag == f"{W}t":
                        t = c.text or ""
                        saida.append((t.upper() if caps else t, b, i, u))
                    elif c.tag == f"{W}tab":
                        saida.append(("\t", b, i, u))
                    elif c.tag in (f"{W}br", f"{W}cr"):
                        if c.get(f"{W}type") == "page":
                            continue
                        saida.append(("\n", b, i, u))
            elif tag in (f"{W}hyperlink", f"{W}ins", f"{W}smartTag", f"{W}fldSimple", f"{W}sdtContent", f"{W}customXml"):
                self.runs(filho, saida)
            elif tag == f"{W}sdt":
                c = filho.find(f"{W}sdtContent")
                if c is not None:
                    self.runs(c, saida)

    def paragrafo(self, p):
        ppr = p.find(f"{W}pPr")
        al = "left"
        recuo = 0
        estilo = ""
        if ppr is not None:
            jc = ppr.find(f"{W}jc")
            if jc is not None:
                v = jc.get(f"{W}val")
                al = {"center": "center", "right": "right", "end": "right", "both": "justify", "distribute": "justify"}.get(v, "left")
            ind = ppr.find(f"{W}ind")
            if ind is not None:
                esq = ind.get(f"{W}left") or ind.get(f"{W}start") or "0"
                try:
                    recuo = max(0, min(4, round(int(esq) / 720)))
                except ValueError:
                    recuo = 0
            ps = ppr.find(f"{W}pStyle")
            if ps is not None:
                estilo = ps.get(f"{W}val") or ""
        partes = []
        self.runs(p, partes)
        prefixo = self.rotulo_lista(ppr)
        if prefixo:
            partes.insert(0, (prefixo, partes[0][1] if partes else 0, 0, 0))
        # junta tudo num texto com formatação por caractere
        texto = "".join(t for t, *_ in partes)
        fmt = []
        for t, b, i, u in partes:
            fmt.extend([(b, i, u)] * len(t))
        so_linha = bool(re.fullmatch(r"[\s_\-.]*_{3,}[\s_\-.]*", texto))  # linha de assinatura
        segmentos = []
        pos = 0
        if not so_linha:
            for m in CAMPO.finditer(texto):
                if m.start() > pos:
                    segmentos.append(("t", pos, m.start()))
                segmentos.append(("c", m.start(), m.end()))
                pos = m.end()
        if pos < len(texto):
            segmentos.append(("t", pos, len(texto)))
        runs = []
        for tipo, a, b_ in segmentos:
            if tipo == "c":
                self.n_campo += 1
                b, i, u = fmt[a]
                runs.append({"campo": f"P{self.n_campo}", "orig": texto[a:b_], "b": b, "i": i, "u": u})
                continue
            ini = a
            for k in range(a + 1, b_ + 1):
                if k == b_ or fmt[k] != fmt[ini]:
                    b, i, u = fmt[ini]
                    runs.append({"x": texto[ini:k], "b": b, "i": i, "u": u})
                    ini = k
        titulo = estilo.lower().startswith(("heading", "titulo", "título", "title"))
        return {"t": "p", "al": al, "ind": recuo, "titulo": titulo, "runs": runs}

    def blocos(self, el):
        saida = []
        for filho in el:
            if filho.tag == f"{W}p":
                saida.append(self.paragrafo(filho))
            elif filho.tag == f"{W}tbl":
                linhas = []
                for tr in filho.findall(f"{W}tr"):
                    celulas = []
                    for tc in tr.findall(f"{W}tc"):
                        celulas.append(self.blocos(tc))
                    linhas.append(celulas)
                saida.append({"t": "table", "rows": linhas})
            elif filho.tag == f"{W}sdt":
                c = filho.find(f"{W}sdtContent")
                if c is not None:
                    saida.extend(self.blocos(c))
        return saida


def texto_blocos(blocos, linhas):
    for b in blocos:
        if b["t"] == "p":
            linhas.append("".join(r["x"] if "x" in r else f"⟦{r['campo']}|{r['orig']}⟧" for r in b["runs"]))
        else:
            for linha in b["rows"]:
                celulas = []
                for c in linha:
                    sub = []
                    texto_blocos(c, sub)
                    celulas.append(" / ".join(s for s in sub if s.strip()))
                linhas.append("| " + " | ".join(celulas) + " |")


def main():
    origem, destino = sys.argv[1], sys.argv[2]
    os.makedirs(destino, exist_ok=True)
    indice = []
    for nome in sorted(os.listdir(origem)):
        if not nome.lower().endswith(".docx"):
            continue
        nome_nfc = unicodedata.normalize("NFC", nome)
        z = zipfile.ZipFile(os.path.join(origem, nome))
        corpo = ET.fromstring(z.read("word/document.xml")).find(f"{W}body")
        ex = Extrator(z)
        blocos = ex.blocos(corpo)
        # remove parágrafos vazios repetidos (mantém no máximo 1 seguido)
        limpos = []
        for b in blocos:
            vazio = b["t"] == "p" and not "".join(r.get("x", "x") for r in b["runs"]).strip()
            if vazio and limpos and limpos[-1].get("vazio"):
                continue
            if vazio:
                b["vazio"] = True
            limpos.append(b)
        ident = slug(nome_nfc)
        json.dump({"id": ident, "arquivo": nome_nfc, "blocos": limpos, "campos": ex.n_campo}, open(os.path.join(destino, ident + ".json"), "w"), ensure_ascii=False)
        linhas = []
        texto_blocos(limpos, linhas)
        open(os.path.join(destino, ident + ".txt"), "w").write("\n".join(linhas))
        indice.append((ident, ex.n_campo, nome_nfc))
    for i in indice:
        print(f"{i[1]:4}  {i[0]}  ({i[2]})")
    print(len(indice), "modelos")


if __name__ == "__main__":
    main()
