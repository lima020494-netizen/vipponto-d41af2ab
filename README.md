# VIP Ponto 

Crie o APP COMPLETO VIP PONTO em um único arquivo HTML + CSS + JS puro, sem React, sem Vite, sem backend, tudo em localStorage, responsivo para PC, tablet, celular e SUNMI D2 MINI 58mm. PADRÃO MTE PORTARIA 671/2021. NENHUM DETALHE PODE FALTAR.



MÓDULO 0 - LOGIN MULTI-EMPRESA:

Logo VIP PONTO centralizada alta resolução. Campos E-MAIL, SENHA, botão ACESSAR grande. Ao digitar e-mail existente exibir "Olá, ". Links Criar conta e Esqueci senha expiração 1h. Cadastro conta: Nome Completo, E-mail, Senha validação 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial (!@#$%&_). Limite 3 contas por aparelho isoladas via localStorage prefixado por e-mail. Mensagem "Limite de 3 usuários por aparelho atingido". Botão logoff ícone standby ⏻ na tela inicial.[Nome]



MÓDULO 1 - EMPREGADOR OBRIGATÓRIO APÓS 1º LOGIN:

Salvar em localStorage 'empregador' e 'gerenciadores'. Campos: Tipo Inscrição [CNPJ][CPF] validação OBRIGATÓRIO, CNPJ/CPF OBRIGATÓRIO, Razão Social OBRIGATÓRIO, Nome Fantasia_ NOVO OBRIGATÓRIO, CEI/CAEPF/CNO campo "caso exista - exigido MTE", E-mail empregador OBRIGATÓRIO, Endereço Completo OBRIGATÓRIO: Logradouro, Número, Bairro, Cidade, UF, CEP, Complemento, Atividade Empresa, Horário Padrão Seg-Sab entrada/saída intervalo, DSR Domingo, Upload Logo converter base64 salvar em http://empregador.logo exibir em id="logo-empresa" na tela inicial e login. Cadastro Gerenciador REGRA DOS 4: Mínimo 1 máximo 4 por empresa. Campos Nome OBRIGATÓRIO, Função OBRIGATÓRIO, PIN 4 dígitos único. Botões [+Adicionar Novo Gerenciador] desabilitar ao atingir 4 "Limite de 4 gerenciadores atingido" Lista não excluir se só 1. Gravar logs "Ação por Carlos - Função Gerente RH" Rodapé PDF "Gerado por Gerenciador: Nome - Função".[Editar][Excluir]



TELA INICIAL - REGRAS OURO PIN:

Topo logo id="logo-empresa" vindo de localStorage. Centro input PIN 4 dígitos comportamento: digita número aparece 1 SEGUNDO depois vira bolinha • efeito •••• Max 4. Teclado numérico grande touch 1-9, LIMPAR, 0, ⌫ fontes h-14 sm:h-16 md:h-20. Ao completar 4: buscar em 'funcionarios' por PIN, mostrar nome grande abaixo. Mostrar histórico batidas DO DIA filtrado data hoje. Nome+histórico visível 5 SEGUNDOS depois LIMPA AUTO tudo PIN+nome+histórico volta inicial. Botão verde grande "✓ REGISTRAR". Ao clicar: pega hora oficial SERVIDOR NTP não manipulável fetch http://worldtimeapi.org/api/timezone/America/Belem calcula serverOffsetMs = serverTime - localTime fallback http://timeapi.io salva offset localStorage função getHoraOficial() = new Date(Date.now()+offset) mostra 🟢 SERVIDOR NTP OK ou 🟡 LOCAL SEM NTP. Se LOCAL pedir confirmação "Sem servidor Art82 risco". Gera NSR sequencial único 9 dígitos salva contador. Classifica auto: 1ª Entrada, 2ª Saída Intervalo, 3ª Entrada Intervalo, 4ª Saída, 5ª Entrada Extra, 6ª Saída Extra limite 6 bloqueia 7ª "Limite 6 batidas". Salva em 'batidas' {pin, nome, cpf, data, hora, tipo, nsr, fonte, sync, offset, gerenciador}. Mostra toast "Ponto registrado 08:00 - Fonte SERVIDOR NSR..." 5s depois LIMPA AUTO. Chama imprimirComprovante(batida) automático. Cada batida histórico clicável pra Reimprimir e Enviar por E-mail a qualquer momento. Canto sup esquerdo ⚙️ Gestor de ponto abre modal PIN checa 'gerenciadores' inicial Carlos Lima PIN 1000 abre 4 módulos. Canto botão folha Portal Empregado ícone 👤 na tela inicial: modal PIN abre só folha daquele funcionário botão Enviar folha para meu e-mail.



MÓDULO 2 - EMPREGADO 12 VAGAS ATIVAS:

Array 'funcionarios' 12 posições. Campos: Nome, CPF, Cargo dropdown com cadastro, Departamento dropdown com cadastro + botão Departamentos e Funções gerenciador, Endereço Rua, Nº, Bairro, Cidade, UF, PIN auto único nunca repete visível só gestor, E-mail, Função, Departamento, Data Admissão, Escala MTE select: 5x2 44h/8h, 6x1 44h/7h20m, 4x3 36h/9h, 12x36 12h, 22x10 plantão. Status obrigatório condicional: ativo = ativo / Desligado = Data Desligamento obrigatória / Afastamento = Período De/Até obrigatório + Motivo obrigatório select: Atestado médico, Licença maternidade, Licença paternidade, Suspensão ESSE MOTIVO TEM QUE APARECER NA FOLHA COMO "AFASTAMENTO (Atestado médico)" / Férias = Início e Término obrigatórios.



MÓDULO 3 - GERENCIAMENTO DE PONTO + ESCALA + DASHBOARD:

Dashboard Frequência PRIMEIRA ABA ao abrir gerenciador. 5 Indicadores: Mais Presentes % Trabalhados/Previstos, Falta por Funcionário Qtd+%, Absenteísmo Geral total+%, Atrasos Nome+Qtd+Tempo médio considera atraso > previsto +10min tolerância, Carga Incompleta Nome+Qtd dias+Total horas faltantes. Filtros [Esta Semana][Este Mês][Este Ano] + Intervalo Datas Personalizado + Todos Funcionários ou individual recalcula instantâneo. Gráfico Ranking Índice Presença canvas. Botões topo direito e [Exportar PDF] cabeçalho Logo+Razão+CNPJ+CEI+Período+Filtro + Rodapé "Relatório gerado em 22/09/2026 21:27 por Gerenciador: Carlos - Função: Gerente RH" + paginação.[Imprimir]



A) Feriados: Lista feriados nacionais MTE fixos já carregados + input cadastrar feriado extra municipal/estadual data+nome em localStorage 'feriados'.

B) Batidas: Tabela todas batidas de 'batidas'. REGRA MTE: hora/data/nsr ORIGINAL nunca pode ser editada intocável. Pode apenas alterar TIPO via select e lançar ocorrência: Falta Justificada, Férias, Folga, Compensada, Falta. Ao MOVER ou INSERIR batida manual OBRIGAR campo MOTIVO texto livre min 5 chars sem motivo não salva. Motivo aparece na Folha MTE "_12:00 Movido de Entrada p/ Saída Almoço - Motivo: Coluna indevida - Por: Carlos" Log quem alterou.

C) ESCALA SEMANAL: Visual Tabela com funcionários ativos na vertical organizados por departamento com cabeçalho azul "Bar · 2 funcionário(s)" "Cozinha · 2 funcionário(s)" e 7 dias na horizontal. Busca apenas por período semanal. Semana mesclada: se dia 30 setembro segunda vai até 6 outubro domingo mesma tela. Opção escolher se semana começa Domingo ou Segunda. Cada célula UNIFICADA select: Trabalhado (abre input hora entrada daquele dia ex 8:30) OU DSR / Folga Domingo / Folga Compensada. Se escolhe folga remove horário. Ex: Seg Ter Qua Qui Func01 8:30 DSR 9:30 8:30. Por funcionário até 3 folgas mesma semana. Salva em localStorage 'escala' {semanaInicio, semanaFim, criacaoData, folgas:[{pin,dia,tipo,horarioEntrada}]}. TRAVAMENTO: pode alterar livre 7 dias após criacaoData, depois trava cadeado 🔒 só visualização. HISTÓRICO: Todo salvamento e alteração grava log "Escala alterada em 22/09/2026 10:30 por Gerenciador: Carlos Lima - De: DSR para: Trabalhado no dia 15/09 funcionário João Silva" não apaga anterior. Histórico consultado na tela escala e aparece rodapé folha se houver alteração. ESCALA INFLUENCIA FOLHA: Se lançar DSR na escala salvar, na Folha MTE coluna Ocorrência deve aparecer "DSR - Folga prevista em escala" e NÃO contar como FALTA contar como FOLGA no rodapé totais. Mesmo para Folga Domingo e Compensada.

D) Banco de Horas automático: seletor Funcionário + Período Inicial/Final Cards: Saldo Anterior, Créditos, Débitos, Saldo Atual Saldo Anterior+Créditos-Débitos = Saldo Atual. Regras: Crédito Auto Hora Extra Previsto 08:00 Realizado 08:30 = +00:30 "Crédito - Hora Extra dia 15/09 - Previsto 08:00 / Realizado 08:30" Débito Carga Incompleta Previsto 08:00 Real 07:30 = -00:30 "Débito - Carga incompleta dia 16/09" Débito Folgas Extras direito 5 realizou 7 = 2 abatem "Débito - Folga Compensatória dia 20/09" Horas trabalhadas em folgas e feriados creditam banco e saldo, faltas debitam.

E) Virada Dia Noturna: Jornada iniciada 18:00 dia 21 e saída 03:00 dia 22 pertence à jornada do dia 21. Não quebrar em 2 dias. Dia 22 inicia zerado. Protocolo MTE jornada noturna. Ex: Dia21: 18:00 Entrada | 21:00 Saída Intervalo | 21:30 Entrada Intervalo | 03:00(dia22) Saída = 4 batidas da jornada dia21.

F) Relatórios PDF e XML por funcionário/período com total e saldo.



MÓDULO 4 - FOLHA DE PONTO PADRÃO MTE:

Seleção topo: Select Funcionário dos 12 incluindo desligados para histórico + Select Período data início e fim. Botão Gerar: Gera folha padrão MTE Portaria 671/2021: Colunas Dia, Dia Semana, Entrada, Saída Intervalo, Entrada Intervalo, Saída, Horas Trabalhadas, Saldo Dia, Ocorrência, Fonte Horário. Ocorrências automáticas: FÉRIAS, FERIADO - laranja, DSR azul, FOLGA DOMINGO azul, FOLGA COMPENSADA azul, AFASTAMENTO com motivo, FALTA vermelho, DESLIGADO cinza, ATRASO. Rodapé oficial obrigatório em TODA folha Tela, PDF Individual, PDF Lote, XML Individual e Lote: Totais período: Total Faltas, Faltas Justificadas com motivo ex Atestado Médico dia 15/09, Faltas Injustificadas, Total Folgas, Total Feriados, Total Horas Extras, Total Horas Faltantes/Atrasos, Banco Horas 4 infos: Saldo Anterior antes data inicial, Créditos período, Débitos período, Saldo Atual final Cálculo Saldo Anterior+Créditos-Débitos. Legenda explicativa: FALTA = dia sem batida e sem folga/feriado | FOLGA = folga prevista escala | FERIADO = feriado cadastrado | _ = batida tratada/movida com motivo obrigatório. Rodapé com gerenciador: "Gerado em 22/09/2026 às 21:30 por Gerenciador: Carlos Lima - Função: Gerente RH - Portaria MTE 671/2021" Local Salinópolis-PA + data atual + Assinatura Diretor + Assinatura Empregado. Cabeçalho MTE obrigatório todas folhas: Empregador Razão Social + Nome Fantasia + CNPJ/CPF + CEI/CAEPF/CNO + Endereço Completo + E-mail Empregador Trabalhador Nome+CPF+Função+Departamento+Admissão Relatório Data emissão+Período+Horário/Jornada contratual+Escala. Segurança PIN NUNCA aparece tela, PDF, XML, impressão só uso interno. Justificativas na linha dia: "15/09 - FALTA JUSTIFICADA - ATESTADO MÉDICO - CID J06 - Obs: 1 dia" Tipos ATESTADO MÉDICO, AFASTAMENTO, SUSPENSÃO, LICENÇA. Exportação em Lote: seletor Período obrigatório Data Inicial e Final Lista Funcionários com checkbox [ ] + [Selecionar Todos] topo Permitir 1, vários ou todos Botões Lote: [Visualizar em Lote na Tela] folhas uma abaixo outra com quebra [Imprimir em Lote] [Exportar em PDF em Lote] PDF único várias páginas ou ZIP com PDF por funcionário Nome Folhas_MTE_Setembro_2026.pdf [Exportar em XML em Lote] ZIP com XML por funcionário NOME_MES_ANO.xml Ex JOAO_SILVA_09_2026.xml Conteúdo Lote: tudo exigido cabeçalho MTE sem PIN Função Depto Admissão FOLGA/FALTA/FERIADO Saldo Banco totais justificativas motivos. Botões Exportar PDF usar jsPDF e Exportar XML AFD/ACJEF largura fixa oficial com Nome Fantasia e fonte servidor. Tags XML bem-formado <?xml version="1.0" encoding="UTF-8"?> UTF-8 escape çãéáô & < >. No Lote cada funcionário rodapé próprio. XML resumo tags <resumo><totalFaltas>2</totalFaltas><faltasJustificadas>1</faltasJustificadas><faltasInjustificadas>1</faltasInjustificadas><saldoAnterior>10:30</saldoAnterior><saldoAtual>12:15</saldoAtual><legenda>...</legenda></resumo>.[Nome]



COMPROVANTE TÉRMICO OBRIGATÓRIO:

Função imprimirComprovante(batida): Compatível PC com impressora térmica USB 58mm/80mm e SUNMI D2 MINI impressora nativa 58mm. A cada batida chama automaticamente. Conteúdo MTE obrigatório: Logo, Razão Social, Nome Fantasia, CNPJ, Título "COMPROVANTE DE REGISTRO DE PONTO DO TRABALHADOR", Nome, CPF, Data, Hora batida intocável servidor, NSR sequencial, Tipo Marcação, Fonte Horário, Texto "Este comprovante é prova da marcação", Hash/Assinatura btoa(nsr+data+hora). Se não tiver impressora salva comprovante em PDF pasta. Usar http://window.print() com @media print width 58mm ∼32 chars linha fontes normais Corte Papel: enviar 3 a 4 linhas \n final para passar serrilha manual D2 Mini sem guilhotina. Detecção SUNMI via http://window.woyouService e http://window.sunmiPrinterService com retry assíncrono e diagnóstico visual status impressora na sidebar. Opção na batida reimprimir comprovante caso não imprima e envie para email empregado também. Cada registro histórico tocável reimprimir ou enviar email qualquer momento.



REGRAS FINAIS: Tudo em localStorage. Sem backend. Código limpo, comentado, pronto para usar. Não pode faltar nenhum detalhe de PIN com bolinha 1s, 5 segundos limpeza automática, motivo afastamento na folha, escala travada 7 dias histórico, semana mesclada, NSR, comprovante térmico SUNMI, dashboard primeira aba, multi-empresa 3 contas isolamento total RLS, gerenciador 4, banco horas automático, virada noturna, lote, CSV escala ponto-e-vírgula compatível Google Sheets e Excel brasileiro botão Baixar CSV Departamento Funcionario PIN Horario/Folga cada dia e contagem folgas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vipponto.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5483e1e-66b3-44d7-9ad9-693ea557612a).

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
