/**
 * dados.js
 * Operações sobre os registros: adicionar, listar, editar e remover.
 * Os dados ta salvo na memoria e também no localStorage,
 * para não se perderem ao recarregar a página.
 */

const CHAVE_ARMAZENAMENTO = "ponteSolidariaRegistros";
const MENSAGEM_ERRO_GERAL = "Não foi possível concluir a operação. Tente novamente.";

// Lista de registros usada pela página
let registros = [];

// Gera um identificador único para cada registro
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Confere se um item lido do armazenamento tem o formato esperado
function itemEhValido(item) {
  return item !== null &&
         typeof item === "object" &&
         typeof item.id === "string" &&
         validarRegistro(item).valido;
}

// Salva a lista no localStorage
function salvarRegistros() {
  try {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(registros));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Carrega a lista salva; se algo falhar, começa vazia
function carregarRegistros() {
  try {
    const texto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (texto === null) {
      registros = [];
      return true;
    }
    const lista = JSON.parse(texto);
    registros = Array.isArray(lista) ? lista.filter(itemEhValido) : [];
    return true;
  } catch (e) {
    console.error(e);
    registros = [];
    registrarAtividade("Carregar", "Não foi possível carregar os dados. Tente novamente.", true);
    return false;
  }
}

// LISTAR: devolve uma cópia da lista de registros
function listarRegistros() {
  return registros.slice();
}

// Procura um registro pelo id
function buscarRegistro(id) {
  return registros.find(function (registro) {
    return registro.id === id;
  });
}

// ADICIONAR: valida os dados e, se estiverem certos, guarda o novo registro
function adicionarRegistro(entrada) {
  try {
    const resultado = validarRegistro(entrada);
    if (!resultado.valido) {
      registrarAtividade("Adicionar", "dados inválidos, nada foi salvo", true);
      return { ok: false, erros: resultado.erros };
    }

    const novo = Object.assign({}, resultado.dados, {
      id: gerarId(),
      criadoEm: new Date().toISOString()
    });
    registros.push(novo);
    salvarRegistros();

    registrarAtividade("Adicionar", "item adicionado com sucesso", false);
    return { ok: true };
  } catch (e) {
    console.error(e);
    registrarAtividade("Adicionar", MENSAGEM_ERRO_GERAL, true);
    return { ok: false, mensagem: MENSAGEM_ERRO_GERAL };
  }
}

// EDITAR: valida os dados novos e atualiza o registro com o id informado
function editarRegistro(id, entrada) {
  try {
    const existente = buscarRegistro(id);
    if (!existente) {
      registrarAtividade("Editar", "item não encontrado", true);
      return { ok: false, mensagem: "Item não encontrado." };
    }

    const resultado = validarRegistro(entrada);
    if (!resultado.valido) {
      registrarAtividade("Editar", "dados inválidos, nada foi alterado", true);
      return { ok: false, erros: resultado.erros };
    }

    Object.assign(existente, resultado.dados);
    salvarRegistros();

    registrarAtividade("Editar", "item editado com sucesso", false);
    return { ok: true };
  } catch (e) {
    console.error(e);
    registrarAtividade("Editar", MENSAGEM_ERRO_GERAL, true);
    return { ok: false, mensagem: MENSAGEM_ERRO_GERAL };
  }
}

// REMOVER: apaga o registro com o id informado
function removerRegistro(id) {
  try {
    const tamanhoAntes = registros.length;
    registros = registros.filter(function (registro) {
      return registro.id !== id;
    });

    if (registros.length === tamanhoAntes) {
      registrarAtividade("Remover", "item não encontrado", true);
      return { ok: false, mensagem: "Item não encontrado." };
    }

    salvarRegistros();
    registrarAtividade("Remover", "item removido com sucesso", false);
    return { ok: true };
  } catch (e) {
    console.error(e);
    registrarAtividade("Remover", MENSAGEM_ERRO_GERAL, true);
    return { ok: false, mensagem: MENSAGEM_ERRO_GERAL };
  }
}