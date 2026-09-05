# Medicaralia

Plataforma acessível de visibilidade e agendamento para profissionais de saúde em início de carreira.

**Domínio:** medicaralia.com.br · **Deploy:** GitHub Pages (publica apenas `site/`)

## Estrutura

```
site/                  Site público (é o que vai ao ar)
  assets/mk.css        Design system único — todas as páginas importam
  assets/mk.js         Núcleo JS (MK.*): dados, filtros, WhatsApp, mapa
  data/                profissionais.json · especialidades.json · cidades.json
  index.html           Home: busca, especialidades, destaques, mapa, FAQ
  profissionais/       Diretório: filtros + lista + mapa interativo
  profissional/        Perfil individual (/profissional/?p=slug)
  cadastro/            Cadastro profissional → WhatsApp
  sobre/               Como funciona, planos, LGPD, publicidade médica
  sitemap.xml          Gerado a partir dos dados
painel/                Painel interno (não publicado) — leitura dos mesmos JSON
docs/                  Visão, identidade, roadmap, LGPD
```

## Rodar localmente

```bash
# Site público
cd site && python3 -m http.server 8899      # http://localhost:8899

# Painel interno (servir da raiz do repositório)
python3 -m http.server 8898                 # http://localhost:8898/painel/
```

Os caminhos são absolutos (`/assets/…`, `/data/…`), então o site precisa ser servido
da pasta `site/` — abrir o HTML por `file://` não funciona.

## O que já está pronto

- Busca por especialidade, cidade e bairro, com estado na URL (compartilhável)
- Filtro por teleconsulta e convênio, ordenação e chips de filtro ativo
- Mapa interativo (Leaflet + OpenStreetMap) na home, no diretório e no perfil
- Perfil individual com serviços, formação, valores, mapa e relacionados
- Cadastro profissional com validação e envio por WhatsApp, com consentimento LGPD
- Painel interno com KPIs, tabela de profissionais e cobertura por cidade
- Sitemap, robots, 404 e dados estruturados (schema.org)

## Importante

Os 16 profissionais em `site/data/profissionais.json` são **fictícios**, para demonstração.
Nomes, registros, telefones e coordenadas não correspondem a pessoas reais.
Devem ser substituídos por profissionais reais somente após cadastro e consentimento (LGPD).
