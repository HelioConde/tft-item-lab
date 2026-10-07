# TFT Item Lab

Análise pessoal de itemização em Teamfight Tactics baseada no histórico recente do próprio jogador.

## Estado atual

> **MVP funcional implementado em 07/10/2026.** O próximo passo é validação publicada/real, não expansão de escopo.

## O que o produto responde

- quais itens aparecem mais no seu histórico recente;
- em quantas partidas cada item apareceu;
- em quais unidades ele foi usado;
- colocação média da amostra;
- taxa de Top 4;
- última aparição;
- quais unidades concentram mais itens;
- recortes de 7 dias, 30 dias e Set atual.

O produto **não é uma tier list global** e não afirma causalidade. Resultado observado depende de unidade, comp, lobby, patch, estágio e decisões da partida.

## Backend

Fonte pública server-side:

`https://bieihhaobdztjyoweewa.supabase.co/functions/v1/riot-legacy-tft-profile`

A chave Riot permanece no backend gamer. Nenhuma chave Riot fica no navegador.

O frontend aceita itens por nome quando o backend fornece `itemNames`/`item_names` e mantém fallback explícito para IDs numéricos quando o nome não estiver presente.

## UX

- PT-BR padrão + EN;
- busca Riot ID + servidor;
- buscas recentes locais;
- deep link com Riot ID, servidor, período e idioma;
- loading, erro, 404/rate limit;
- biblioteca ordenável por frequência, média e Top 4;
- detalhe por item;
- visão por unidade;
- mobile;
- slot de publicidade reservado sem bloquear a análise;
- Sobre, Privacidade e Termos;
- SEO básico, robots e sitemap;
- atualização automática após novo deploy.

## QA

Automação criada:

- Static QA;
- Browser E2E em desktop Chromium;
- Browser E2E em viewport mobile;
- payload TFT controlado com itens/unidades;
- Riot ID inválido;
- rate limit;
- PT-BR/EN;
- troca de período e ordenação;
- `Live Riot Smoke` separado para a versão publicada com `AlchemyFlames#BR1`.

Execute localmente:

```bash
npm install
npm run check
npm run test:e2e
```

## Gate antes de V2

- [x] fluxo principal implementado;
- [x] backend gamer configurado;
- [x] agregação de itens/unidades;
- [x] 7D / 30D / Set;
- [x] PT-BR/EN;
- [x] mobile;
- [x] páginas institucionais;
- [x] Browser E2E;
- [x] GitHub Pages preparado;
- [x] live-update;
- [ ] confirmar Actions/Pages verdes;
- [ ] confirmar que o payload real expõe nomes/IDs de itens como esperado;
- [ ] validar com 3+ Riot IDs/regiões;
- [ ] testar conta com pouco histórico e histórico sem detalhes de item;
- [ ] revisar desktop/mobile publicado;
- [ ] corrigir apenas P0/P1 encontrados.

## V2 — somente depois da validação

- evolução por patch;
- comparação entre dois itens no histórico pessoal;
- filtros por unidade/trait/comp;
- correlação por estágio;
- favoritos/notas pessoais;
- card compartilhável;
- catálogo visual enriquecido de itens.

Não abrir essas features antes do gate do MVP.

## Compliance

Produto independente e não endossado pela Riot Games. Teamfight Tactics e Riot Games são marcas de seus respectivos titulares.
