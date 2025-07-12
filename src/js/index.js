import {
  criarAgendamento,
  atualizarAgendamento,
  listarAgendamentos,
  buscarAgendamento,
  excluirAgendamentoAPI,
  buscarHorariosDisponiveis,
} from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const formAgendamento = document.getElementById("form-agendamento");
  const btnCancelar = document.getElementById("btn-cancelar");
  const selectBarbeiro = document.getElementById("barbeiro");
  const selectData = document.getElementById("data");
  const selectHorario = document.getElementById("horario");
  const modal = document.getElementById("modal-confirmacao");

  // Estado da aplicação
  let agendamentoEditando = null;

  // Configura data mínima (hoje)
  const today = new Date().toISOString().split("T")[0];
  selectData.min = today;
  selectData.value = today;

  // Event Listeners
  formAgendamento.addEventListener("submit", handleSubmit);
  btnCancelar.addEventListener("click", cancelarEdicao);
  selectBarbeiro.addEventListener("change", carregarHorariosDisponiveis);
  selectData.addEventListener("change", carregarHorariosDisponiveis);

  // Carrega horários disponíveis assim que a página carrega
  carregarHorariosDisponiveis();

  // Funções
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(formAgendamento);
    const agendamento = Object.fromEntries(formData.entries());

    try {
      if (agendamentoEditando) {
        await atualizarAgendamento(agendamentoEditando.id, agendamento);
        showModal("Agendamento atualizado com sucesso!", agendamento);
      } else {
        await criarAgendamento(agendamento);
        showModal("Agendamento criado com sucesso!", agendamento);
      }

      formAgendamento.reset();
      agendamentoEditando = null;
      btnCancelar.style.display = "none";
      selectData.value = today; // Reset para data atual
      carregarHorariosDisponiveis(); // Recarrega horários
    } catch (error) {
      console.error("Erro:", error);
      alert(`Erro: ${error.message}`);
    }
  }

  async function carregarHorariosDisponiveis() {
    const barbeiroId = selectBarbeiro.value;
    const data = selectData.value;
    const feedback = document.getElementById("horario-feedback");
    feedback.textContent = "Verificando disponibilidade...";
    feedback.className = "feedback loading";

    if (!barbeiroId || !data) {
      selectHorario.innerHTML =
        '<option value="">Selecione um barbeiro e uma data</option>';
      return;
    }

    try {
      // Mostra um spinner enquanto carrega
      selectHorario.disabled = true;
      selectHorario.innerHTML = `
      <option value="">
        <i class="fas fa-spinner fa-spin"></i> Carregando horários...
      </option>
    `;

      const horarios = await buscarHorariosDisponiveis(barbeiroId, data);

      selectHorario.innerHTML =
        '<option value="">Selecione um horário</option>';

      if (horarios.length === 0) {
        selectHorario.innerHTML = `
        <option value="">Nenhum horário disponível nesta data</option>
        <option value="outro">Quero ser avisado quando houver horários</option>
      `;
      } else {
        horarios.forEach((hora) => {
          const option = document.createElement("option");
          option.value = hora;
          option.textContent = hora;
          selectHorario.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      selectHorario.innerHTML = `
      <option value="">Erro ao carregar horários</option>
      <option value="tentar_novamente">Tentar novamente</option>
    `;

      // Adiciona evento para tentar novamente
      selectHorario.addEventListener("change", function handler(e) {
        if (e.target.value === "tentar_novamente") {
          selectHorario.removeEventListener("change", handler);
          carregarHorariosDisponiveis();
        }
      });
    } finally {
      selectHorario.disabled = false;
    }
    if (horarios.length === 0) {
      feedback.textContent = "Nenhum horário disponível nesta data";
      feedback.className = "feedback error";
    } else {
      feedback.textContent = `${horarios.length} horários disponíveis`;
      feedback.className = "feedback";
    }

    // Em caso de erro:
    feedback.textContent = "Erro ao verificar disponibilidade";
    feedback.className = "feedback error";
  }

  function cancelarEdicao() {
    formAgendamento.reset();
    agendamentoEditando = null;
    btnCancelar.style.display = "none";
    selectData.value = today;
    carregarHorariosDisponiveis();
  }

  function showModal(message, agendamento) {
    const modalDetails = document.getElementById("modal-details");
    modalDetails.innerHTML = `
      <p><strong>Serviço:</strong> ${agendamento.servico}</p>
      <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
      <p><strong>Horário:</strong> ${agendamento.horario}</p>
      <p><strong>Barbeiro:</strong> ${
        selectBarbeiro.options[selectBarbeiro.selectedIndex].text
      }</p>
    `;

    modal.style.display = "block";
  }

  function formatarData(dataString) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dataString).toLocaleDateString("pt-BR", options);
  }

  // Fechar modal quando clicar no X
  document.querySelector(".close-modal").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fechar modal quando clicar no OK
  document.getElementById("btn-ok").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fechar modal quando clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Funções globais para a página de agendamentos
async function carregarAgendamentos() {
  const lista = document.getElementById("lista-agendamentos");
  if (!lista) return;

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
    `;
  }
}

async function editarAgendamento(id) {
  try {
    const data = await buscarAgendamento(id);
    document.getElementById("nome").value = data.nome;
    document.getElementById("telefone").value = data.telefone;
    document.getElementById("servico").value = data.servico;
    document.getElementById("data").value = data.data;

    // Preenche o horário após carregar as opções disponíveis
    setTimeout(() => {
      document.getElementById("horario").value = data.horario;
    }, 500);

    agendamentoEditando = id;
    document.getElementById("btn-cancelar").style.display = "inline-block";
    document
      .getElementById("form-agendamento")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Erro ao editar agendamento:", error);
    alert(`Erro ao carregar agendamento para edição: ${error.message}`);
  }
}

async function excluirAgendamento(id) {
  if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

  try {
    await excluirAgendamentoAPI(id);
    alert("Agendamento excluído com sucesso!");
    await carregarAgendamentos();
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    alert(`Erro ao excluir agendamento: ${error.message}`);
  }
}

// Torna as funções disponíveis globalmente
window.editarAgendamento = editarAgendamento;
window.excluirAgendamento = excluirAgendamento;
window.carregarAgendamentos = carregarAgendamentos;
