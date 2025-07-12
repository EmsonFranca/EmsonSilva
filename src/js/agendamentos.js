import { listarAgendamentos, cancelarAgendamento } from './api.js';
import { initAuth, getCurrentUser } from './auth.js';

const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let totalPages = 1;
let allAgendamentos = [];

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = '../pages/login.html';
        return;
    }

    document.getElementById('btn-filter').addEventListener('click', applyFilters);
    document.getElementById('btn-prev').addEventListener('click', goToPrevPage);
    document.getElementById('btn-next').addEventListener('click', goToNextPage);

    await loadAgendamentos(user.user_id);
});

async function loadAgendamentos(userId) {
    showLoading(true);
    
    try {
        allAgendamentos = await listarAgendamentos(userId);
        totalPages = Math.ceil(allAgendamentos.length / ITEMS_PER_PAGE);
        renderAgendamentos();
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        showError('Falha ao carregar agendamentos. Tente novamente.');
    } finally {
        showLoading(false);
    }
}

function renderAgendamentos(filteredData = allAgendamentos) {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    
    const listContainer = document.getElementById('agendamentos-list');
    listContainer.innerHTML = '';

    if (paginatedData.length === 0) {
        document.getElementById('no-results').style.display = 'block';
        return;
    }

    document.getElementById('no-results').style.display = 'none';

    paginatedData.forEach(agendamento => {
        const card = document.createElement('div');
        card.className = `agendamento-card ${agendamento.status}`;
        card.innerHTML = `
            <div class="card-header">
                <h3>${agendamento.servico}</h3>
                <span class="status-badge">${formatStatus(agendamento.status)}</span>
            </div>
            <div class="card-body">
                <p><i class="fas fa-calendar-alt"></i> ${formatDate(agendamento.data)}</p>
                <p><i class="fas fa-clock"></i> ${agendamento.hora}</p>
                <p><i class="fas fa-user-tie"></i> ${agendamento.barbeiro_nome}</p>
            </div>
            <div class="card-footer">
                ${agendamento.status === 'confirmado' ? 
                    `<button class="btn-cancelar" data-id="${agendamento.agendamento_id}">Cancelar</button>` : ''}
            </div>
        `;
        listContainer.appendChild(card);
    });

    // Adiciona eventos aos botões de cancelamento
    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', handleCancel);
    });

    updatePaginationControls(filteredData.length);
}

async function handleCancel(e) {
    const agendamentoId = e.target.dataset.id;
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
        await cancelarAgendamento(agendamentoId);
        await loadAgendamentos(getCurrentUser().user_id);
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        alert('Falha ao cancelar agendamento: ' + error.message);
    }
}

// Funções auxiliares
function formatDate(dateString) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function formatStatus(status) {
    const statusMap = {
        'confirmado': 'Confirmado',
        'cancelado': 'Cancelado',
        'concluido': 'Concluído'
    };
    return statusMap[status] || status;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const listContainer = document.getElementById('agendamentos-list');
    listContainer.innerHTML = `<div class="error-message">${message}</div>`;
}