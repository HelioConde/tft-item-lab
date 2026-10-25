<div align="center">
  <h1>🧪 TFT Item Lab</h1>
  <p><strong>Descubra como os itens foram distribuídos entre as unidades nas suas partidas recentes de Teamfight Tactics.</strong></p>
  <p><img alt="Status" src="https://img.shields.io/badge/status-MVP%20em%20valida%C3%A7%C3%A3o-64748b"></p>
</div>

## O que analisar

O **TFT Item Lab** é um laboratório de **histórico pessoal de itemização**. Ao informar um Riot ID e a região, você visualiza quais itens apareceram com mais frequência, em quais unidades foram equipados e que resultados tiveram as partidas consultadas.

| Visão | O que representa |
| --- | --- |
| **Itens** | Frequência e número de partidas com cada item |
| **Unidades** | Campeões que receberam os itens |
| **Resultados** | Colocação média e taxa de Top 4 da amostra |
| **Detalhes** | Última aparição e histórico de uso |
| **Períodos** | 7 dias, 30 dias ou Set conforme disponibilidade |
| **Idiomas** | PT-BR e inglês |

O backend gamer oferece dados por uma função como `riot-legacy-tft-profile`. Alguns payloads podem fornecer **nomes de itens**, enquanto outros permitem apenas IDs numéricos. O frontend deve indicar esse limite em vez de inventar nomes.

## Como interpretar corretamente

**O produto não é um ranking global de itens.** Um item associado a bons resultados em determinada amostra pode refletir a unidade, a composição, o patch, o lobby e decisões da partida. Correlação não prova causalidade.

Filtros por período aplicam-se **às partidas recuperadas**, não a um histórico ilimitado da conta.

## Executar localmente

```bash
git clone https://github.com/HelioConde/tft-item-lab.git
cd tft-item-lab
python -m http.server 8000
```

Abra `http://localhost:8000`. Para QA:

```bash
npm install
npm run check
npm run test:e2e
```

O frontend depende do backend Riot e deve manter **todas as chaves privadas exclusivamente no servidor**.

## Antes de expandir

- Verificar o payload real de itens e unidades com contas diferentes.
- Validar resultados com histórico curto, itens ausentes e rate limit.
- Conferir layouts desktop/mobile, leitura dos indicadores e atualizações de versão.
- Manter demonstrações e dados reais claramente diferenciados.

**Estado:** MVP em validação; a documentação histórica de QA permanece em [README_HISTORY](docs/README_HISTORY_2026-10-25.md).

Projeto independente de Riot Games, desenvolvido por [Hélio Conde](https://github.com/HelioConde).
