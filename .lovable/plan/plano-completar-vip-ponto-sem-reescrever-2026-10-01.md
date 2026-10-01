# Plano — completar VIP PONTO sem reescrever

## Resultado
Aprimorar somente `public/vip-ponto.html`, preservando todos os módulos, dados e integrações existentes.

## Alterações
1. **Funcionário e jornada**
   - Adicionar vigência obrigatória do banco, intervalo pré-assinalado Art. 71 e opção de 4 ou 6 marcações.
   - Aplicar essas regras na batida, folha e banco de horas.
   - Criar a aba confidencial de PINs dentro de Empregados.

2. **Folha e cálculos**
   - Consolidar a escala como fonte do DSR/folga e do horário previsto com tolerância de 10 minutos.
   - Incluir hora noturna reduzida (52m30s), marca `*N` e crédito correspondente.
   - Retirar histórico/log das folhas, PDFs, XML e e-mails.
   - Unificar a geração de PDF com logo para folha individual, lote e Portal do Empregado.

3. **Tela de ponto, logos e acesso**
   - Aplicar o visual escuro da referência, tema Claro/Escuro/Auto e botão ⏻ vermelho.
   - Separar logo global do app e logo da empresa.
   - Restringir edição de dados do desenvolvedor e logo global ao PIN mestre 1000.
   - Adicionar olho da senha e exclusão de conta com confirmação dupla.

4. **Escala e arquivos**
   - Trocar a navegação semanal por filtros de 7/15/30 dias, mantendo trava de 7 dias e histórico.
   - Adicionar modelo CSV, importação CSV/XLSX com prévia e gravação da escala.
   - Ajustar o AFD Tipo 3 solicitado e manter o restante dos arquivos existentes.

5. **Instalação e perfil**
   - Adicionar manifesto instalável sem distorcer a logo e sem criar modo offline.
   - Criar perfil da conta no Supabase, protegido por usuário, preservando o cache local prefixado por e-mail.
   - Atualizar o manual para seis passos com ícones e padronizar cabeçalho/rodapé MTE.

## Verificação
- Conferir cadastro, login, exclusão, PIN de 4/6 batidas, escala, folha, PDF, Portal, AFD e importação.
- Validar visualmente em desktop e celular, incluindo a tela escura da imagem enviada.
- Confirmar compilação sem erros e políticas de acesso do banco.
