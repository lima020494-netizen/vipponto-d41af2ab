# Proteção contra duplicidade e comprovante térmico compacto

## Objetivo
Evitar marcações repetidas por engano e tornar o comprovante de 58 mm mais econômico, sem bloquear registros confirmados e sem alterar o seletor Navegador/RawBT nem o módulo Batidas.

## Alterações
- Antes de gravar, comparar a última marcação do mesmo PIN e dia; se tiver menos de 2 minutos, abrir confirmação com horário, Cancelar e Confirmar.
- Manter o limite atual de quatro marcações e permitir a nova marcação quando confirmada.
- No histórico do quiosque, exibir apenas nome, data e horários cronológicos em uma linha, sem categorias.
- Reorganizar o comprovante com empresa, documento, endereço, identificação REP-P, NSR, colaborador, CPF mascarado, data/hora destacadas e SHA-256 curto em duas linhas.
- Remover tipo da batida e QR Code do comprovante impresso, PDF térmico, SUNMI e RawBT.
- Reduzir espaços, zerar margens térmicas, usar fonte condensada no ESC/POS e avançar somente três linhas na SUNMI.

## Validação
- Simular duas marcações dentro de 2 minutos e conferir Cancelar e Confirmar.
- Confirmar que uma marcação fora da janela segue normalmente.
- Conferir histórico sem rótulos e em ordem cronológica.
- Conferir comprovante web e buffer RawBT sem QR/tipo, com CPF mascarado, hash em duas linhas e corte compacto.
- Validar quiosque em celular, tablet e desktop, sem rolagem ou sobreposição.

## Detalhes técnicos
- Alterações limitadas ao HTML/CSS/JS existente.
- A confirmação será assíncrona e acessível por teclado/leitor de tela.
- Supabase, fila offline, regras MTE, impressão automática e alternância Navegador/RawBT permanecem intactos.
