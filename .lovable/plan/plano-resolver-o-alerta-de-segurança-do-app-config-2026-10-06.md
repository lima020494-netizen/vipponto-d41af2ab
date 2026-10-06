# Plano: Resolver o alerta de segurança do app_config

## Contexto

O scanner de segurança sinalizou que a tabela `app_config` (chave PIX e contato de suporte do WhatsApp) pode ser lida por qualquer pessoa, inclusive sem login. O usuário confirmou que **esse acesso público é intencional** — os dados de cobrança precisam estar visíveis na tela de assinatura.

## Ação

1. Marcar o finding `lov_db_rls_tautology_permissive_v1_2d9f3a1bfab6468a` (scanner `lov_pgscan`) como **ignorado** via `manage_security_finding`, com a justificativa: os dados de cobrança (chave PIX e contato de suporte) são públicos por decisão do produto, pois aparecem na tela de assinatura para qualquer visitante.

## O que NÃO muda

- Nenhuma alteração no banco de dados, nas políticas de acesso ou no código do app.
- O finding de proteção contra senhas vazadas (`lov_db_auth_leaked_password_protection_v1`) permanece ativo e intocado, conforme solicitado.

## Observação

Ignorar um finding não é reversível pelo assistente — só o usuário pode restaurá-lo na aba Segurança.
