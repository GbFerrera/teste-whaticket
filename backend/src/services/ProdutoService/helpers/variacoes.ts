// @ts-nocheck
import AppError from "../../../errors/AppError";
import ProdutoVariacaoOpcao from "../../../models/ProdutoVariacaoOpcao";
import ProdutoVariacaoGrupo from "../../../models/ProdutoVariacaoGrupo";

export interface VariacaoInput {
  opcaoId: number;
  valorOverride?: number | string | null;
  estoqueOverride?: number | string | null;
}

export interface PreparedVariacao {
  opcaoId: number;
  valorOverride: number | null;
  estoqueOverride: number | null;
}

const toNumberOrNull = (value: number | string | null | undefined, allowNegative = false) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new AppError("ERR_PRODUTO_VARIACAO_INVALID_VALUE", 400);
  }

  if (!allowNegative && parsed < 0) {
    throw new AppError("ERR_PRODUTO_VARIACAO_INVALID_VALUE", 400);
  }

  return parsed;
};

export const prepareVariacoes = async (
  companyId: number,
  variacoes?: VariacaoInput[]
): Promise<PreparedVariacao[]> => {
  if (!variacoes || variacoes.length === 0) {
    return [];
  }

  const sanitizedEntries: PreparedVariacao[] = [];
  const uniqueIdsSet = new Set<number>();

  variacoes.forEach((item) => {
    const opcaoId = Number(item.opcaoId);
    if (!Number.isFinite(opcaoId)) {
      return;
    }

    uniqueIdsSet.add(opcaoId);
    const valorOverride = toNumberOrNull(item.valorOverride, true);
    const estoqueOverride = toNumberOrNull(item.estoqueOverride);

    const existingIndex = sanitizedEntries.findIndex((entry) => entry.opcaoId === opcaoId);
    if (existingIndex >= 0) {
      sanitizedEntries[existingIndex] = { opcaoId, valorOverride, estoqueOverride };
    } else {
      sanitizedEntries.push({ opcaoId, valorOverride, estoqueOverride });
    }
  });

  const uniqueIds = Array.from(uniqueIdsSet);

  if (uniqueIds.length === 0) {
    return [];
  }

  const opcoes = await ProdutoVariacaoOpcao.findAll({
    where: { id: uniqueIds },
    include: [
      {
        model: ProdutoVariacaoGrupo,
        where: { companyId },
        attributes: ["id", "companyId"],
        required: true
      }
    ]
  });

  if (opcoes.length !== uniqueIds.length) {
    throw new AppError("ERR_PRODUTO_VARIACAO_OPTION_NOT_FOUND", 404);
  }

  return sanitizedEntries;
};
