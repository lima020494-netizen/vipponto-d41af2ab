# Central clara do Gestor e quiosque dividido

## Objetivo
Reorganizar apenas a apresentação do Gestor e do Quiosque, preservando regras, dados, permissões, Supabase, modo offline, impressão e fluxos existentes.

## Gestor
- Substituir a navegação principal lateral/superior por uma tela inicial com cards coloridos para Dashboard, Funcionários, Ponto, Folha, Assinatura e Desenvolvedor quando autorizado.
- Manter o Dashboard de Frequência na mesma central, com indicadores e gráficos visíveis sem duplicação de conteúdo.
- Usar fundo azul/verde-piscina claro, superfícies brancas, tipografia Sora/Manrope e cores distintas por módulo.
- Ao abrir um módulo, exibir cabeçalho compacto com botão de retorno à central e manter as sub-abas e ações atuais.
- Preservar tabelas, filtros, impressão, PDF, AFD e permissões existentes.

## Quiosque
- Em PC e tablet, criar três áreas: barra vertical de acessos na extrema esquerda; quadro de empresa, mensagens e histórico no painel esquerdo; relógio, PIN, teclado e Registrar no painel direito.
- Centralizar logo e identificação da empresa no topo do painel esquerdo.
- Manter histórico compacto, ações Imprimir/E-mail e confirmação verde de 2 segundos.
- Em celular e SUNMI, conservar a composição compacta sem rolagem, com todos os controles alcançáveis.

## Validação
- Conferir a central do Gestor e abertura/retorno de módulos.
- Conferir quiosque em desktop, tablet, celular e altura reduzida, sem rolagem nem sobreposição.
- Confirmar foco visível, uso por teclado, gráficos do Dashboard e ausência de erros.

## Detalhes técnicos
- Alterações concentradas no HTML/CSS/JS existente, sem trocar tecnologia nem reescrever o aplicativo.
- A navegação por cards reutilizará as funções atuais de abertura das abas; nenhuma regra comercial ou trabalhista será alterada.
