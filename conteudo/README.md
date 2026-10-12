# Base de Conhecimento — Regulariza Rural

Esta pasta é o **coração da plataforma**. Todo o conhecimento do curso foi extraído
das transcrições das aulas e reescrito em formato de consulta prática: o aluno não
assiste aula aqui, ele **resolve um caso**.

A plataforma (site + assistente de IA) lê estes arquivos. Por isso eles seguem um
formato fixo, mas continuam legíveis para quem revisa o conteúdo.

## Organização

```
conteudo/
  <pilar>/
    guias/         → artigos de consulta (o que é, como fazer, erros, base legal)
    checklists/    → listas de verificação para usar no caso concreto
    fluxos/        → árvores de decisão ("qual contrato usar?")
    referencias/   → tabelas rápidas (prazos, percentuais) e glossário
```

| Pilar | Status |
|---|---|
| Contratos Agrários | ✅ Primeira versão — aguardando revisão jurídica |
| Imobiliário | ✅ Primeira versão — aguardando revisão jurídica |
| Aquisição de Imóveis | ✅ Primeira versão — aguardando revisão jurídica |
| Fiscal | ✅ Primeira versão — aguardando revisão jurídica |
| Ambiental | ⏳ A fazer |
| Cadastros | ✅ Primeira versão — aguardando revisão jurídica |
| Temas Especiais (holding, crédito rural, carbono…) | ⏳ A fazer |

## Formato dos arquivos

### Guias, checklists e referências (`.md`)

Todo arquivo começa com um cabeçalho (frontmatter) que a plataforma usa para
busca, filtros e links entre conteúdos:

```yaml
---
id: arrendamento-rural          # identificador único (usado nos links)
titulo: Arrendamento Rural
pilar: contratos
tipo: guia                      # guia | checklist | referencia
resumo: Uma frase que aparece nos resultados de busca.
tags: [arrendamento, prazo, preço]
base_legal: ["Lei 4.504/64 (Estatuto da Terra)", "Decreto 59.566/66"]
relacionados: [parceria-rural, arrendamento-x-parceria]
fonte: Aula 01 — Pilar Contratos Agrários
revisao: pendente               # pendente | revisado
---
```

### Fluxos de decisão (`.yaml`)

Cada fluxo é uma sequência de perguntas. Cada resposta leva a outra pergunta
(`proximo`) ou a um resultado (`resultado`), que aponta para os guias relacionados.

## Regras editoriais

1. **Fidelidade ao método da mentora.** O conteúdo reflete o que é ensinado nas
   aulas, incluindo as recomendações práticas e a forma de orientar o cliente.
2. **Nada inventado.** Quando um tema é apenas mencionado na aula mas não
   explicado (ex.: comodato, permuta), o arquivo indica isso claramente em vez de
   preencher com conteúdo de terceiros.
3. **Pontos a conferir.** Trechos marcados com `> **Conferir:**` são complementos
   ou referências legais que precisam da validação da mentora antes de publicar.
4. **Linguagem de consulta.** Frases curtas, passo a passo, exemplos concretos.
