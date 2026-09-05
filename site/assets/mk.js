/* === Medicaralia — Núcleo JS compartilhado ===
   Sem dependências. Leaflet é carregado sob demanda (padrão herdado do site SoproLife).
*/
(function (global) {
  'use strict';

  var MK = {};

  /* ---------- Configuração ---------- */
  MK.config = {
    whatsappPlataforma: '5521900000000',
    dataBase: '/data/',
    leafletCSS: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    leafletJS: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    // OpenStreetMap padrão: sem chave de API. (O CARTO, usado no site da SoproLife,
    // passou a exigir API key e carimba "API KEY REQUIRED" nos tiles.)
    tileURL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    leafletTimeout: 12000
  };

  /* ---------- Utilitários ---------- */
  MK.qs = function (name, fallback) {
    var v = new URLSearchParams(global.location.search).get(name);
    return v === null || v === '' ? (fallback || '') : v;
  };

  MK.slugify = function (s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  MK.esc = function (s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  MK.plural = function (n, um, muitos) {
    return n + ' ' + (n === 1 ? um : muitos);
  };

  /* ---------- Carregamento de dados ---------- */
  var cache = {};
  MK.loadJSON = function (arquivo) {
    if (cache[arquivo]) return cache[arquivo];
    cache[arquivo] = fetch(MK.config.dataBase + arquivo, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('Falha ao carregar ' + arquivo + ' (' + r.status + ')');
        return r.json();
      })
      .catch(function (err) {
        console.error('[Medicaralia]', err);
        return null;
      });
    return cache[arquivo];
  };

  MK.carregarBase = function () {
    return Promise.all([
      MK.loadJSON('profissionais.json'),
      MK.loadJSON('especialidades.json'),
      MK.loadJSON('cidades.json')
    ]).then(function (r) {
      return {
        profissionais: (r[0] && r[0].profissionais ? r[0].profissionais : []).filter(function (p) { return p.ativo !== false; }),
        especialidades: (r[1] && r[1].especialidades) || [],
        cidades: (r[2] && r[2].cidades) || []
      };
    });
  };

  /* ---------- WhatsApp ---------- */
  MK.whatsappURL = function (numero, mensagem) {
    var n = String(numero || MK.config.whatsappPlataforma).replace(/\D/g, '');
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(mensagem || '');
  };

  MK.mensagemProfissional = function (p) {
    return 'Olá, ' + (p.nome || '') + '! Encontrei seu perfil na Medicaralia e gostaria de agendar um atendimento de '
      + (p.especialidade || 'saúde') + '. Pode me passar os horários disponíveis?';
  };

  /* ---------- Filtragem ---------- */
  MK.filtrar = function (lista, f) {
    f = f || {};
    var termo = MK.slugify(f.q || '');
    return lista.filter(function (p) {
      if (f.especialidade && p.especialidade_slug !== f.especialidade) return false;
      if (f.cidade && p.cidade_slug !== f.cidade) return false;
      if (f.bairro && MK.slugify(p.bairro) !== MK.slugify(f.bairro)) return false;
      if (f.online && !p.atende_online) return false;
      if (f.convenio && !p.aceita_convenio) return false;
      if (termo) {
        var alvo = MK.slugify([
          p.nome, p.especialidade, p.cidade, p.bairro, p.descricao,
          (p.servicos || []).join(' ')
        ].join(' '));
        if (alvo.indexOf(termo) === -1) return false;
      }
      return true;
    });
  };

  MK.ordenar = function (lista, criterio) {
    var c = lista.slice();
    if (criterio === 'nome') {
      c.sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); });
    } else if (criterio === 'preco') {
      c.sort(function (a, b) { return (a.preco_consulta || 1e9) - (b.preco_consulta || 1e9); });
    } else if (criterio === 'especialidade') {
      c.sort(function (a, b) { return String(a.especialidade).localeCompare(String(b.especialidade), 'pt-BR'); });
    }
    return c;
  };

  MK.formatarPreco = function (v) {
    if (!v && v !== 0) return 'Sob consulta';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  };

  /* ---------- Leaflet sob demanda ---------- */
  var leafletPromise = null;
  MK.carregarLeaflet = function () {
    if (global.L && global.L.map) return Promise.resolve(global.L);
    if (leafletPromise) return leafletPromise;

    leafletPromise = new Promise(function (resolve, reject) {
      var encerrado = false;
      var finalizar = function (fn, arg) {
        if (encerrado) return;
        encerrado = true;
        clearTimeout(limite);
        fn(arg);
      };

      // Sem isto, uma CDN lenta deixa o mapa preso em "Carregando mapa…" para sempre.
      var limite = setTimeout(function () {
        leafletPromise = null; // permite nova tentativa depois
        finalizar(reject, new Error('O mapa demorou demais para carregar.'));
      }, MK.config.leafletTimeout);

      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = MK.config.leafletCSS;
      css.crossOrigin = '';
      document.head.appendChild(css);

      var s = document.createElement('script');
      s.src = MK.config.leafletJS;
      s.crossOrigin = '';
      s.onload = function () { finalizar(resolve, global.L); };
      s.onerror = function () {
        leafletPromise = null;
        finalizar(reject, new Error('Não foi possível carregar o mapa.'));
      };
      document.body.appendChild(s);
    });
    return leafletPromise;
  };

  MK.criarTiles = function (mapa) {
    return global.L.tileLayer(MK.config.tileURL, {
      maxZoom: 19,
      attribution: MK.config.tileAttr
    }).addTo(mapa);
  };

  MK.pinIcon = function (ativo) {
    return global.L.divIcon({
      className: 'mk-map-pin-wrap' + (ativo ? ' is-active' : ''),
      html: '<span class="mk-map-pin" aria-hidden="true"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -18]
    });
  };

  /* Cria um mapa com os profissionais recebidos.
     opcoes: { estatico: bool, padding: [x,y], aoClicar: fn(profissional) } */
  MK.montarMapa = function (node, profissionais, opcoes) {
    opcoes = opcoes || {};
    if (!node || !global.L) return null;

    var comCoord = (profissionais || []).filter(function (p) {
      return typeof p.lat === 'number' && typeof p.lng === 'number';
    });

    var mapa = global.L.map(node, opcoes.estatico ? {
      zoomControl: false, attributionControl: false, dragging: false,
      scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false,
      keyboard: false, touchZoom: false
    } : {
      zoomControl: true, attributionControl: true, scrollWheelZoom: false
    });

    MK.criarTiles(mapa);

    if (!comCoord.length) {
      mapa.setView([-15.78, -47.93], 4);
      return { mapa: mapa, marcadores: [] };
    }

    var bounds = [];
    var marcadores = comCoord.map(function (p) {
      var m = global.L.marker([p.lat, p.lng], { icon: MK.pinIcon(false) }).addTo(mapa);
      m.bindPopup(
        '<div class="mk-map-pop">' +
        '<div class="mk-map-pop-name">' + MK.esc(p.nome) + '</div>' +
        '<div class="mk-map-pop-esp">' + MK.esc(p.especialidade) + '</div>' +
        '<div style="font-size:.78rem;color:#5c7a8a;margin-bottom:6px">' +
        MK.esc(p.bairro) + ' · ' + MK.esc(p.cidade) + '/' + MK.esc(p.estado) + '</div>' +
        '<a href="/profissional/?p=' + encodeURIComponent(p.slug) + '">Ver perfil completo →</a>' +
        '</div>'
      );
      if (opcoes.aoClicar) {
        m.on('click', function () { opcoes.aoClicar(p); });
      }
      bounds.push([p.lat, p.lng]);
      return { marker: m, prof: p };
    });

    if (bounds.length === 1) {
      mapa.setView(bounds[0], 14);
    } else {
      mapa.fitBounds(bounds, { padding: opcoes.padding || [30, 30], maxZoom: 13 });
    }

    return { mapa: mapa, marcadores: marcadores };
  };

  /* ---------- Ano no rodapé ---------- */
  MK.anoAtual = function () {
    document.querySelectorAll('[data-mk-ano]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  };

  document.addEventListener('DOMContentLoaded', MK.anoAtual);

  global.MK = MK;
})(window);
