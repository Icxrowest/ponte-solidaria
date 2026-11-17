/**
 * validacao.js
 * Regras de validação dos dados do formulário.
 * Cada função verifica um campo e devolve uma mensagem de erro,
 * ou uma string vazia quando o valor é válido.
 */

// Listas fixas: o usuário só pode escolher valores desta lista
const TIPOS_VALIDOS = ["oferta", "necessidade"];
const CATEGORIAS_VALIDAS = ["cesta basica", "colchao", "agua", "transporte", "voluntario", "outro"];
const STATUS_VALIDOS = ["aberto", "em andamento", "entregue"];

// Remove espaços extras no início e no fim do texto
function limparTexto(valor) {
  return String(valor ?? "").trim();
}

// Valida um valor que deve estar dentro de uma lista fixa
function validarOpcao(valor, lista, nomeCampo) {
  if (!lista.includes(valor)) {
    return "Selecione uma opção válida para " + nomeCampo + ".";
  }
  return "";
}

// Valida texto livre: não pode estar vazio e precisa respeitar o tamanho
function validarTexto(valor, minimo, maximo, nomeCampo) {
  if (valor === "") {
    return "O campo " + nomeCampo + " é obrigatório.";
  }
  if (valor.length < minimo || valor.length > maximo) {
    return "O campo " + nomeCampo + " deve ter de " + minimo + " a " + maximo + " caracteres.";
  }
  return "";
}

// Aceita só letras (com acento), números, espaços e pontuação simples
function validarFormatoTexto(valor, nomeCampo) {
  const formatoPermitido = /^[\p{L}\p{N} .,\-()!?]+$/u;
  if (!formatoPermitido.test(valor)) {
    return "O campo " + nomeCampo + " tem caracteres não permitidos.";
  }
  return "";
}

// Valida a quantidade: número inteiro de 1 a 999
function validarQuantidade(valor) {
  const numero = Number(valor);
  if (valor === "" || !Number.isInteger(numero)) {
    return "A quantidade deve ser um número inteiro.";
  }
  if (numero < 1 || numero > 999) {
    return "A quantidade deve estar entre 1 e 999.";
  }
  return "";
}

// Junta o erro de tamanho e o de formato de um campo de texto
function validarCampoTexto(valor, minimo, maximo, nomeCampo) {
  return validarTexto(valor, minimo, maximo, nomeCampo) ||
         validarFormatoTexto(valor, nomeCampo);
}

/**
 * Valida o registro inteiro.
 * Recebe um objeto com os campos do formulário e devolve:
 * { valido: true/false, erros: { campo: "mensagem" }, dados: {...limpos} }
 */
function validarRegistro(entrada) {
  const dados = {
    tipo: limparTexto(entrada.tipo),
    categoria: limparTexto(entrada.categoria),
    descricao: limparTexto(entrada.descricao),
    quantidade: limparTexto(entrada.quantidade),
    bairro: limparTexto(entrada.bairro),
    apelido: limparTexto(entrada.apelido),
    status: limparTexto(entrada.status)
  };

  const erros = {
    tipo: validarOpcao(dados.tipo, TIPOS_VALIDOS, "tipo"),
    categoria: validarOpcao(dados.categoria, CATEGORIAS_VALIDAS, "categoria"),
    descricao: validarCampoTexto(dados.descricao, 5, 100, "descrição"),
    quantidade: validarQuantidade(dados.quantidade),
    bairro: validarCampoTexto(dados.bairro, 3, 50, "bairro"),
    apelido: validarCampoTexto(dados.apelido, 2, 30, "apelido"),
    status: validarOpcao(dados.status, STATUS_VALIDOS, "status")
  };

  // Remove os campos sem erro, deixando só o que precisa ser corrigido
  Object.keys(erros).forEach(function (campo) {
    if (erros[campo] === "") {
      delete erros[campo];
    }
  });

  return {
    valido: Object.keys(erros).length === 0,
    erros: erros,
    dados: dados
  };
}