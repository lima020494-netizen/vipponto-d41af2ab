# Gestão diária de batidas e ícone PWA seguro

## Objetivo
Unificar ajustes e ocorrências numa visão diária consolidada, mantendo intactos o quiosque, as impressões térmicas, a sincronização e os cálculos atuais; corrigir também a apresentação da logo ao instalar o app no Android.

## Alterações
- Substituir a listagem individual de batidas por uma tela única de Gestão de Batidas.
- Adicionar filtros de colaborador, data inicial e data final, com atualização direta da tabela e dos resumos.
- Exibir cards de Total Trabalhado, Saldo de Horas e Ocorrências calculados pelas regras já existentes.
- Consolidar cada dia em uma linha com data/dia da semana, status, marcações cronológicas, carga prevista, horas trabalhadas, saldo e menu Ações.
- Abrir pelo menu Ações um modal diário com Inserir Batida Manual, Lançar Ocorrência/Abono e Ver Detalhes de NSR/hash.
- Exigir justificativa de auditoria nas inclusões manuais e ocorrências, preservando o limite diário e o registro em histórico.
- Remover dessa tela ações de reimpressão e e-mail, sem alterar a reimpressão centralizada no quiosque.
- Criar manifesto PWA estático e ícones quadrados de 192 px e 512 px com margem de segurança, usando `purpose: "any maskable"` e fundo escuro `#0f172a`.

## Validação
- Conferir filtros, cards e linhas diárias com dias trabalhados, incompletos, abonados e de folga/DSR.
- Testar inclusão manual, lançamento de ocorrência e consulta de NSR/hash pelo menu do dia.
- Confirmar que nenhuma ação de reimpressão aparece na Gestão de Batidas.
- Conferir manifesto, dimensões dos ícones, margem segura e cores da tela de abertura.
- Validar a tela em computador, tablet e celular, além de confirmar ausência de erros.

## Detalhes técnicos
- Reutilizar `previstoDia`, `trabalhadoDia`, `dadosFolha`, banco de horas e persistência já existentes; nenhuma fórmula será substituída.
- Manter Supabase como fonte principal, cache/fila offline e auditoria atuais.
- Implementar apenas manifesto e metadados de instalação; não adicionar service worker nem alterar o comportamento offline existente.