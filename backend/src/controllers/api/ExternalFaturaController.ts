import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import CrmClient from "../../models/CrmClient";
import Project from "../../models/Project";
import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import triggerExternalWebhook from "../../services/ExternalWebhook/triggerExternalWebhook";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const ensureExternalAuth = (req: Request) => {
  if (!req.externalAuth) {
    throw new AppError("ERR_EXTERNAL_AUTH_REQUIRED", 401);
  }
  return req.externalAuth;
};

const serializeFatura = (fatura: FinanceiroFatura) => ({
  id: fatura.id,
  descricao: fatura.descricao,
  valor: fatura.valor,
  valorPago: fatura.valorPago,
  status: fatura.status,
  dataVencimento: fatura.dataVencimento,
  dataPagamento: fatura.dataPagamento,
  tipoReferencia: fatura.tipoReferencia,
  referenciaId: fatura.referenciaId,
  tipoRecorrencia: fatura.tipoRecorrencia,
  quantidadeCiclos: fatura.quantidadeCiclos,
  cicloAtual: fatura.cicloAtual,
  dataInicio: fatura.dataInicio,
  dataFim: fatura.dataFim,
  ativa: fatura.ativa,
  observacoes: fatura.observacoes,
  paymentProvider: fatura.paymentProvider,
  paymentLink: fatura.paymentLink,
  paymentExternalId: fatura.paymentExternalId,
  checkoutToken: fatura.checkoutToken,
  clientId: fatura.clientId,
  client: fatura.client ? {
    id: fatura.client.id,
    name: fatura.client.name,
    email: fatura.client.email,
    phone: fatura.client.phone
  } : null,
  projectId: fatura.projectId,
  project: fatura.project ? {
    id: fatura.project.id,
    name: fatura.project.name,
    status: fatura.project.status
  } : null,
  createdAt: fatura.createdAt,
  updatedAt: fatura.updatedAt
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const {
    searchParam,
    status,
    tipoRecorrencia,
    ativa,
    clientId,
    projectId,
    pageNumber = "1",
    pageSize = "20"
  } = req.query as Record<string, string>;

  const whereCondition: any = { companyId };

  if (searchParam) {
    whereCondition[Op.or] = [
      { descricao: { [Op.like]: `%${searchParam}%` } },
      { observacoes: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  if (status) {
    whereCondition.status = status;
  }

  if (tipoRecorrencia) {
    whereCondition.tipoRecorrencia = tipoRecorrencia;
  }

  if (ativa !== undefined && ativa !== "") {
    whereCondition.ativa = ativa === "true";
  }

  if (clientId) {
    whereCondition.clientId = Number(clientId);
  }

  if (projectId) {
    whereCondition.projectId = Number(projectId);
  }

  const limit = Math.min(Number(pageSize) || 20, 100);
  const offset = (Math.max(Number(pageNumber) || 1, 1) - 1) * limit;

  const { count, rows } = await FinanceiroFatura.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ],
    order: [["dataVencimento", "DESC"]],
    limit,
    offset
  });

  return res.json({
    faturas: rows.map(serializeFatura),
    count,
    hasMore: offset + rows.length < count
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { id } = req.params;

  const fatura = await FinanceiroFatura.findOne({
    where: { id: Number(id), companyId },
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      },
      {
        model: FinanceiroPagamento,
        as: "pagamentos"
      }
    ]
  });

  if (!fatura) {
    throw new AppError("ERR_FATURA_NOT_FOUND", 404);
  }

  return res.json({
    ...serializeFatura(fatura),
    pagamentos: fatura.pagamentos?.map(p => ({
      id: p.id,
      valor: p.valor,
      dataPagamento: p.dataPagamento,
      metodoPagamento: p.metodoPagamento,
      observacoes: p.observacoes
    })) || []
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const {
    clientId,
    projectId,
    descricao,
    valor,
    dataVencimento,
    tipoReferencia,
    referenciaId,
    tipoRecorrencia,
    quantidadeCiclos,
    dataInicio,
    dataFim,
    observacoes,
    ativa
  } = req.body;

  if (!clientId) {
    throw new AppError("ERR_CLIENT_ID_REQUIRED", 400);
  }

  if (!valor) {
    throw new AppError("ERR_VALOR_REQUIRED", 400);
  }

  if (!dataVencimento) {
    throw new AppError("ERR_DATA_VENCIMENTO_REQUIRED", 400);
  }

  // Verificar se cliente existe
  const client = await CrmClient.findOne({
    where: { id: clientId, companyId: externalAuth.companyId }
  });

  if (!client) {
    throw new AppError("ERR_CLIENT_NOT_FOUND", 404);
  }

  // Verificar se projeto existe (se informado)
  if (projectId) {
    const project = await Project.findOne({
      where: { id: projectId, companyId: externalAuth.companyId }
    });

    if (!project) {
      throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
    }
  }

  const fatura = await FinanceiroFatura.create({
    companyId: externalAuth.companyId,
    clientId,
    projectId: projectId || null,
    descricao: descricao || "",
    valor,
    valorPago: 0,
    status: "aberta",
    dataVencimento,
    tipoReferencia: tipoReferencia || null,
    referenciaId: referenciaId || null,
    tipoRecorrencia: tipoRecorrencia || "unica",
    quantidadeCiclos: quantidadeCiclos || null,
    cicloAtual: 1,
    dataInicio: dataInicio || new Date(),
    dataFim: dataFim || null,
    ativa: ativa !== false,
    observacoes: observacoes || null,
    checkoutToken: uuidv4()
  });

  await fatura.reload({
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "fatura.created",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      fatura: serializeFatura(fatura)
    }
  });

  return res.status(201).json(serializeFatura(fatura));
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const {
    clientId,
    projectId,
    descricao,
    valor,
    valorPago,
    status,
    dataVencimento,
    dataPagamento,
    tipoReferencia,
    referenciaId,
    tipoRecorrencia,
    quantidadeCiclos,
    cicloAtual,
    dataInicio,
    dataFim,
    ativa,
    observacoes,
    paymentProvider,
    paymentLink,
    paymentExternalId
  } = req.body;

  const fatura = await FinanceiroFatura.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!fatura) {
    throw new AppError("ERR_FATURA_NOT_FOUND", 404);
  }

  // Verificar cliente se alterado
  if (clientId !== undefined && clientId !== fatura.clientId) {
    const client = await CrmClient.findOne({
      where: { id: clientId, companyId: externalAuth.companyId }
    });
    if (!client) {
      throw new AppError("ERR_CLIENT_NOT_FOUND", 404);
    }
  }

  // Verificar projeto se alterado
  if (projectId !== undefined && projectId !== fatura.projectId) {
    if (projectId) {
      const project = await Project.findOne({
        where: { id: projectId, companyId: externalAuth.companyId }
      });
      if (!project) {
        throw new AppError("ERR_PROJECT_NOT_FOUND", 404);
      }
    }
  }

  const updateData: any = {};

  if (clientId !== undefined) updateData.clientId = clientId;
  if (projectId !== undefined) updateData.projectId = projectId;
  if (descricao !== undefined) updateData.descricao = descricao;
  if (valor !== undefined) updateData.valor = valor;
  if (valorPago !== undefined) updateData.valorPago = valorPago;
  if (status !== undefined) updateData.status = status;
  if (dataVencimento !== undefined) updateData.dataVencimento = dataVencimento;
  if (dataPagamento !== undefined) updateData.dataPagamento = dataPagamento;
  if (tipoReferencia !== undefined) updateData.tipoReferencia = tipoReferencia;
  if (referenciaId !== undefined) updateData.referenciaId = referenciaId;
  if (tipoRecorrencia !== undefined) updateData.tipoRecorrencia = tipoRecorrencia;
  if (quantidadeCiclos !== undefined) updateData.quantidadeCiclos = quantidadeCiclos;
  if (cicloAtual !== undefined) updateData.cicloAtual = cicloAtual;
  if (dataInicio !== undefined) updateData.dataInicio = dataInicio;
  if (dataFim !== undefined) updateData.dataFim = dataFim;
  if (ativa !== undefined) updateData.ativa = ativa;
  if (observacoes !== undefined) updateData.observacoes = observacoes;
  if (paymentProvider !== undefined) updateData.paymentProvider = paymentProvider;
  if (paymentLink !== undefined) updateData.paymentLink = paymentLink;
  if (paymentExternalId !== undefined) updateData.paymentExternalId = paymentExternalId;

  await fatura.update(updateData);

  await fatura.reload({
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "fatura.updated",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      fatura: serializeFatura(fatura)
    }
  });

  return res.json(serializeFatura(fatura));
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const fatura = await FinanceiroFatura.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!fatura) {
    throw new AppError("ERR_FATURA_NOT_FOUND", 404);
  }

  await fatura.destroy();

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "fatura.deleted",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      faturaId: Number(id)
    }
  });

  return res.json({ message: "Fatura removida com sucesso" });
};

export const markAsPaid = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;
  const { dataPagamento, valorPago } = req.body;

  const fatura = await FinanceiroFatura.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!fatura) {
    throw new AppError("ERR_FATURA_NOT_FOUND", 404);
  }

  await fatura.update({
    status: "paga",
    dataPagamento: dataPagamento || new Date(),
    valorPago: valorPago || fatura.valor
  });

  await fatura.reload({
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "fatura.paid",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      fatura: serializeFatura(fatura)
    }
  });

  return res.json(serializeFatura(fatura));
};

export const cancel = async (req: Request, res: Response): Promise<Response> => {
  const externalAuth = ensureExternalAuth(req);
  const { id } = req.params;

  const fatura = await FinanceiroFatura.findOne({
    where: { id: Number(id), companyId: externalAuth.companyId }
  });

  if (!fatura) {
    throw new AppError("ERR_FATURA_NOT_FOUND", 404);
  }

  await fatura.update({ status: "cancelada" });

  await fatura.reload({
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ]
  });

  await triggerExternalWebhook({
    url: externalAuth.webhookUrl,
    secret: externalAuth.webhookSecret,
    event: "fatura.cancelled",
    data: {
      apiKeyId: externalAuth.apiKeyId,
      fatura: serializeFatura(fatura)
    }
  });

  return res.json(serializeFatura(fatura));
};

export const listByProject = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { projectId } = req.params;

  const faturas = await FinanceiroFatura.findAll({
    where: { companyId, projectId: Number(projectId) },
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ],
    order: [["dataVencimento", "DESC"]]
  });

  return res.json({
    faturas: faturas.map(serializeFatura)
  });
};

export const listByClient = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = ensureExternalAuth(req);
  const { clientId } = req.params;

  const faturas = await FinanceiroFatura.findAll({
    where: { companyId, clientId: Number(clientId) },
    include: [
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "status"]
      }
    ],
    order: [["dataVencimento", "DESC"]]
  });

  return res.json({
    faturas: faturas.map(serializeFatura)
  });
};
