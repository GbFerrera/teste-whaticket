import { Request, Response } from "express";
import ListCrmClientsService from "../services/CrmClientService/ListCrmClientsService";
import CreateCrmClientService from "../services/CrmClientService/CreateCrmClientService";
import ShowCrmClientService from "../services/CrmClientService/ShowCrmClientService";
import UpdateCrmClientService from "../services/CrmClientService/UpdateCrmClientService";
import DeleteCrmClientService from "../services/CrmClientService/DeleteCrmClientService";

export const index = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const userType = (req.user as any).userType;
  const {
    searchParam,
    status,
    type,
    ownerUserId,
    pageNumber,
    limit
  } = req.query as any;

  // **PREENCHER INFORMAÇÕES DO USUÁRIO SOLICITANTE**
  const requestingUserId = Number(userId);
  const requestingUserType = userType?.toLowerCase();

  console.log("[CRM-CLIENTS] 🔍 Listando clientes:", {
    userId: requestingUserId,
    userType: requestingUserType,
    companyId,
    ownerUserId
  });

  // **AJUSTE: Seguir mesma lógica do Leads - não passar ownerUserId para admin/manager**
  let filterOwnerUserId = undefined;
  
  if (requestingUserType === "professional" || requestingUserType === "attendant") {
    // Profissional/Atendente só vê seus clientes
    filterOwnerUserId = requestingUserId;
  } else if (ownerUserId && ownerUserId !== "undefined") {
    // Admin/Manager pode filtrar por ownerUserId específico se informado
    filterOwnerUserId = Number(ownerUserId);
  }

  console.log("[CRM-CLIENTS] 📊 Filtros aplicados:", {
    requestingUserType,
    filterOwnerUserId
  });

  const result = await ListCrmClientsService({
    companyId,
    searchParam,
    status,
    type,
    ownerUserId: filterOwnerUserId,
    requestingUserId,
    requestingUserType,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  return res.json(result);
};

export const store = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;

  const client = await CreateCrmClientService({
    ...data,
    companyId,
    // **VINCULAR USUÁRIO CRIADOR COMO RESPONSÁVEL**
    createdByUserId: req.user.id
  });

  return res.status(201).json(client);
};

export const show = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { clientId } = req.params;

  const clientIdNum = Number(clientId);
  
  if (!clientId || isNaN(clientIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const client = await ShowCrmClientService({
    id: clientIdNum,
    companyId
  });

  // Transformar owners em ownerUserIds para compatibilidade com frontend
  const clientData = client.toJSON() as any;
  if (clientData.owners && Array.isArray(clientData.owners)) {
    clientData.ownerUserIds = clientData.owners.map((owner: any) => owner.id);
  }

  return res.json(clientData);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { clientId } = req.params;
  const clientData = req.body;

  const clientIdNum = Number(clientId);
  
  if (!clientId || isNaN(clientIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const client = await UpdateCrmClientService({
    id: clientIdNum,
    companyId,
    ...clientData
  });

  return res.json(client);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { clientId } = req.params;

  const clientIdNum = Number(clientId);
  
  if (!clientId || isNaN(clientIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  await DeleteCrmClientService({
    id: clientIdNum,
    companyId
  });

  return res.status(204).send();
};

export const exportClients = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clientIds } = req.body;

  console.log("📤 [EXPORT] Iniciando exportação de clientes selecionados");
  console.log("📤 [EXPORT] IDs selecionados:", clientIds);

  try {
    let clients;
    
    if (clientIds && clientIds.length > 0) {
      // Exportar apenas clientes selecionados
      const CrmClient = require("../models/CrmClient").default;
      const User = require("../models/User").default;
      
      clients = await CrmClient.findAll({
        where: {
          id: clientIds,
          companyId
        },
        include: [
          {
            model: User,
            as: "owners",
            attributes: ["id", "name", "email"],
            through: { attributes: [] }
          }
        ],
        order: [["updatedAt", "DESC"]]
      });
    } else {
      // Exportar todos (fallback)
      const result = await ListCrmClientsService({
        companyId,
        pageNumber: 1,
        limit: 10000
      });
      clients = result.clients;
    }

    console.log("📤 [EXPORT] Clientes encontrados:", clients.length);

    // **GERAR CSV COM TODOS OS CAMPOS**
    const csvHeaders = [
      'ID',
      'Nome',
      'Nome da Empresa',
      'Tipo',
      'Documento',
      'E-mail',
      'Telefone',
      'Endereço',
      'Número',
      'Bairro',
      'Cidade',
      'Estado',
      'CEP',
      'Status',
      'ID do Responsável',
      'Nome do Responsável',
      'Data de Cadastro',
      'Última Atualização',
      'Notas'
    ];

    const csvRows = clients.map(client => [
      client.id || '',
      `"${(client.name || '').replace(/"/g, '""')}"`,
      `"${(client.companyName || '').replace(/"/g, '""')}"`,
      client.type || '',
      `"${(client.document || '').replace(/"/g, '""')}"`,
      `"${(client.email || '').replace(/"/g, '""')}"`,
      `"${(client.phone || '').replace(/"/g, '""')}"`,
      `"${(client.address || '').replace(/"/g, '""')}"`,
      `"${(client.number || '').replace(/"/g, '""')}"`,
      `"${(client.neighborhood || '').replace(/"/g, '""')}"`,
      `"${(client.city || '').replace(/"/g, '""')}"`,
      `"${(client.state || '').replace(/"/g, '""')}"`,
      `"${(client.zipCode || '').replace(/"/g, '""')}"`,
      '',
      client.status || '',
      client.ownerUserId || '',
      `"${(client.owner?.name || '').replace(/"/g, '""')}"`,
      client.createdAt ? new Date(client.createdAt).toISOString().split('T')[0] : '',
      client.updatedAt ? new Date(client.updatedAt).toISOString().split('T')[0] : '',
      `"${(client.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    console.log("📤 [EXPORT] CSV gerado com sucesso, tamanho:", csvContent.length);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="clients_export_${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log("📤 [EXPORT] Enviando resposta CSV...");
    return res.send(csvContent);
  } catch (err) {
    console.error("📤 [EXPORT] Erro ao exportar clientes:", err);
    return res.status(500).json({ error: "Erro ao exportar clientes", details: err.message });
  }
};

export const importClients = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { previewOnly = false, selectedItems = [] } = req.body;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const multer = require('multer');
    const csv = require('csv-parser');
    const fs = require('fs');
    const path = require('path');

    const results = [];
    const filePath = req.file.path;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            // **VALIDAÇÃO E PRÉ-VISUALIZAÇÃO**
            if (previewOnly || selectedItems.length > 0) {
              const validatedData = [];
              
              for (let i = 0; i < results.length; i++) {
                const row = results[i];
                let error = null;
                
                try {
                  // Validações básicas
                  if (!row['Nome'] && !row['nome']) {
                    error = "Nome é obrigatório";
                  } else if (!row['E-mail'] && !row['email'] && !row['Telefone'] && !row['telefone']) {
                    error = "E-mail ou Telefone é obrigatório";
                  } else {
                    // Validar formato de e-mail se fornecido
                    const email = row['E-mail'] || row['email'];
                    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                      error = "E-mail inválido";
                    }
                    
                    // Validar telefone se fornecido
                    const phone = row['Telefone'] || row['telefone'];
                    if (phone && phone.length < 8) {
                      error = "Telefone muito curto";
                    }

                    // Validar tipo
                    const type = row['Tipo'] || row['tipo'] || 'person';
                    if (!['person', 'pf', 'pj'].includes(type.toLowerCase())) {
                      error = "Tipo deve ser 'PF' ou 'PJ'";
                    }

                    // Validar documento se fornecido
                    const document = row['Documento'] || row['documento'];
                    if (document && document.length < 8) {
                      error = "Documento muito curto";
                    }
                  }
                } catch (validationError) {
                  error = validationError.message;
                }

                const clientData = {
                  index: i,
                  name: row['Nome'] || row['nome'] || '',
                  companyName: row['Nome da Empresa'] || row['nome_empresa'] || '',
                  type: row['Tipo'] || row['tipo'] || 'person',
                  document: row['Documento'] || row['documento'] || '',
                  email: row['E-mail'] || row['email'] || '',
                  phone: row['Telefone'] || row['telefone'] || '',
                  address: row['Endereço'] || row['endereco'] || '',
                  number: row['Número'] || row['numero'] || '',
                  neighborhood: row['Bairro'] || row['bairro'] || '',
                  city: row['Cidade'] || row['cidade'] || '',
                  state: row['Estado'] || row['estado'] || '',
                  zipCode: row['CEP'] || row['cep'] || '',
                  status: row['Status'] || row['status'] || 'active',
                  ownerUserId: row['ID do Responsável'] || row['id_responsavel'] ? parseInt(row['ID do Responsável'] || row['id_responsavel']) : null,
                  notes: row['Notas'] || row['notas'] || '',
                  error
                };

                validatedData.push(clientData);
              }

              // Limpar arquivo temporário
              fs.unlinkSync(filePath);

              return resolve(res.json({
                preview: true,
                data: validatedData,
                total: results.length,
                valid: validatedData.filter(item => !item.error).length,
                errors: validatedData.filter(item => item.error).length
              }));
            }

            // **IMPORTAÇÃO REAL (se não for preview)**
            let imported = 0;
            let errors = [];

            // Processar apenas itens selecionados
            const itemsToProcess = selectedItems.length > 0 ? 
              selectedItems.map(index => results[index]) : 
              results;

            for (const row of itemsToProcess) {
              try {
                const clientData = {
                  companyId,
                  name: row['Nome'] || row['nome'] || '',
                  companyName: row['Nome da Empresa'] || row['nome_empresa'] || '',
                  type: row['Tipo'] || row['tipo'] || 'person',
                  document: row['Documento'] || row['documento'] || '',
                  email: row['E-mail'] || row['email'] || '',
                  phone: row['Telefone'] || row['telefone'] || '',
                  address: row['Endereço'] || row['endereco'] || '',
                  number: row['Número'] || row['numero'] || '',
                  neighborhood: row['Bairro'] || row['bairro'] || '',
                  city: row['Cidade'] || row['cidade'] || '',
                  state: row['Estado'] || row['estado'] || '',
                  zipCode: row['CEP'] || row['cep'] || '',
                  status: row['Status'] || row['status'] || 'active',
                  ownerUserId: row['ID do Responsável'] || row['id_responsavel'] ? parseInt(row['ID do Responsável'] || row['id_responsavel']) : null,
                  notes: row['Notas'] || row['notas'] || '',
                  createdByUserId: Number(userId)
                };

                await CreateCrmClientService(clientData);
                imported++;
              } catch (error) {
                console.error(`Erro ao importar cliente ${row['Nome']}:`, error);
                errors.push({
                  row: row['Nome'] || 'Desconhecido',
                  error: error.message
                });
              }
            }

            // Limpar arquivo temporário
            fs.unlinkSync(filePath);

            return resolve(res.json({
              message: "Importação concluída",
              total: itemsToProcess.length,
              imported,
              errors: errors.length,
              errorDetails: errors
            }));
          } catch (error) {
            fs.unlinkSync(filePath);
            return reject(res.status(500).json({ error: "Erro ao processar arquivo" }));
          }
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          return reject(res.status(500).json({ error: "Erro ao ler arquivo CSV" }));
        });
    });
  } catch (err) {
    console.error("Erro ao importar clientes:", err);
    return res.status(500).json({ error: "Erro ao importar clientes" });
  }
};

export default {
  index,
  store,
  show,
  update,
  delete: remove,
  exportClients,
  importClients
};
