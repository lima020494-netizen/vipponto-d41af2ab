# Link mensal da folha e kiosk compacto

## Resultado
- O gestor gera um link temporário para um colaborador e um mês específico.
- O link abre somente aquela folha, sem acesso ao kiosk ou ao painel, e permite baixar o PDF oficial.
- O envio usa uma mensagem curta por e-mail quando o domínio estiver disponível; enquanto não estiver, permite copiar ou compartilhar o link.
- O teclado do kiosk será compactado para manter relógio, PIN, teclado e botão visíveis sem rolagem nas telas menores.

## Implementação
- Guardar somente o hash de um token aleatório no banco, associado ao usuário dono, colaborador, competência e validade.
- Criar endpoints protegidos para emitir links e públicos para validar o token e devolver somente os dados necessários à folha daquele mês.
- Adicionar uma tela pública exclusiva para a folha compartilhada, reutilizando a geração oficial de PDF com logotipo.
- Ajustar alturas, espaçamentos e regras responsivas do kiosk, preservando o relógio em 72px nas telas com altura suficiente.
- Validar expiração, token inválido, visualização, download e alturas de 768px e 600px.

## Limite atual
- O domínio de envio ainda não está configurado. O link funcionará e poderá ser copiado/compartilhado; o envio automático começa após configurar um domínio próprio.
