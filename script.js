// URL BASE da sua API Gateway
const BASE_API_URL = "https://yr44jxv3i0.execute-api.us-east-1.amazonaws.com/register";
// O recurso específico para usuários na sua API Gateway
const USERS_RESOURCE_PATH = "/register";

document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    const messageDiv = document.getElementById('message');
    const multiUserButton = document.getElementById('multiUserButton');
    const showCountButton = document.getElementById('showCountButton');
    const userCountSpan = document.getElementById('userCountSpan'); // Referência ao span do contador

    /**
     * Atualiza a contagem de usuários exibida na tela.
     * Faz uma requisição GET para a API Gateway.
     */
    const updateUserCount = async () => {
        try {
            const response = await fetch(BASE_API_URL + USERS_RESOURCE_PATH, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Verifica se a API retorna 'userCount' ou um array para pegar o tamanho
            if (data && typeof data.userCount !== 'undefined') {
                 userCountSpan.textContent = data.userCount;
            } else if (Array.isArray(data)) {
                userCountSpan.textContent = data.length;
            } else {
                userCountSpan.textContent = 'N/A'; // Caso a resposta não seja a esperada
            }
           
        } catch (error) {
            console.error("Erro ao buscar contagem de usuários:", error);
            messageDiv.textContent = "Erro ao buscar contagem de usuários.";
            messageDiv.className = 'message error';
            userCountSpan.textContent = "Erro"; // Exibe erro no contador também
        }
    };

    // Atualiza a contagem ao carregar a página
    updateUserCount();

    // Event listener para o formulário de cadastro
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const nameInput = document.getElementById('nome');
        const addressInput = document.getElementById('endereco');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('telefone');

        try {
            const response = await fetch(BASE_API_URL + USERS_RESOURCE_PATH, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nameInput.value,
                    endereco: addressInput.value,
                    email: emailInput.value,
                    telefone: phoneInput.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao cadastrar usuário: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            messageDiv.textContent = `Usuário cadastrado com sucesso! ID: ${result.id || 'N/A'}`;
            messageDiv.className = 'message success';
            userForm.reset(); // Limpa o formulário após o cadastro
            updateUserCount(); // Atualiza a contagem após um novo cadastro

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            messageDiv.textContent = `Erro ao cadastrar usuário: ${error.message}`;
            messageDiv.className = 'message error';
        }
    });

    // Função para gerar dados de usuário para cadastro em massa
    const generateUserData = (index) => {
        const nomes = ["Pedro", "Mariana", "Lucas", "Julia", "Gabriel", "Camila", "Matheus", "Larissa", "Rafael", "Amanda", "Diego", "Carolina", "Felipe", "Isabela", "Bruno", "Beatriz", "Guilherme", "Sophia", "Leonardo", "Luiza"];
        const sobrenomes = ["Ferreira", "Cruz", "Rezende", "Santana", "Monteiro", "Moraes", "Castro", "Cunha", "Mendes", "Pinto", "Neves", "Gonçalves", "Lima e Silva", "Nogueira", "Sales", "Duarte", "Barros", "Vasconcelos", "Brandão", "Tavares"];
        const cidades = ["Porto Seguro", "Gramado", "Ouro Preto", "Bonito", "Fernando de Noronha", "Lençóis Maranhenses", "Foz do Iguaçu", "Chapada Diamantina", "Jericoacoara", "Natal", "Maceió", "João Pessoa", "Natal", "Aracaju", "São Luís"];
        const ruas = ["Rua do Comércio", "Avenida das Palmeiras", "Travessa do Bosque", "Alameda dos Anjos", "Praça da Amizade", "Beco da Saudade", "Rua Nova", "Avenida Brasil"];

        const nome = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
        const endereco = `${ruas[Math.floor(Math.random() * ruas.length)]}, ${Math.floor(Math.random() * 900) + 100} - ${cidades[Math.floor(Math.random() * cidades.length)]}`;
        const telefone = `${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 900000000) + 100000000}`; // Gera 11 dígitos
        const email = `${nome.toLowerCase().replace(/\s/g, "_").replace(/[áéíóúç]/g, match => {
            switch(match) {
                case 'á': return 'a';
                case 'é': return 'e';
                case 'í': return 'i';
                case 'ó': return 'o';
                case 'ú': return 'u';
                case 'ç': return 'c';
                default: return match;
            }
        })}${index}@example.com`;

        return { nome, endereco, telefone, email };
    };

    // Event listener para o botão "Cadastrar Vários Usuários"
    multiUserButton.addEventListener('click', async () => {
        multiUserButton.disabled = true;
        messageDiv.textContent = 'Cadastrando usuários em massa...';
        messageDiv.className = 'message info';

        let successfulCreations = 0;
        let failedCreations = 0;
        
        for(let i = 0; i < 10; i++) { // Tenta cadastrar 10 usuários
            const userData = generateUserData(i);
            try {
                const response = await fetch(BASE_API_URL + USERS_RESOURCE_PATH, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Erro ao cadastrar usuário ${i + 1}: ${errorData.message || response.statusText}`);
                }

                successfulCreations++;
            } catch (error) {
                console.error(error);
                failedCreations++;
            } finally {
                messageDiv.textContent = `Usuários cadastrados: ${successfulCreations}, Falhas: ${failedCreations}`;
            }
        }
        messageDiv.textContent = `Cadastro em massa concluído! Usuários cadastrados: ${successfulCreations}, Falhas: ${failedCreations}`;
        if (failedCreations > 0) {
            messageDiv.className = 'message warning';
        } else {
            messageDiv.className = 'message success';
        }
        multiUserButton.disabled = false;
        updateUserCount(); // Atualiza a contagem final
    });

    // Event listener para o botão "Mostrar Quantidade de Usuários"
    showCountButton.addEventListener('click', updateUserCount);
});