# Planejamento de marketing B2B — Fora da Terra

Landing page estática com questionário de cinco etapas, reproduzindo as perguntas, opções e tipos de input do planejador da Tsuru. A identidade combina azul profundo com destaques em rosa e violeta, inspirados nas referências da Fora da Terra.

## Executar localmente

Este projeto deve permanecer apenas localmente. Não publicar, fazer deploy nem sincronizar com hospedagem externa sem uma nova solicitação explícita do usuário.

Abra `docs/planejamento/index.html` diretamente no navegador. Não é necessário iniciar servidor nem instalar dependências de build.

A home `docs/index.html` fica em branco. A landing page e seus arquivos ficam em `docs/planejamento/`, correspondendo ao caminho `/planejamento/` quando `docs/` for servido como raiz.

`docs/planejamento/` é a versão local atual. `planejamento-b2b/` é um checkout anterior de hospedagem; não sincronizar nem publicar sem solicitação explícita.

## Respostas

As respostas são salvas automaticamente no `localStorage`, com a chave `fdt:planejamento-b2b:2027:v1`. O JSON inclui `version`, `year`, `step`, `answers`, `completed` e `updatedAt`. As chaves de respostas são `segment`, `size`, `currentBudget`, `currentBudgetExact`, `challenge`, `tracking`, `clients`, `value`, `valueType`, `nextBudget`, `nextBudgetExact`, `priority`, `execution`, `when`, `leadName`, `leadCompany`, `leadRole`, `leadEmail`, `leadPhone` e `leadBusinessModel`.

As quatro primeiras etapas usam seleções de uma opção, com quatro campos numéricos opcionais. O tipo de valor é obrigatório somente quando o valor médio é preenchido; o prazo aparece somente para contratação, troca de agência ou ampliação de parceiro atual. A quinta etapa usa quatro campos digitáveis de identificação e dois selects, como na referência. Todos os dados continuam apenas no navegador.

Ao recarregar a página, as respostas e a etapa são recuperadas. A conclusão confirma o salvamento e permite revisar as respostas. Não há geração de resultado, integração de CRM nem envio de respostas para servidor nesta versão. O armazenamento pertence ao navegador e à origem do site; limpar os dados do site remove o progresso.

As fontes são carregadas pelo Google Fonts, com fontes locais de fallback. A ilustração é feita em CSS.
