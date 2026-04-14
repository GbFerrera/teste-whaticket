// @ts-nocheck
import ProdutoVariacaoItem from "../../../models/ProdutoVariacaoItem";
import { PreparedVariacao } from "./variacoes";

export const syncVariacoes = async (
  produtoId: number,
  variacoes: PreparedVariacao[]
): Promise<void> => {
  console.log("syncVariacoes - produtoId:", produtoId, "variacoes:", variacoes);

  await ProdutoVariacaoItem.destroy({ where: { produtoId } });

  if (!variacoes || variacoes.length === 0) {
    console.log("syncVariacoes - sem variações para criar");
    return;
  }

  const payloads = variacoes.map((item) => ({
    produtoId,
    opcaoId: item.opcaoId,
    valorOverride: item.valorOverride,
    estoqueOverride: item.estoqueOverride
  }));

  console.log("syncVariacoes - payloads para bulkCreate:", payloads);

  await ProdutoVariacaoItem.bulkCreate(payloads);
};
