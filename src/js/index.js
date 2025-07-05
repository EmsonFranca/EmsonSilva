import { 
  criarAgendamento, 
  atualizarAgendamento, 
  listarAgendamentos, 
  buscarAgendamento, 
  excluirAgendamentoAPI 
} from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agendamento");
  let agendamentoSelecionado = null;

  // Carrega agendamentos ao carregar a página
  carregarAgendamentos();

  // Envia formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const agendamento = {
      nome: document.getElementById("nome").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
      servico: document.getElementById("servico").value,
      data: document.getElementById("data").value,
      horario: document.getElementById("horario").value,
    };

    if (Object.values(agendamento).some((v) => !v)) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      if (agendamentoSelecionado) {
        await atualizarAgendamento(agendamentoSelecionado, agendamento);
        alert("✅ Agendamento atualizado com sucesso!");
      } else {
        await criarAgendamento(agendamento);
        alert("✅ Agendamento criado com sucesso!");
      }
      form.reset();
      agendamentoSelecionado = null;
      await carregarAgendamentos();
    } catch (error) {
      console.error("Erro no submit:", error);
      alert(`Erro: ${error.message}`);
    }
  });
});

/**
 * Carrega e exibe a lista de agendamentos
 */
async function carregarAgendamentos() {
  const lista = document.getElementById("lista-agendamentos");
  if (!lista) {
    console.error("Elemento #lista-agendamentos não encontrado");
    return;
  }

  try {
    lista.innerHTML = "<p>Carregando agendamentos...</p>";
    
    const agendamentos = await listarAgendamentos();
    
    lista.innerHTML = "";
    
    if (agendamentos.length === 0) {
      lista.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
      return;
    }

    agendamentos.forEach((a) => {
      const card = document.createElement("div");
      card.className = "agendamento-card";
      card.innerHTML = `
        <strong>${a.nome}</strong> (${a.telefone})<br>
        ${a.servico} - ${a.data} às ${a.horario}<br>
        <button onclick="editarAgendamento('${a.agendamentoId}')">✏️ Editar</button>
        <button onclick="excluirAgendamento('${a.agendamentoId}')">🗑️ Excluir</button>
        <hr>
      `;
      lista.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);
    lista.innerHTML = `
      <p class="error">Falha ao carregar agendamentos</p>
      <p>${error.message}</p>
      <p>Verifique a conexão e tente novamente.</p>
    `;
  }
}

/**
 * Preenche o formulário para edição
 * @param {string} id - ID do agendamento
 */
async function editarAgendamento(id) {
  try {
    const data = await buscarAgendamento(id);
    
    document.getElementById("nome").value = data.nome;
    document.getElementById("telefone").value = data.telefone;
    document.getElementById("servico").value = data.servico;
    document.getElementById("data").value = data.data;
    document.getElementById("horario").value = data.horario;

    agendamentoSelecionado = id;
    
    // Rola a página até o formulário
    document.getElementById("form-agendamento").scrollIntoView({ behavior: 'smooth' });
    alert("Modo de edição ativado. Atualize os dados e clique em Salvar.");
  } catch (error) {
    console.error("Erro ao editar agendamento:", error);
    alert(`Erro ao carregar agendamento para edição: ${error.message}`);
  }
}

/**
 * Exclui um agendamento
 * @param {string} id - ID do agendamento
 */
async function excluirAgendamento(id) {
  if (!confirm("Tem certeza que deseja excluir este agendamento permanentemente?")) {
    return;
  }

  try {
    await excluirAgendamentoAPI(id);
    alert("✅ Agendamento excluído com sucesso!");
    await carregarAgendamentos();
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    alert(`Erro ao excluir agendamento: ${error.message}`);
  }
}

// Exporta funções para o escopo global (necessário para os eventos onclick no HTML)
window.editarAgendamento = editarAgendamento;
window.excluirAgendamento = excluirAgendamento;