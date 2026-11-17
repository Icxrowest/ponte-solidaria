/**
 * main.js
 * Liga o formulário, a lista e os botões às operações de dados.
 * Só mexe na tela (DOM) e nos eventos; as regras ficam em validacao.js e dados.js.
 */

const CAMPOS = ["tipo", "categoria", "descricao", "quantidade", "bairro", "apelido", "status"];

const ROTULOS_TIPO = { oferta: "Oferta", necessidade: "Necessidade" };

// Pega o elemento do formulário pelo id
function obterCampo(nome) {
  return document.getElementById(nome);
}

// Lê os valores digitados no formulário
function lerFormulario() {
  const entrada = {};
  CAMPOS.forEach(function (campo) {
    entrada[campo] = obterCampo(campo).value;
  });
  return entrada;
}

// Apaga todas as mensagens de erro dos campos
function limparErros() {
  CAMPOS.forEach(function (campo) {
    const area = document.getElementById("erro-" + campo);
    if (area) {
      area.textContent = "";
    }
  });
}

// Mostra, abaixo de cada campo, a mensagem do erro encontrado
function mostrarErros(erros) {
  Object.keys(erros).forEach(function (campo) {
    const area = document.getElementById("erro-" + campo);
    if (area) {
      area.textContent = erros[campo];
    }
  });
}

// Mostra uma mensagem geral acima dos botões do formulário
function mostrarMensagem(texto, ehErro) {
  const area = document.getElementById("mensagem-form");
  area.textContent = texto;
  area.className = "small mb-2 " + (ehErro ? "text-danger" : "text-success");
}

// Cria um elemento com texto (textContent evita injeção de HTML)
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  elemento.className = classe;
  elemento.textContent = texto;
  return elemento;
}

// Monta o cartão de um registro, com os botões Editar e Remover
function criarCartaoRegistro(registro) {
  const coluna = criarElemento("div", "col-12 col-md-6 col-lg-4", "");
  const cartao = criarElemento("div", "card h-100", "");
  const corpo = criarElemento("div", "card-body", "");

  const etiqueta = ROTULOS_TIPO[registro.tipo] + " · " + registro.status;
  corpo.appendChild(criarElemento("span", "badge bg-secondary mb-2", etiqueta));
  corpo.appendChild(criarElemento("h3", "h6 card-title", registro.descricao));
  corpo.appendChild(criarElemento(
    "p",
    "card-text small mb-3",
    registro.categoria + " · quantidade: " + registro.quantidade +
    " · bairro: " + registro.bairro + " · por: " + registro.apelido
  ));

  const botaoEditar = criarElemento("button", "btn btn-sm btn-outline-primary me-2", "Editar");
  botaoEditar.type = "button";
  botaoEditar.dataset.acao = "editar";
  botaoEditar.dataset.id = registro.id;

  const botaoRemover = criarElemento("button", "btn btn-sm btn-outline-danger", "Remover");
  botaoRemover.type = "button";
  botaoRemover.dataset.acao = "remover";
  botaoRemover.dataset.id = registro.id;

  corpo.appendChild(botaoEditar);
  corpo.appendChild(botaoRemover);
  cartao.appendChild(corpo);
  coluna.appendChild(cartao);
  return coluna;
}

// Redesenha a lista de registros na página
function desenharLista() {
  const lista = document.getElementById("lista-registros");
  lista.innerHTML = "";

  const todos = listarRegistros();
  if (todos.length === 0) {
    lista.appendChild(criarElemento("p", "text-muted", "Nenhum registro ainda."));
    return;
  }

  todos.forEach(function (registro) {
    lista.appendChild(criarCartaoRegistro(registro));
  });
}

// Volta o formulário ao estado de "novo registro"
function sairDoModoEdicao() {
  document.getElementById("form-registro").reset();
  obterCampo("registro-id").value = "";
  document.getElementById("botao-salvar").textContent = "Adicionar";
  document.getElementById("botao-cancelar").classList.add("d-none");
  limparErros();
}

// Preenche o formulário com os dados de um registro para editar
function entrarNoModoEdicao(id) {
  const registro = buscarRegistro(id);
  if (!registro) {
    mostrarMensagem("Item não encontrado.", true);
    return;
  }

  CAMPOS.forEach(function (campo) {
    obterCampo(campo).value = registro[campo];
  });
  obterCampo("registro-id").value = registro.id;
  document.getElementById("botao-salvar").textContent = "Salvar alterações";
  document.getElementById("botao-cancelar").classList.remove("d-none");
  limparErros();
  mostrarMensagem("", false);
  obterCampo("tipo").focus();
}

// Quando o formulário é enviado: adiciona ou edita
function aoEnviarFormulario(evento) {
  evento.preventDefault();
  limparErros();

  try {
    const entrada = lerFormulario();
    const id = obterCampo("registro-id").value;
    const resultado = id ? editarRegistro(id, entrada) : adicionarRegistro(entrada);

    if (!resultado.ok) {
      if (resultado.erros) {
        mostrarErros(resultado.erros);
      }
      mostrarMensagem(resultado.mensagem || "Corrija os campos indicados.", true);
      return;
    }

    mostrarMensagem(id ? "Item editado com sucesso." : "Item adicionado com sucesso.", false);
    sairDoModoEdicao();
    desenharLista();
  } catch (e) {
    console.error(e);
    mostrarMensagem("Não foi possível concluir a operação. Tente novamente.", true);
  }
}

// Quando clicam em Editar ou Remover em algum cartão
function aoClicarNaLista(evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) {
    return;
  }

  const id = botao.dataset.id;

  if (botao.dataset.acao === "editar") {
    entrarNoModoEdicao(id);
    return;
  }

  if (botao.dataset.acao === "remover") {
    if (!window.confirm("Remover este item?")) {
      return;
    }
    const resultado = removerRegistro(id);
    mostrarMensagem(resultado.ok ? "Item removido com sucesso." : resultado.mensagem, !resultado.ok);
    desenharLista();
  }
}

// Prepara a página: carrega os dados e liga os eventos
function iniciarPagina() {
  const formulario = document.getElementById("form-registro");
  if (!formulario) {
    return; // outras páginas não têm formulário
  }

  carregarRegistros();
  desenharLista();
  mostrarAtividades();

  formulario.addEventListener("submit", aoEnviarFormulario);
  document.getElementById("lista-registros").addEventListener("click", aoClicarNaLista);
  document.getElementById("botao-cancelar").addEventListener("click", function () {
    sairDoModoEdicao();
    mostrarMensagem("Edição cancelada.", false);
  });
}

document.addEventListener("DOMContentLoaded", iniciarPagina);