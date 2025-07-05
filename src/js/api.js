const API_URL = "https://f4enmetx22.execute-api.us-east-1.amazonaws.com/v1/agendamentos";
const API_KEY = "mUc18TnrW26NxZ0jtUE307S1oSsrM3hC3kripNHW";

// Configuração comum para as requisições fetch
const fetchConfig = {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "Authorization": `Bearer ${API_KEY}`
  },
  mode: 'cors'
};

/**
 * Cria novo agendamento (POST)
 * @param {Object} dados - Dados do agendamento
 * @returns {Promise<Object>} - Resposta da API
 */
export async function criarAgendamento(dados) {
  try {
    const res = await fetch(API_URL, {
      ...fetchConfig,
      method: "POST",
      body: JSON.stringify(dados)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${res.status} ao criar agendamento`);
    }

    return await res.json();
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error;
  }
}

/**
 * Atualiza agendamento (PUT)
 * @param {string} id - ID do agendamento
 * @param {Object} dados - Dados atualizados
 * @returns {Promise<Object>} - Resposta da API
 */
export async function atualizarAgendamento(id, dados) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      ...fetchConfig,
      method: "PUT",
      body: JSON.stringify(dados)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${res.status} ao atualizar agendamento`);
    }

    return await res.json();
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw error;
  }
}

/**
 * Lista todos os agendamentos (GET)
 * @returns {Promise<Array>} - Lista de agendamentos
 */
export async function listarAgendamentos() {
  const res = await fetch(API_URL, fetchConfig);
  
  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorData = await res.json();
      errorDetails = errorData.message || JSON.stringify(errorData);
    } catch {
      errorDetails = `Status: ${res.status}`;
    }
    throw new Error(`Erro ao carregar: ${errorDetails}`);
  }

  const agendamentos = await res.json();
  
  if (!Array.isArray(agendamentos)) {
    throw new Error("Dados recebidos não são válidos");
  }

  return agendamentos;
}

/**
 * Busca um agendamento específico (GET)
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} - Dados do agendamento
 */
export async function buscarAgendamento(id) {
  const res = await fetch(`${API_URL}/${id}`, fetchConfig);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ${res.status} ao buscar agendamento`);
  }

  return await res.json();
}

/**
 * Exclui um agendamento (DELETE)
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} - Resposta da API
 */
export async function excluirAgendamentoAPI(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    method: "DELETE",
    mode: 'cors'
  });
  
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}