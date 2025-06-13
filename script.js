// URL BASE da sua API Gateway
const BASE_API_URL =
  "https://yr44jxv3i0.execute-api.us-east-1.amazonaws.com/register";

// O recurso específico para usuários na sua API Gateway
const USERS_RESOURCE_PATH = "/register";

document.addEventListener("DOMContentLoaded", () => {
  // Referências aos elementos do DOM
  const userForm = document.getElementById("userForm");
  const individualMessage = document.getElementById("individualMessage");
  const batchCreateUsersBtn = document.getElementById("batchCreateUsers");
  const batchMessage = document.getElementById("batchMessage");
  const userCountSpan = document.getElementById("userCount");
  const refreshUserCountBtn = document.getElementById("refreshUserCount");
  const progressSpan = document.getElementById("progress");

  /**
   * Atualiza a contagem de usuários exibida na tela.
   * Faz uma requisição GET para a API Gateway.
   */
  const updateUserCount = async () => {
    try {
      // Constrói a URL completa para a requisição GET
      const response = await fetch(BASE_API_URL + USERS_RESOURCE_PATH, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Verifica se a resposta da API foi bem-sucedida (status 2xx)
      if (!response.ok) {
        // Se houver um erro HTTP, lança uma exceção com o status
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Converte a resposta JSON para um objeto JavaScript
      const data = await response.json();
      // Atualiza o texto do elemento com a contagem de usuários
      userCountSpan.textContent = data.userCount;
    } catch (error) {
      // Mostra erro no console do navegador e atualiza o texto da contagem
      console.error("Erro ao buscar contagem de usuários:", error);
      userCountSpan.textContent = "Erro";
    }
  };

  // Chama a função para atualizar a contagem assim que a página é carregada
  updateUserCount();

  // Adiciona um listener ao botão de atualizar contagem para chamá-la manualmente
  refreshUserCountBtn.addEventListener("click", updateUserCount);

  /**
   * Lida com o envio do formulário de cadastro de usuário individual.
   * Faz uma requisição POST para a API Gateway.
   */
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página

    // Coleta os valores dos campos do formulário
    const nome = document.getElementById("nome").value;
    const endereco = document.getElementById("endereco").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;

    try {
      // Constrói a URL completa para a requisição POST
      const response = await fetch(BASE_API_URL + USERS_RESOURCE_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Indica que o corpo da requisição é JSON
        },
        // Converte o objeto de dados do usuário para uma string JSON
        body: JSON.stringify({ nome, endereco, telefone, email }),
      });

      if (!response.ok) {
        // Mensagem de erro do corpo da resposta
        const errorData = await response.json();
        throw new Error(
          `Erro ao cadastrar: ${errorData.message || response.statusText}`
        );
      }

      // Converte a resposta de sucesso JSON para um objeto JavaScript
      const result = await response.json();
      // Exibe mensagem de sucesso na tela
      individualMessage.textContent = `Usuário cadastrado com sucesso! ID: ${result.userId}`;
      individualMessage.className = "message success"; // Adiciona classe para estilização
      userForm.reset(); // Limpa todos os campos do formulário
      updateUserCount(); // Atualiza a contagem de usuários após o cadastro
    } catch (error) {
      // Mostra erro e exibe mensagem de erro na tela
      console.error("Erro ao cadastrar usuário individualmente:", error);
      individualMessage.textContent = `Erro ao cadastrar usuário: ${error.message}`;
      individualMessage.className = "message error"; // Adiciona classe para estilização
    }
  });

  /**
   * Gera dados de usuário fictícios para o cadastro em massa.
   */
  const generateUserData = (index) => {
    const nomes = [
      "Pedro",
      "Mariana",
      "Lucas",
      "Julia",
      "Gabriel",
      "Camila",
      "Matheus",
      "Larissa",
      "Rafael",
      "Amanda",
      "Diego",
      "Carolina",
      "Felipe",
      "Isabela",
      "Bruno",
      "Beatriz",
      "Guilherme",
      "Sophia",
      "Leonardo",
      "Luiza",
    ];
    const sobrenomes = [
      "Ferreira",
      "Cruz",
      "Rezende",
      "Santana",
      "Monteiro",
      "Moraes",
      "Castro",
      "Cunha",
      "Mendes",
      "Pinto",
      "Neves",
      "Gonçalves",
      "Lima e Silva",
      "Nogueira",
      "Sales",
      "Duarte",
      "Barros",
      "Vasconcelos",
      "Brandão",
      "Tavares",
    ];
    const cidades = [
      "Porto Seguro",
      "Gramado",
      "Ouro Preto",
      "Bonito",
      "Fernando de Noronha",
      "Lençóis Maranhenses",
      "Foz do Iguaçu",
      "Chapada Diamantina",
      "Jericoacoara",
      "Natal",
      "Maceió",
      "João Pessoa",
      "Natal",
      "Aracaju",
      "São Luís",
    ];
    const ruas = [
      "Rua do Comércio",
      "Avenida das Palmeiras",
      "Travessa do Bosque",
      "Alameda dos Anjos",
      "Praça da Amizade",
      "Beco da Saudade",
      "Rua Nova",
      "Avenida Brasil",
    ];

    const nome = `${nomes[Math.floor(Math.random() * nomes.length)]} ${
      sobrenomes[Math.floor(Math.random() * sobrenomes.length)]
    }`;
    const endereco = `${ruas[Math.floor(Math.random() * ruas.length)]}, ${
      Math.floor(Math.random() * 900) + 100
    } - ${cidades[Math.floor(Math.random() * cidades.length)]}`;
    const telefone = `(${Math.floor(Math.random() * 90) + 10}) 9${
      Math.floor(Math.random() * 9000) + 1000
    }-${Math.floor(Math.random() * 9000) + 1000}`;
    // Adiciona o 'index' para garantir emails mais únicos em cadastros em massa
    const email = `${nome
      .toLowerCase()
      .replace(/\s/g, "_")
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u")
      .replace(/ç/g, "c")}${index}@example.com`;

    return { nome, endereco, telefone, email };
  };

  /**
   * Lida com o cadastro de 1000 usuários fictícios em massa.
   * Faz requisições POST sequenciais para a API Gateway.
   */
  batchCreateUsersBtn.addEventListener("click", async () => {
    // Desabilita o botão para evitar cliques múltiplos
    batchCreateUsersBtn.disabled = true;
    batchMessage.textContent =
      "Iniciando cadastro de 1000 usuários... Por favor, aguarde.";
    batchMessage.className = "message"; // Remove classes de sucesso/erro anteriores

    let successfulCreations = 0;
    let failedCreations = 0;

    progressSpan.textContent = "0"; // Reseta o progresso visual

    for (let i = 0; i < 1000; i++) {
      const userData = generateUserData(i);
      try {
        // Constrói a URL completa para a requisição POST (cada usuário)
        const response = await fetch(BASE_API_URL + USERS_RESOURCE_PATH, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar usuário ${i + 1}: ${
              errorData.message || response.statusText
            }`
          );
        }
        successfulCreations++; // Incrementa contador de sucesso
      } catch (error) {
        console.error(`Erro ao cadastrar usuário ${i + 1}:`, error);
        failedCreations++; // Incrementa contador de falha
      } finally {
        // Sempre atualiza o progresso, independente de sucesso/falha
        progressSpan.textContent = `${i + 1}`;
        // Pequeno delay para não sobrecarregar a API e para melhor visualização do progresso
        await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms de delay
      }
    }

    // Exibe mensagem final após todas as tentativas
    batchMessage.textContent = `Cadastro de 1000 usuários concluído! Sucessos: ${successfulCreations}, Falhas: ${failedCreations}`;
    // Adiciona classe de sucesso se todos foram bem-sucedidos, ou erro se houve falhas
    batchMessage.className =
      successfulCreations === 1000
        ? "message success"
        : failedCreations > 0
        ? "message error"
        : "message";
    batchCreateUsersBtn.disabled = false; // Reabilita o botão
    updateUserCount(); // Atualiza a contagem final de usuários
  });
});
