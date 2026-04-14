import { FlowBuilderModel } from "../../models/FlowBuilder";
import fs from "fs";
import path from "path";
import mime from "mime-types";

interface Request {
  companyId: number;
  idFlow: number;
}

interface FileInfo {
  originalName: string;
  url: string;
  fileContent: string; // base64
  mimeType: string;
}

const ExportFlowBuilderService = async ({
  companyId,
  idFlow
}: Request): Promise<any> => {
  try {
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: idFlow,
        company_id: companyId
      }
    });

    if (!flow) {
      throw new Error("Fluxo não encontrado");
    }

    const exportData = {
      name: flow.name,
      flow: flow.flow,
      files: [] as FileInfo[]
    };

    if (!flow.flow) {
      return exportData;
    }

    const fileUrls = extractFileUrls(flow.flow);

    for (const url of fileUrls) {
      try {
        const fileName = url.replace(/^uploads\//, "");
        const filePath = path.join(
          __dirname,
          "../../../public/uploads",
          fileName
        );

        if (fs.existsSync(filePath)) {
          try {
            const fileContent = fs.readFileSync(filePath, {
              encoding: "base64"
            });
            const mimeType = getMimeType(fileName);

            exportData.files.push({
              originalName: fileName,
              url: url,
              fileContent: fileContent,
              mimeType: mimeType
            });
          } catch (readError) {
            console.error(`Erro ao ler o arquivo ${fileName}:`, readError);
          }
        } else {
          console.warn(`Arquivo não encontrado: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`Erro ao processar arquivo ${url}:`, fileError);
      }
    }

    return exportData;
  } catch (error) {
    console.error("Erro ao exportar fluxo:", error);
    throw error;
  }
};

function extractFileUrls(flow: any): string[] {
  const urls: string[] = [];
  console.log("Iniciando extração de URLs...");

  if (flow && flow.nodes) {
    flow.nodes.forEach(node => {
      if (
        (node.type === "file" ||
          node.type === "img" ||
          node.type === "audio" ||
          node.type === "video") &&
        node.data.url
      ) {
        console.log(`[${node.type}] URL encontrada: ${node.data.url}`);
        urls.push(node.data.url);
      }
      else if (
        node.type === "singleBlock" &&
        node.data &&
        node.data.elements &&
        Array.isArray(node.data.elements)
      ) {
        console.log(
          `[singleBlock] Processando ${node.data.elements.length} elementos...`
        );
        node.data.elements.forEach(element => {
          if (
            (element.type === "file" ||
              element.type === "img" ||
              element.type === "audio" ||
              element.type === "video") &&
            element.value
          ) {
            const potentialUrl = `uploads/${element.value}`;
            console.log(
              `[singleBlock] Elemento tipo ${element.type}, URL construída: ${potentialUrl}`
            );
            urls.push(potentialUrl);
          }
        });
      }
    });
  }

  console.log("URLs extraídas final:", urls);
  return urls;
}

function getMimeType(fileName: string): string {
  const mimeType = mime.lookup(fileName);
  return mimeType || "application/octet-stream";
}

export default ExportFlowBuilderService;
