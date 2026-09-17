# Energia Conectada

Vou te enviar 2 arquivos de referência. Siga as instruções à risca, sem improvisar, sem trocar por padrões genéricos do Lovable e sem pular nenhuma seção descrita.

layout_eletrogestor.md → é a especificação visual completa e obrigatória da tela. Use exatamente as cores, textos, estrutura, abas flutuantes e comportamento descritos nele. Não use o tema padrão do Lovable, não troque a paleta laranja por outra, não simplifique a estrutura de duas colunas nem remova nenhum bloco (badge, estatísticas, tags, busca, abas, cards).

main.py → é o backend real do sistema (FastAPI + SQLAlchemy), com todos os modelos, regras de negócio e endpoints, incluindo o bloco de automações no final do arquivo (self-healing/FLISR, subestações digitais, manutenção preditiva, gestão de vegetação, religamento remoto). Use-o como fonte da verdade para nomes de campos, rotas e regras — não invente nomes de campos ou endpoints diferentes dos que estão no arquivo.

O que fazer, nesta ordem:

Construa primeiro o front-end exatamente como descrito em layout_eletrogestor.md (tela "Passo 1 de 2" — seleção de perfil, com abas flutuantes GESTÃO/OPERAÇÃO/SUPORTE/TÉCNICO, busca, cards, painel institucional à esquerda).

Depois, crie a tela "Passo 2 de 2" (login: usuário e senha, mesma paleta), sem inventar campos extras.

Estruture o projeto para consumir os endpoints do main.py (ex.: /obras, /automacao/painel, /automacao/self-healing/indicadores, /subestacoes, /vegetacao/pontos-criticos, /dashboard, /relatorios/resumo-diario) via fetch/axios, preparando os componentes já com os nomes de campos retornados por esses endpoints, mesmo que a integração real (URL do backend) fique como variável de ambiente a configurar depois.

Use o indicador "% restabelecimento automático" vindo do endpoint /automacao/painel no card de estatísticas do painel esquerdo (no lugar do valor fixo do mockup).

Não crie nenhuma tela, campo ou fluxo que não esteja descrito em layout_eletrogestor.md ou que não tenha correspondência em main.py. Se algo não estiver claro, prefira seguir literalmente o que está escrito no arquivo de layout em vez de assumir uma solução "mais bonita" por conta própria.

Ao final, me devolva um resumo curto do que foi implementado e o que ficou pendente de integração com o backend.

Restrições obrigatórias

Não trocar a paleta laranja/branco por outra combinação de cores.

Não substituir as abas flutuantes por menu lateral, dropdown ou tabs comuns.

Não remover ou resumir a lista de 21 perfis nem as descrições de cada um.

Não usar dados/endpoints fictícios quando o main.py já define o nome real do campo ou da rota.

Não adicionar bibliotecas de UI além de lucide-react para ícones, salvo necessidade técnica explícita.

Confirme que leu os dois arquivos antes de começar a gerar código.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/59e4780c-8e0f-4629-89a8-05e8c6e43f10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
