import { Request, Response } from "express";
import CreateCrmLeadService from "../services/CrmLeadService/CreateCrmLeadService";
import ListCrmLeadsService from "../services/CrmLeadService/ListCrmLeadsService";
import ShowCrmLeadService from "../services/CrmLeadService/ShowCrmLeadService";
import UpdateCrmLeadService from "../services/CrmLeadService/UpdateCrmLeadService";
import DeleteCrmLeadService from "../services/CrmLeadService/DeleteCrmLeadService";
import ConvertCrmLeadService from "../services/CrmLeadService/ConvertCrmLeadService";
import CrmLead from "../models/CrmLead";
import User from "../models/User";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const userType = (req.user as any).userType;
  const { searchParam, status, ownerUserId, pageNumber, limit } = req.query as any;

  // **PREENCHER INFORMAÇÕES DO USUÁRIO SOLICITANTE**
  const requestingUserId = Number(userId);
  const requestingUserType = userType?.toLowerCase();

  // Se for profissional, filtrar apenas leads vinculados a ele
  const isProfessional = requestingUserType === "professional" || requestingUserType === "attendant";
  const filterOwnerUserId = isProfessional ? requestingUserId : (ownerUserId && ownerUserId !== "undefined" ? Number(ownerUserId) : undefined);

  const result = await ListCrmLeadsService({
    companyId,
    searchParam,
    status,
    ownerUserId: filterOwnerUserId,
    requestingUserId,
    requestingUserType,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  return res.json(result);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;

  // Capturar UTMs da requisição (query params)
  const utmSource = req.query.utm_source as string;
  const utmMedium = req.query.utm_medium as string;
  const utmCampaign = req.query.utm_campaign as string;
  const utmTerm = req.query.utm_term as string;
  const utmContent = req.query.utm_content as string;

  // **CORREÇÃO: Não sobreescrever campos do frontend**
  let source = data.source;
  let campaign = data.campaign;
  let medium = data.medium;

  // **Apenas usa UTM se não tiver dados do frontend**
  if (!source && !campaign && (utmSource || utmMedium || utmCampaign)) {
    const utmParams = [];
    if (utmSource) utmParams.push(`source: ${utmSource}`);
    if (utmMedium) utmParams.push(`medium: ${utmMedium}`);
    if (utmCampaign) utmParams.push(`campaign: ${utmCampaign}`);
    if (utmTerm) utmParams.push(`term: ${utmTerm}`);
    if (utmContent) utmParams.push(`content: ${utmContent}`);
    
    source = `UTM: ${utmParams.join(' | ')}`;
    campaign = utmCampaign || campaign;
    medium = utmMedium || medium;
  }

  const lead = await CreateCrmLeadService({
    ...data,
    source,
    campaign,
    medium,
    companyId,
    // **VINCULAR USUÁRIO CRIADOR COMO RESPONSÁVEL**
    createdByUserId: req.user.id
  });

  return res.status(201).json(lead);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { leadId } = req.params;

  const leadIdNum = Number(leadId);
  
  if (!leadId || isNaN(leadIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const lead = await ShowCrmLeadService({
    id: leadIdNum,
    companyId
  });

  return res.json(lead);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { leadId } = req.params;
  const data = req.body;

  const leadIdNum = Number(leadId);
  
  if (!leadId || isNaN(leadIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const lead = await UpdateCrmLeadService({
    id: leadIdNum,
    companyId,
    ...data
  });

  return res.json(lead);
};

export const convert = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { leadId } = req.params;
  const { contactId, phone, primaryTicketId } = req.body;

  const leadIdNum = Number(leadId);
  
  if (!leadId || isNaN(leadIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const { lead, client } = await ConvertCrmLeadService({
    leadId: leadIdNum,
    companyId,
    contactId,
    phone,
    primaryTicketId
  });

  return res.json({ lead, client });
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { leadId } = req.params;

  const leadIdNum = Number(leadId);
  
  if (!leadId || isNaN(leadIdNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  await DeleteCrmLeadService({
    id: leadIdNum,
    companyId
  });

  return res.status(204).send();
};

export const exportLeads = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, status } = req.query as any;
  const { leadIds } = req.body || {};

  console.log("📤 [EXPORT] Iniciando exportação de leads");
  console.log("📤 [EXPORT] Dados recebidos:", { companyId, searchParam, status, leadIds });

  try {
    let leads;

    if (Array.isArray(leadIds) && leadIds.length > 0) {
      const parsedIds = leadIds
        .map((id: any) => Number(id))
        .filter((id: number) => !isNaN(id));

      console.log("📤 [EXPORT] Exportando leads selecionados:", parsedIds.length);

      leads = await CrmLead.findAll({
        where: {
          companyId,
          id: parsedIds
        },
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "name"]
          }
        ],
        order: [["updatedAt", "DESC"]]
      });
    } else {
      const result = await ListCrmLeadsService({
        companyId,
        searchParam,
        status,
        pageNumber: 1,
        limit: 10000
      });

      leads = result.leads;
    }

    console.log("📤 [EXPORT] Leads encontrados:", leads.length);

    // **GERAR CSV COM TODOS OS CAMPOS**
    const csvHeaders = [
      'ID',
      'Nome',
      'E-mail',
      'Telefone',
      'Empresa',
      'Documento',
      'Data de Nascimento',
      'Status',
      'Score',
      'Temperatura',
      'Fonte',
      'Campanha',
      'Meio',
      'ID do Responsável',
      'Nome do Responsável',
      'Data de Criação',
      'Última Atividade',
      'Notas'
    ];

    const csvRows = leads.map(lead => [
      lead.id || '',
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.companyName || '').replace(/"/g, '""')}"`,
      `"${(lead.document || '').replace(/"/g, '""')}"`,
      lead.birthDate ? new Date(lead.birthDate).toISOString().split('T')[0] : '',
      lead.status || '',
      lead.score || 0,
      lead.temperature || '',
      `"${(lead.source || '').replace(/"/g, '""')}"`,
      `"${(lead.campaign || '').replace(/"/g, '""')}"`,
      `"${(lead.medium || '').replace(/"/g, '""')}"`,
      lead.ownerUserId || '',
      `"${(lead.owner?.name || '').replace(/"/g, '""')}"`,
      lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : '',
      lead.lastActivityAt ? new Date(lead.lastActivityAt).toISOString().split('T')[0] : '',
      `"${(lead.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    console.log("📤 [EXPORT] CSV gerado com sucesso, tamanho:", csvContent.length);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log("📤 [EXPORT] Enviando resposta CSV...");
    return res.send(csvContent);
  } catch (err) {
    console.error("📤 [EXPORT] Erro ao exportar leads:", err);
    return res.status(500).json({ error: "Erro ao exportar leads", details: err.message });
  }
};

export const importLeads = async (req: Request, res: Response): Promise<Response> => {
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
                    
                    // Validar telefone se fornecido (aplicação pode ter sua própria validação)
                    const phone = row['Telefone'] || row['telefone'];
                    if (phone && phone.length < 8) {
                      error = "Telefone muito curto";
                    }
                  }
                } catch (validationError) {
                  error = validationError.message;
                }

                const leadData = {
                  index: i,
                  name: row['Nome'] || row['nome'] || '',
                  email: row['E-mail'] || row['email'] || '',
                  phone: row['Telefone'] || row['telefone'] || '',
                  companyName: row['Empresa'] || row['empresa'] || '',
                  document: row['Documento'] || row['documento'] || '',
                  birthDate: row['Data de Nascimento'] || row['data_nascimento'] ? new Date(row['Data de Nascimento'] || row['data_nascimento']) : undefined,
                  status: row['Status'] || row['status'] || 'new',
                  score: row['Score'] || row['score'] ? parseInt(row['Score'] || row['score']) : 0,
                  temperature: row['Temperatura'] || row['temperatura'] || '',
                  source: row['Fonte'] || row['fonte'] || '',
                  campaign: row['Campanha'] || row['campanha'] || '',
                  medium: row['Meio'] || row['meio'] || '',
                  ownerUserId: row['ID do Responsável'] || row['id_responsavel'] ? parseInt(row['ID do Responsável'] || row['id_responsavel']) : null,
                  notes: row['Notas'] || row['notas'] || '',
                  error
                };

                validatedData.push(leadData);
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
                const leadData = {
                  companyId,
                  name: row['Nome'] || row['nome'] || '',
                  email: row['E-mail'] || row['email'] || '',
                  phone: row['Telefone'] || row['telefone'] || '',
                  companyName: row['Empresa'] || row['empresa'] || '',
                  document: row['Documento'] || row['documento'] || '',
                  birthDate: row['Data de Nascimento'] || row['data_nascimento'] ? new Date(row['Data de Nascimento'] || row['data_nascimento']) : undefined,
                  status: row['Status'] || row['status'] || 'new',
                  score: row['Score'] || row['score'] ? parseInt(row['Score'] || row['score']) : 0,
                  temperature: row['Temperatura'] || row['temperatura'] || '',
                  source: row['Fonte'] || row['fonte'] || '',
                  campaign: row['Campanha'] || row['campanha'] || '',
                  medium: row['Meio'] || row['meio'] || '',
                  ownerUserId: row['ID do Responsável'] || row['id_responsavel'] ? parseInt(row['ID do Responsável'] || row['id_responsavel']) : null,
                  notes: row['Notas'] || row['notas'] || '',
                  createdByUserId: Number(userId)
                };

                await CreateCrmLeadService(leadData);
                imported++;
              } catch (error) {
                console.error(`Erro ao importar lead ${row['Nome']}:`, error);
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
    console.error("Erro ao importar leads:", err);
    return res.status(500).json({ error: "Erro ao importar leads" });
  }
};

export default {
  index,
  store,
  show,
  update,
  delete: remove,
  convert,
  exportLeads,
  importLeads
};
