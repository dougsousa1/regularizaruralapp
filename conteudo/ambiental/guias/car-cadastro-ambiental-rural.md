---
id: car-cadastro-ambiental-rural
titulo: CAR — Cadastro Ambiental Rural na Prática
pilar: ambiental
tipo: guia
resumo: O que é o CAR, para que serve e o que não é, problemas do sistema e efeito no crédito (Plano Safra, MapBiomas), passo a passo no módulo do SICAR (abas, Geo, QGIS, Google Earth, perguntas do PRA), Central do Proprietário, retificação, sobreposição, condomínio, servidão administrativa e preços.
tags: [CAR, Cadastro Ambiental Rural, SICAR, módulo offline, Central do Proprietário, recibo, retificação, sobreposição, MapBiomas, Plano Safra, crédito rural, QGIS, Google Earth, shapefile, quadro de áreas, área líquida, servidão administrativa, PRA, desmembramento, condomínio, LGPD, declaração de sobreposição, autodeclaração, status do CAR, Decreto 7.830/2012]
base_legal:
  - "Lei 12.651/2012, art. 29"
  - "Decreto 7.830/2012"
  - "IN MMA 2/2014 (regras do CAR)"
  - "Decreto 8.235/2014 (PRA)"
relacionados: [regularizacao-ambiental-visao-geral, app-e-reserva-legal, uso-consolidado-marco-2008, checklist-car, ada-e-car-nos-cadastros]
fonte: Aula 02 — Pilar Ambiental (professor convidado, engenheiro ambiental com mais de 500 CARs) e Aula 01
revisao: pendente
---

# CAR na Prática

## O que é — e o que não é

- Registro público eletrônico **obrigatório para todo imóvel rural** (até uma chácara de
  0,8 ha), de **proprietário ou possuidor** (Lei 12.651, art. 29). Lote urbano não tem CAR.
- **Declaratório**: o declarante assume a responsabilidade ambiental pelo imóvel (item do
  recibo).
- Finalidade **exclusivamente ambiental**: APP, reserva legal, vegetação, uso restrito, áreas
  consolidadas.
- **Não é** título de propriedade, **não é** georreferenciamento e **não é** licença — não
  autoriza atividade nem supressão.
- **Recibo ≠ protocolo**: saiba reconhecer o recibo original.

### Para que é usado hoje

- **ITR** (deduzir áreas ambientais) · **crédito rural** (Plano Safra exige CAR analisado de
  médios e grandes) · frigoríficos e tradings checam antes de comprar · due diligence de
  compra · seguro agrícola · dispensa de averbar a RL na matrícula.

## Os problemas do sistema

1. CARs feitos "no olhômetro" desde 2012/2014, sem visita → sobreposições e erros.
2. Diferença entre o declarado e o campo.
3. Órgãos sem equipe (ex.: Maranhão: 311 mil cadastros, só 6 mil aprovados).
4. Troca constante de gestor federal.

### MapBiomas — "o terror do proprietário"

Detecta desmatamento por satélite, mas **não diz se foi legal**. Bancos consultam pelo número
do CAR e negam crédito diante de um alerta. **Saída:** declaração ou laudo do órgão ambiental
atestando que a supressão foi autorizada (licença/ASV).

## Antes de desenhar: diagnóstico

- **Google Earth** com histórico de imagens (ícone do relógio): o que havia em 2008? Quando
  abriu? Está regenerando? "Não tem como esconder informação."
- Meça a **largura do rio** (define a APP), localize nascentes e a vegetação mais densa.
- Bases públicas: ANA (hidrografia), MMA (vegetação), IBGE (biomas), Embrapa.
- Saiba o **bioma e o zoneamento** antes de propor a RL (o Maranhão tem áreas de 80%, 35% e
  20%).

## Passo a passo no SICAR (módulo offline)

1. Baixe o **módulo do estado** no site do SICAR (estados com sistema próprio — ex.: MT, PA,
   BA — usam o deles; quem domina o federal faz em qualquer um).
2. **Baixe as imagens** do município.
3. **Cadastrar imóvel** (rural, povos tradicionais ou assentamento); se veio de
   **desmembramento**, informe o CAR de origem.
4. **Abas:**
   - *Cadastrante* e *Imóvel* — nome, acesso, município. **Dica:** coloque **seu** e-mail e
     telefone (o produtor não acompanha).
   - *Domínio* — todos os titulares (PJ: CNPJ e representante).
   - *Documentos* — **posse** (o mais comum: termo de autodeclaração) ou **propriedade**
     (certidão de registro: matrícula, livro, cartório, data; recomendável: parcela SIGEF,
     CCIR, NIRF, reserva averbada). **Quanto mais dado fundiário, mais rápida a análise** —
     em sobreposição, o analista considera quem comprova.
   - *Geo* — **a única etapa técnica**: importe o perímetro e as camadas (remanescente de
     vegetação, área consolidada, rios, APPs, RL proposta).
5. Desenhe no **QGIS** (gratuito; camada Google Satélite), exporte **shapefile zipado** e
   importe. O SICAR gera a faixa de APP pela largura informada — **errar a largura do rio é o
   erro clássico**.
6. Confira o **Quadro de Áreas** (a RL calculada sobre a área líquida).
7. **Perguntas do PRA:** adesão ao PRA, déficit de RL e como será sanado (compensação,
   regeneração, cota, servidão, doação), TAC, PRAD, infrações antes de 2008, excedente de
   vegetação. **Regra: cadastre a realidade e proponha o que falta.**
8. **Gravar para envio** → enviar no site → **recibo**.

> Advogados e corretores fazem tudo, menos a etapa Geo — **parceria** com o técnico.

## Depois do recibo: Central do Proprietário

Crie com o número do recibo e o CPF do titular. Nela você:

- acompanha o **status** (aguardando análise, pendência, aguardando retificação...);
- recebe **notificações** do órgão;
- baixa o recibo e a ficha do imóvel;
- **retifica** (arquivo de retificação no módulo) ou pede cancelamento.

**Não basta entregar o recibo.** Exigência não cumprida → **cancelamento** → sem CAR ativo
(e o ADA volta a ser exigido no ITR).

## Situações frequentes

| Situação | Orientação |
|---|---|
| Área a declarar | A da matrícula ou do GEO certificado (não a do polígono) |
| Várias matrículas do mesmo dono, contíguas | **Um CAR**, cada matrícula informada |
| **Condomínio** em matrícula única | **Um CAR** com vários domínios (não um por parcela) |
| Desmembramento | Retificar o CAR de origem e cadastrar o novo |
| Fora de desmembramento/remembramento | Não se faz CAR novo: **retifica-se** |
| **CARs de terceiros sobrepostos** | Pela LGPD, só o titular cancela. O órgão desconsidera os sobrepostos diante do GEO. Para banco/frigorífico: **declaração de sobreposição** do órgão estadual + laudo explicando |
| CAR antigo desatualizado | Retificar — bancos calculam passivo pelo demonstrativo público e pedem PRAD |
| **Servidão administrativa** (estrada, linhão) | Reduz a área líquida; critérios variam por estado (alguns exigem averbação) |
| Compensação de RL entre imóveis | No CAR cedente, marcar RL destinada a compensar outro imóvel (informar CAR beneficiado) |
| Banco pede "área consolidada" para tudo | Banco confunde consolidado com produtivo; se o CAR for analisado, retifique para a realidade |

## Preços citados

- Retificação com inserção/retirada de RL e averbação: **R$ 1.500 a 3.000**; imóvel pequeno:
  R$ 1.000 a 1.500.
- "O CAR é barato" só para quem fez errado — arrumar CAR notificado é serviço caro e
  **recorrente** (toda mudança no imóvel exige atualização).

> **Conferir:** vinculação atual do SICAR (MGI/Serviço Florestal) e o alcance exato da
> exigência de CAR analisado no Plano Safra.
