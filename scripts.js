$(document).ready(function(){
  // Máscaras de telefone
  $('#telefone').mask('(00) 0000-0000');
  $('#celular').mask('(00) 00000-0000');
  $('#comercial').mask('(00) 0000-0000');
  $('#prejuizo').mask('#.##0,00', {reverse: true});

  // Máscara de CPF/CNPJ
  $('input[name="tipoPessoa"]').on('change', function() {
    const tipo = $(this).val();
    const $campo = $('#cpfCnpj');

    $campo.val(''); // Limpa o valor ao trocar 

    if(tipo === 'fisica'){
        $campo.mask('000.000.000-00');
    } else if(tipo === 'juridica'){
        $campo.mask('00.000.000/0000-00');
    }
  });

  // Busca de CEP
  $('#cep').on('blur', function () {
    const cep = $(this).val().replace(/\D/g, '');

    if (cep.length !== 8) return;

    $.getJSON(`https://brasilapi.com.br/api/cep/v1/${cep}`, function (data) {
      if (!data.erro) {
        $('#rua').val(data.street || data.logradouro);
        $('#bairro').val(data.neighborhood || data.bairro);
        $('#cidade').val(data.city || data.localidade);
        $('#ufSelect').val(data.state || data.uf);
      } else {
        alert('CEP não encontrado.');
      }
    }).fail(function() {
      alert('Erro ao buscar o CEP.');
    });
  });

  $('#adicionarProduto').on('click', function () {
    const $ultimoProduto = $('.produto-item').last();
    const $novoProduto = $ultimoProduto.clone();
    $novoProduto.find('input, select, textarea').each(function () {
      $(this).val('');
    });
    $('#produtos-container').append($novoProduto);
    $novoProduto.find('#prejuizo').mask('#.##0,00', {reverse: true});
  });

  // Envio do formulário
  $('#formulario').on('submit', function (e) {
    e.preventDefault(); // Evita o envio real do formulário
    window.location.href = 'obrigado.html'; // Redireciona para a página de obrigado
  });
});

// Google Calendar API initialization

const CLIENT_ID = '763147178683-59jq3gha9055btpsoah1h9ulfa00aep0.apps.googleusercontent.com';
const API_KEY = 'AIzaSyA05K3rckFOM0qMqeENhbDJvxmjxDfZrZM';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let tokenClient;
let accessToken = null;

$('#btnSelecionarHorario').on('click', function () {
  initClient(); // ✅ sem "client:auth2"
});

function initClient() {
  gapi.load("client", () => {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          accessToken = tokenResponse.access_token;
          listarHorariosDisponiveis();
        },
      });

      tokenClient.requestAccessToken();
    });
  });
}

function listarHorariosDisponiveis() {
  const calendarId = 'primary';
  const hoje = new Date();
  const fim = new Date();
  fim.setDate(hoje.getDate() + 7);

  gapi.client.calendar.events.list({
    calendarId: calendarId,
    timeMin: hoje.toISOString(),
    timeMax: fim.toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime"
  }).then(response => {
    const eventos = response.result.items;
    const ocupados = eventos.map(ev => ev.start.dateTime || ev.start.date);

    const disponiveis = [];
    for (let dia = new Date(hoje); dia <= fim; dia.setDate(dia.getDate() + 1)) {
      for (let h = 9; h < 17; h++) {
        for (let m = 0; m < 60; m += 30) {
          const slot = new Date(dia);
          slot.setHours(h, m, 0, 0);
          const iso = slot.toISOString();
          const ocupado = ocupados.some(ev => ev.startsWith(iso.slice(0, 16)));
          if (!ocupado) disponiveis.push(iso);
        }
      }
    }

    const $select = $('#horariosDisponiveis');
    $select.empty().append('<option value="">Selecione um horário</option>');
    disponiveis.forEach(horario => {
      const localTime = new Date(horario).toLocaleString('pt-BR');
      $select.append(`<option value="${horario}">${localTime}</option>`);
    });

  });
}

