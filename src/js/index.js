import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import crypto from "crypto";

const dynamo = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event));

  const method = event.httpMethod;
  let path = (event.resource || "").replace(/^\/v1/, "") || "/";
  const userId = event?.requestContext?.authorizer?.claims?.sub;

  if (!userId) {
    return response(401, { error: "Usuário não autenticado" });
  }

  if (method === "POST" && path === "/agendamentos") {
    const body = JSON.parse(event.body || "{}");

    if (!body.nome || !body.telefone || !body.servico || !body.data || !body.horario) {
      return response(400, { error: "Dados obrigatórios ausentes" });
    }

    const agendamentoId = crypto.randomUUID();

    const params = {
      TableName: "Agendamentos",
      Item: {
        agendamentoId: { S: agendamentoId },
        nome: { S: body.nome },
        telefone: { S: body.telefone },
        servico: { S: body.servico },
        data: { S: body.data },
        horario: { S: body.horario },
        userId: { S: userId },
      },
    };

    try {
      await dynamo.send(new PutItemCommand(params));
      return response(201, { message: "Agendamento criado", agendamentoId });
    } catch (error) {
      console.error(error);
      return response(500, { error: "Erro ao criar agendamento" });
    }
  }

  if (method === "GET" && path === "/agendamentos") {
    const params = {
      TableName: "Agendamentos",
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    };

    try {
      const data = await dynamo.send(new ScanCommand(params));
      const items = data.Items.map((item) => unmarshall(item));
      return response(200, items);
    } catch (error) {
      console.error(error);
      return response(500, { error: "Erro ao buscar agendamentos" });
    }
  }

  if (method === "GET" && path.startsWith("/agendamentos/")) {
    const agendamentoId = event.pathParameters?.id;
    if (!agendamentoId) return response(400, { error: "ID do agendamento não informado" });

    try {
      const data = await dynamo.send(
        new GetItemCommand({
          TableName: "Agendamentos",
          Key: { agendamentoId: { S: agendamentoId } },
        })
      );

      if (!data.Item) {
        return response(404, { error: "Agendamento não encontrado" });
      }

      if (data.Item.userId.S !== userId) {
        return response(403, { error: "Acesso negado" });
      }

      const item = unmarshall(data.Item);
      return response(200, item);
    } catch (error) {
      console.error(error);
      return response(500, { error: "Erro ao buscar agendamento" });
    }
  }

  if (method === "PUT" && path.startsWith("/agendamentos/")) {
    const agendamentoId = event.pathParameters?.id;
    const body = JSON.parse(event.body || "{}");

    if (!agendamentoId) return response(400, { error: "ID do agendamento não informado" });

    try {
      const exists = await dynamo.send(
        new GetItemCommand({
          TableName: "Agendamentos",
          Key: { agendamentoId: { S: agendamentoId } },
        })
      );

      if (!exists.Item) return response(404, { error: "Agendamento não encontrado" });
      if (exists.Item.userId.S !== userId) return response(403, { error: "Acesso negado" });

      const params = {
        TableName: "Agendamentos",
        Key: { agendamentoId: { S: agendamentoId } },
        UpdateExpression:
          "SET nome = :nome, telefone = :telefone, servico = :servico, #d = :data, horario = :horario",
        ExpressionAttributeValues: {
          ":nome": { S: body.nome },
          ":telefone": { S: body.telefone },
          ":servico": { S: body.servico },
          ":data": { S: body.data },
          ":horario": { S: body.horario },
        },
        ExpressionAttributeNames: {
          "#d": "data",
        },
        ReturnValues: "UPDATED_NEW",
      };

      const result = await dynamo.send(new UpdateItemCommand(params));
      return response(200, {
        message: "Agendamento atualizado",
        updated: unmarshall(result.Attributes),
      });
    } catch (error) {
      console.error(error);
      return response(500, { error: "Erro ao atualizar agendamento" });
    }
  }

  if (method === "DELETE" && path.startsWith("/agendamentos/")) {
    const agendamentoId = event.pathParameters?.id;
    if (!agendamentoId) return response(400, { error: "ID do agendamento não informado" });

    try {
      const exists = await dynamo.send(
        new GetItemCommand({
          TableName: "Agendamentos",
          Key: { agendamentoId: { S: agendamentoId } },
        })
      );

      if (!exists.Item) return response(404, { error: "Agendamento não encontrado" });
      if (exists.Item.userId.S !== userId) return response(403, { error: "Acesso negado" });

      await dynamo.send(
        new DeleteItemCommand({
          TableName: "Agendamentos",
          Key: { agendamentoId: { S: agendamentoId } },
        })
      );
      return response(200, { message: "Agendamento excluído" });
    } catch (error) {
      console.error(error);
      return response(500, { error: "Erro ao excluir agendamento" });
    }
  }

  return response(404, { error: "Rota não encontrada" });
};

// Helper para DynamoDB → JS object
function unmarshall(item) {
  const obj = {};
  for (const key in item) {
    const value = item[key];
    if ("S" in value) obj[key] = value.S;
    else if ("N" in value) obj[key] = Number(value.N);
    else if ("BOOL" in value) obj[key] = value.BOOL;
    else obj[key] = value;
  }
  return obj;
}

// Helper para montar resposta HTTP
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify(body),
  };
}
