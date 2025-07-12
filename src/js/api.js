const API_URL = "https://f4enmetx22.execute-api.us-east-1.amazonaws.com/v1/agendamentos";
const API_KEY = "mUc18TnrW26NxZ0jtUE307S1oSsrM3hC3kripNHW";

const getAuthToken = () => {
  return localStorage.getItem('authToken') || API_KEY;
};

// Configuração comum para as requisições fetch
const fetchConfig = (method, body = null) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${getAuthToken()}`
    },
    mode: 'cors'
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  return config;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ${response.status}`);
  }
  return response.json();
};

/**
 * Cria novo agendamento (POST)
 * @param {Object} dados - Dados do agendamento
 * @returns {Promise<Object>} - Resposta da API
 */
export const criarAgendamento = async (dados) => {
  const response = await fetch(`${API_BASE_URL}/agendamentos`, fetchConfig('POST', dados));
  return handleResponse(response);
};

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
export const listarAgendamentos = async (userId) => {
  const url = userId ? `${API_BASE_URL}/agendamentos?userId=${userId}` : `${API_BASE_URL}/agendamentos`;
  const response = await fetch(url, fetchConfig('GET'));
  return handleResponse(response);
};

export const cancelarAgendamento = async (agendamentoId) => {
  const response = await fetch(`${API_BASE_URL}/agendamentos/${agendamentoId}/cancelar`, {
    ...fetchConfig('PUT'),
    body: JSON.stringify({ status: 'cancelado' })
  });
  return handleResponse(response);
};
export const buscarAgendamentosPorPeriodo = async (userId, startDate, endDate) => {
  const response = await fetch(
    `${API_BASE_URL}/agendamentos?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    fetchConfig('GET')
  );
  return handleResponse(response);
};
// Funções para barbeiros
export const listarBarbeiros = async () => {
  const response = await fetch(`${API_BASE_URL}/barbeiros`, fetchConfig('GET'));
  return handleResponse(response);
};

// Funções para serviços
export const listarServicos = async () => {
  const response = await fetch(`${API_BASE_URL}/servicos`, fetchConfig('GET'));
  return handleResponse(response);
};
/**
 * Busca um agendamento específico (GET)
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} - Dados do agendamento
 */
export const buscarHorariosDisponiveis = async (barbeiroId, data) => {
  const response = await fetch(
    `${API_BASE_URL}/horarios-disponiveis?barbeiroId=${barbeiroId}&data=${data}`,
    fetchConfig('GET')
  );
  return handleResponse(response);
};

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

// AUTENTICAÇÃO
export const login = async (email, senha) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, fetchConfig('POST', { email, senha }));
  const data = await handleResponse(response);
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};