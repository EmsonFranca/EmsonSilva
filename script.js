const API_GATEWAY_URL =
  "https://remxv8bc0b.execute-api.us-east-1.amazonaws.com/v1/add";

document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("botaoBuscar");
  botao.addEventListener("click", buscarDados);
});

async function buscarDados() {
  const entrada = document.getElementById("inputProduto");
  const saida = document.getElementById("caixaResultados");
  const erro = document.getElementById("mensagemErro");
  const carregando = document.getElementById("infoCarregando");

  if (!entrada) {
    erro.textContent = "Erro interno: Campo de busca não localizado.";
    erro.classList.remove("escondido");
    return;
  }

  const termo = entrada.value;

  saida.textContent = "";
  erro.classList.add("escondido");
  carregando.classList.remove("escondido");

  if (!termo) {
    erro.textContent = "Digite um profuto para buscar.";
    erro.classList.remove("escondido");
    carregando.classList.add("escondido");
    return;
  }

  try {
    const resposta = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buscandoProduto: termo }),
    });

    if (!resposta.ok) {
      const erroData = await resposta.json();
      throw new Error(erroData.mensagem || `Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();
    saida.textContent = formatar(dados);
  } catch (err) {
    erro.textContent = `Erro ao buscar dados: ${err.message}`;
    erro.classList.remove("escondido");
  } finally {
    carregando.classList.add("escondido");
  }
}

function formatar(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return "❌ Nenhum resultado encontrado.";
  }

  return lista
    .map((cliente) => {
      const nome = cliente.Nome || "Desconhecido";
      const cpf = cliente.CPF || "Não informado";
      const compras = Array.isArray(cliente.Compra)
        ? cliente.Compra.map((item) => `   • ${item}`).join("\n")
        : "   • Nenhuma compra registrada";
      return `🤵‍♂️ Nome: ${nome}\n🪪 CPF: ${cpf}\n🛒 Compras:\n${compras}`;
    })
    .join("\n\n");
}
