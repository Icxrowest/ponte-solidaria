/**
 * log.js
 * Painel de registro de atividades.
 * Cada operação (adicionar, editar, remover...) gera uma linha na tela
 * com data/hora, ação e resultado.
 */

// Guarda as atividades na memória (some ao recarregar a página)
const atividades = [];

// Limite de linhas no painel, para a lista não crescer sem parar
const LIMITE_ATIVIDADES = 50;

// Devolve a data e hora atuais no formato 17/11/2026 08:30
function obterDataHoraAtual() {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return data + " " + hora;
}

// Monta o texto de uma atividade: "17/11/2026 08:30 — Adicionar: sucesso"
function montarTextoAtividade(atividade) {
  return atividade.dataHora + " — " + atividade.acao + ": " + atividade.resultado;
}

// Desenha a lista de atividades no painel da página
function mostrarAtividades() {
  const painel = document.getElementById("painel-log");
  if (!painel) {
    return;
  }

  painel.innerHTML = "";

  if (atividades.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "list-group-item text-muted";
    vazio.textContent = "Nenhuma atividade ainda.";
    painel.appendChild(vazio);
    return;
  }

  atividades.forEach(function (atividade) {
    const item = document.createElement("li");
    item.className = "list-group-item";
    if (atividade.erro) {
      item.classList.add("list-group-item-danger");
    }
    // textContent (e não innerHTML) evita que texto vire código HTML
    item.textContent = montarTextoAtividade(atividade);
    painel.appendChild(item);
  });
}

/**
 * Registra uma atividade e atualiza o painel.
 * acao: o que foi feito (ex.: "Adicionar")
 * resultado: como terminou (ex.: "item adicionado com sucesso")
 * erro: true quando a operação falhou (a linha fica vermelha)
 */
function registrarAtividade(acao, resultado, erro) {
  try {
    atividades.unshift({
      dataHora: obterDataHoraAtual(),
      acao: acao,
      resultado: resultado,
      erro: Boolean(erro)
    });

    // Mantém só as atividades mais recentes
    if (atividades.length > LIMITE_ATIVIDADES) {
      atividades.pop();
    }

    mostrarAtividades();
  } catch (e) {
    // Mensagem técnica só no console, nunca na tela do usuário
    console.error(e);
  }
}