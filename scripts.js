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

