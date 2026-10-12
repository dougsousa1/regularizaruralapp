"""Junta a estrutura extraída (extrair.py) com o mapa de campos e gera os modelos finais.

Uso: python3 -I scripts/modelos/montar.py <pasta_extraida> <pasta_mapas> conteudo/modelos

Cada conteudo/modelos/<id>.json tem os metadados, a definição dos campos e o documento no formato
do editor (TipTap/ProseMirror): parágrafos, tabelas, texto com negrito/itálico/sublinhado e nós "campo".
"""

import json
import os
import sys


def marcas(r):
    m = []
    if r.get("b"):
        m.append({"type": "bold"})
    if r.get("i"):
        m.append({"type": "italic"})
    if r.get("u"):
        m.append({"type": "underline"})
    return m


def texto_no(texto, mk):
    no = {"type": "text", "text": texto}
    if mk:
        no["marks"] = mk
    return no


def paragrafo(b, mapa, ordem):
    conteudo = []
    for r in b["runs"]:
        mk = marcas(r)
        if "campo" in r:
            chave = mapa[r["campo"]]
            if chave not in ordem:
                ordem.append(chave)
            no = {"type": "campo", "attrs": {"chave": chave}}
            if mk:
                no["marks"] = mk
            conteudo.append(no)
            continue
        partes = r["x"].split("\n")
        for k, parte in enumerate(partes):
            if k:
                conteudo.append({"type": "hardBreak"})
            if parte:
                conteudo.append(texto_no(parte, mk))
    attrs = {"textAlign": b.get("al", "left")}
    if b.get("ind"):
        attrs["recuo"] = b["ind"]
    no = {"type": "paragraph", "attrs": attrs}
    if conteudo:
        no["content"] = conteudo
    return no


def blocos(lista, mapa, ordem):
    saida = []
    for b in lista:
        if b["t"] == "p":
            saida.append(paragrafo(b, mapa, ordem))
        else:
            linhas = []
            for linha in b["rows"]:
                celulas = []
                for c in linha:
                    conteudo = blocos(c, mapa, ordem) or [{"type": "paragraph"}]
                    celulas.append({"type": "tableCell", "content": conteudo})
                if celulas:
                    linhas.append({"type": "tableRow", "content": celulas})
            if linhas:
                saida.append({"type": "table", "content": linhas})
    # sem parágrafos vazios no começo e no fim
    while saida and saida[0]["type"] == "paragraph" and not saida[0].get("content"):
        saida.pop(0)
    while saida and saida[-1]["type"] == "paragraph" and not saida[-1].get("content"):
        saida.pop()
    return saida


def main():
    ext, mapas, destino = sys.argv[1:4]
    os.makedirs(destino, exist_ok=True)
    ids = set()
    total = 0
    for nome in sorted(os.listdir(mapas)):
        if not nome.endswith(".json"):
            continue
        m = json.load(open(os.path.join(mapas, nome)))
        e = json.load(open(os.path.join(ext, nome)))
        if m["id"] in ids:
            raise SystemExit(f"id repetido: {m['id']}")
        ids.add(m["id"])
        ordem = []
        doc = {"type": "doc", "content": blocos(e["blocos"], m["mapa"], ordem)}
        campos = {k: m["campos"][k] for k in ordem}
        saida = {
            "id": m["id"],
            "titulo": m["titulo"],
            "tipo": m["tipo"],
            "pilar": m["pilar"],
            "resumo": m.get("resumo", ""),
            "relacionados": m.get("relacionados", []),
            "grupos": [g for g in m["grupos"] if any(c["grupo"] == g for c in campos.values())],
            "campos": campos,
            "duvidas": m.get("duvidas", []),
            "origem": e["arquivo"],
            "doc": doc,
        }
        json.dump(saida, open(os.path.join(destino, m["id"] + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
        total += 1
    print(total, "modelos gerados")


if __name__ == "__main__":
    main()
