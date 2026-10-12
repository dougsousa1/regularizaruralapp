# Regulariza Rural — Plataforma de Consulta

Central de consulta prática em direito agrário e regularização rural para os
alunos da mentoria. O aluno não assiste a aulas aqui. Ele chega com um caso real e
sai com a resposta: guias práticos, checklists, fluxos de decisão, tabelas de
referência e um assistente com IA treinado no conteúdo da mentora.

## Estrutura

- [`conteudo/`](conteudo/README.md): base de conhecimento extraída das aulas
  (fonte única de verdade da plataforma).
- `src/`: site em Next.js que lê `conteudo/` no build e gera páginas estáticas.
  - `src/lib/conteudo.ts`: leitura dos guias, checklists, fluxos e referências.
  - `src/app/`: páginas (início, pilares, guias, checklists, fluxos, busca, revisão).
  - `src/components/`: busca rápida (Ctrl+K), checklist e fluxo interativos.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático (valida todos os conteúdos)
```

Editou um arquivo em `conteudo/`? O site reflete a mudança no próximo build, sem mexer
em código. O painel `/revisao` reúne os pontos que a mentora precisa confirmar.

## Andamento

1. **Base de conhecimento**: primeira versão pronta nos 7 pilares, com 142 itens
   (guias, checklists, fluxos de decisão e referências). Aguarda revisão jurídica da
   mentora. Os pontos a confirmar de cada pilar estão nos arquivos `REVISAO.md`:
   - [Contratos Agrários](conteudo/contratos/REVISAO.md)
   - [Imobiliário](conteudo/imobiliario/REVISAO.md)
   - [Aquisição de Imóveis](conteudo/aquisicao/REVISAO.md)
   - [Cadastros](conteudo/cadastros/REVISAO.md)
   - [Fiscal](conteudo/fiscal/REVISAO.md)
   - [Ambiental](conteudo/ambiental/REVISAO.md)
   - [Temas Especiais](conteudo/temas-especiais/REVISAO.md)
2. **Plataforma web**: pronta, com a identidade visual do Regulariza Rural (tema escuro,
   dourado do monograma RR). Inclui busca instantânea, painel do aluno ("continue de onde
   parou", checklists em andamento, progresso), páginas por pilar, guias com índice,
   checklists interativos, fluxos de decisão, salvos e painel de revisão. Instalável no
   celular como app (PWA).
3. **Login e alunos (Supabase)**: pronto. Só e-mails liberados no painel `/admin` criam
   conta; salvos, concluídos e checklists ficam na conta do aluno. Estrutura do banco em
   `supabase/migrations/`.
4. Assistente com IA
5. Modelos de contrato e calculadoras
