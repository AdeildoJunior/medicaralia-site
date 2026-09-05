# Roadmap — Medicaralia

> Status em 2026-09-04: Fases 0 a 3 implementadas no MVP estático.
> Próximo passo real é a Fase 4 (validação com profissionais reais).

## Fase 0 — Fundação ✅

- Registrar domínio medicaralia.com.br
- Criar repositório local
- Reaproveitar base da SoproLife
- Criar identidade visual própria
- Criar documentação inicial
- Preparar MVP estático

## Fase 1 — Landing page ✅

- Página inicial
- Hero com busca
- Seção para pacientes
- Seção para profissionais
- Cards de especialidades
- Cards de profissionais fictícios
- CTA para cadastro profissional
- FAQ
- Rodapé

## Fase 2 — Diretório ✅

- Página de profissionais
- Filtros por especialidade, cidade e bairro
- Dados em JSON
- Perfil individual de profissional
- Botão de WhatsApp por profissional

## Fase 3 — Painel ✅ (parcial — leitura apenas)

- Dashboard interno
- Lista de profissionais
- Leads recebidos — pendente (hoje chegam pelo WhatsApp, sem registro)
- Parceiros — pendente
- Status de cadastro
- Indicadores comerciais

## Fase 4 — Validação

- Cadastrar primeiros profissionais manualmente
- Criar formulário de interesse
- Fazer campanha orgânica
- Testar mensagens com recém-formados
- Medir demanda

## Fase 5 — Produto real

- Backend
- Banco de dados
- Login de profissional
- Agenda real
- Pagamento recorrente
- Área do paciente
- Integrações com WhatsApp e Google Calendar

## Feito no MVP (2026-09-04)

- Design system extraído para `site/assets/mk.css` e núcleo JS em `site/assets/mk.js`
- Diretório `/profissionais/` com filtros combinados, ordenação e estado na URL
- Mapa Leaflet + OpenStreetMap (home, diretório com modal ampliado, e perfil)
- Perfil individual `/profissional/?p=slug` com schema.org Physician
- Cadastro profissional com validação e handoff para WhatsApp
- Página `/sobre/` com planos, LGPD e regras de publicidade médica
- Painel interno com KPIs e cobertura, lendo os mesmos JSON do site
- Base ampliada para 16 profissionais, 14 especialidades e 6 cidades, com coordenadas

## Dívidas conhecidas

- Perfis são fictícios: substituir por reais com consentimento antes do lançamento
- Sem backend: leads não são registrados, apenas encaminhados ao WhatsApp
- Coordenadas são do centro do bairro, não do consultório
- Número de WhatsApp da plataforma em `mk.js` é placeholder (5521900000000)
