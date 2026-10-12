---
id: dcr-passo-a-passo
titulo: DCR Passo a Passo — Como Preencher o Cadastro no INCRA
pilar: cadastros
tipo: guia
resumo: Roteiro prático do sistema DCR do INCRA — acesso, consulta de imóveis do cliente, inclusão, aquisição de área total, as cinco etapas da declaração (estrutura, uso do solo, pessoas, dados gráficos e envio), produtividade e como evitar pendências.
tags: [DCR, SNCR, CCIR, INCRA, gov.br, inclusão de imóvel, aquisição de área total, transferência de titularidade, situação jurídica, área registrada, posse a justo título, simples ocupação, área medida, uso do solo, mapa de uso do solo, grau de utilização, improdutivo, não classificada, módulo fiscal, arrendatário, parceiro, comodatário, SIGEF, atendimento prioritário, matrícula atualizada, minhas solicitações]
base_legal:
  - "Lei 5.868/72"
  - "Lei 8.629/93 (produtividade: GUT e GEE)"
  - "Manual de Cadastro Rural do INCRA"
relacionados: [ccir-cadastro-incra, checklist-documentos-ccir, cnir-cib-cafir, fluxo-situacao-juridica-dcr]
fonte: Aula 02 — Pilar Cadastros (aula prática com professor convidado, profissional de cadastro no oeste da Bahia)
revisao: pendente
---

# DCR Passo a Passo

## Acesso

- Busque "**DCR eletrônica**" (Declaração para Cadastro de Imóveis Rurais). Não confunda
  com o SNCR, que é o ambiente dos analistas.
- Entre com o **gov.br do proprietário** (bronze basta para a DCR) ou certificado digital.

## Tela inicial: o diagnóstico do cliente

Aparece a **lista de todos os imóveis** do CPF: código, denominação, área, município e
data da última declaração. Ali você:

- **baixa o CCIR** (se pago) ou o boleto;
- vê o **histórico** (desmembramentos, atualizações);
- baixa os **documentos já anexados** (cadastros feitos a partir de ~2020).

> **Caso:** o cliente entregou só um CCIR. A consulta revelou imóveis já vendidos ainda
> no nome dele, um CCIR e um CIB **duplicados** e dois CARs por fazer. Um pedido de ITR
> virou quatro serviços.

## Antes de incluir um imóvel "novo"

**Esgote as buscas:** nome do proprietário anterior, matrícula, sistema. Se já existe
código, não crie outro (duplicidade gera pendência na Receita).

| Situação | Opção no sistema |
|---|---|
| Imóvel nunca cadastrado | **Incluir imóvel não cadastrado** |
| Cliente comprou o imóvel inteiro | **Aquisição de área total** (informe o código existente e refaça o cadastro) |
| Cliente comprou parte | Inclusão com **dados de desmembramento** (código da área-mãe, CPF do vendedor, área) |
| Acompanhar pedido | **Minhas solicitações** (encaminhado, recebido, em análise, processado, pendência) |

## As cinco etapas da declaração

São dados **declaratórios** — o que não autoriza omitir nada: tudo conforme a realidade
do campo e os documentos. **Salve a cada etapa** (o sistema às vezes perde os dados).

### 1. Estrutura do imóvel

- **Denominação:** a que está **na matrícula** (o banco confere). Mudou o nome? Retifique
  na matrícula primeiro.
- **Localização:** indicações de acesso; UF e município **do imóvel**.
- **"Área localizada em zona urbana":** marque **só** se o objetivo for descaracterizar
  para urbano. Imóvel em perímetro urbano com finalidade rural → não marque.
- **Mais de um município:** informe a área em cada um, com mapa de profissional. Mesmo
  com matrículas em comarcas diferentes, se contíguo, é **um único CCIR**.
- **Situação jurídica** (veja o [fluxo](../fluxos/situacao-juridica-dcr.yaml)):

| Situação | Documento | O que informar |
|---|---|---|
| **Área registrada** | Matrícula atualizada | Forma de obtenção; **data do registro do ato de aquisição** (o R.x, não a abertura — salvo se não houver); área **da matrícula**; UF, cartório e **ofício** corretos; matrícula (livro 2) ou transcrição (livro 3); número do registro. Matrículas contíguas: adicione todas. |
| **Posse a justo título** | Escritura não registrada, sentença (ex.: usucapião) | Forma, data da escritura, área |
| **Posse por simples ocupação** | Declaração de posse (sindicato/prefeitura, confrontantes) | Forma, data de início da posse, área |

  A situação pode "subir": posse → justo título (sentença) → registrada (matrícula aberta).
  Atualize o CCIR a cada passo.

- **Área medida:** GEO feito mas ainda não averbado (ex.: matrícula 1.000 ha, medição
  1.010 ha). Exige **planta, memorial e ART**. Em retificação: declare primeiro a área da
  matrícula; depois de averbar, atualize.
- **Residentes e mão de obra:** famílias, pessoas, assalariados com e sem carteira, mão
  de obra familiar — conforme a realidade.
- **Destinação** (agricultura, pecuária, mineração, serviços ambientais...), **litígio**
  (é só informação estatística) e **zonas especiais** (Amazônia Legal, terra indígena,
  litoral, polígono das secas).

### 2. Uso do solo — onde mora a produtividade

Recomendação do professor: contrate um **mapa de uso e ocupação do solo** (imagem de
satélite com os hectares de cada uso). Ele serve ao CCIR, ao CAR e ao ITR e evita
pagar imposto a mais ou a menos.

| Tipo de área | Exemplos |
|---|---|
| Produtos vegetais isolados | Soja, milho, feijão, algodão, café |
| Produtos vegetais consorciados | Várias culturas juntas |
| Exploração granjeira ou aquícola | Suínos, aves, peixes, rã, jacaré, camarão |
| Pastagem | Plantada ou nativa |
| Outros usos | Benfeitorias |
| **Com restrição** | Reserva legal, APP, APA, RPPN |
| Sem restrição e sem uso | Área aberta sem produção (pesa contra a produtividade) |

- A soma deve dar **100%** da área declarada.
- Os dados são dos **últimos 12 meses** (o que foi produzido, não o que será).
- **Pastagem precisa de animais.** Sem rebanho, a área sai improdutiva. Pergunte: "você
  arrenda para alguém?".
- Área toda nativa, sem uso → informe RL, APP e o restante como **remanescente de
  vegetação nativa**: o imóvel fica **"não classificado"** (não improdutivo).

> **Produtividade:** o imóvel precisa atingir índices mínimos de utilização e
> eficiência. A aula cita 75% de utilização e unidades animais por hectare como
> referência. **Conferir:** pela Lei 8.629/93, o grau de utilização da terra (GUT) deve
> ser de pelo menos **80%** e o grau de eficiência na exploração (GEE), de pelo menos
> **100%**.

> **Risco:** imóvel improdutivo acima do limite constitucional (a aula fala em
> **4 módulos fiscais**) pode ser desapropriado para reforma agrária. **Conferir:** a
> CF (art. 185) protege a pequena e a média propriedade (até 15 módulos fiscais) — a
> faixa de risco deve ser confirmada antes de exibir. O módulo fiscal varia por
> município (ex.: 65 ha em São Desidério/BA).

### 3. Pessoas

- **Titulares:** estado civil; relação com o imóvel (individual, comum/condomínio,
  nu-proprietário e usufrutuário, concessionário...); reside no imóvel; dados pessoais;
  **cônjuge**.
- **Pessoas temporárias — não pule:** **arrendatário, parceiro, comodatário.** Se o dono
  não produz, mas arrenda, cadastrar o arrendatário demonstra que o imóvel **é produtivo**.
- O CCIR segue o título: matrícula em nome de X → CCIR, CIB e CAR em nome de X.

### 4. Dados gráficos

Imóvel **certificado no SIGEF**: consulte a parcela pelo código do imóvel e **vincule o
código da parcela**. Comum em atualização e transferência (para certificar no SIGEF é
preciso ter o CCIR, então cadastros novos raramente têm certificação).

### 5. Envio

- **Atendimento prioritário** (justifique e comprove): idoso, deficiência, doença grave,
  **financiamento bancário** (anexe a cédula), **alienação** do imóvel.
- O sistema lista os documentos conforme o que você preencheu: RG/CPF, certidão de
  casamento, documentos do cônjuge, **certidão de matrícula atualizada**, planta e
  memorial com ART etc.

## Depois do envio

- Pedidos de dados simples (nome da fazenda, endereço, nome do proprietário) podem ser
  **deferidos automaticamente**. Inclusões e posses vão para análise (posse costuma
  levar mais).
- **Pendência nº 1: certidão de matrícula desatualizada** (a aula fala em até 30 dias).
  "Não cola" — não tente.
- Facilite a vida do analista: documentos corretos e completos. Pode ajudar **ligar** para
  a superintendência e falar com um analista.
- Deferido → emita o CCIR → no **dia seguinte** o imóvel aparece no CNIR para vincular o
  CIB. Veja [CNIR, CAFIR e CIB](cnir-cib-cafir.md).
