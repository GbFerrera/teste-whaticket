import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as ProdutoController from "../controllers/ProdutoController";
import * as ProdutoCategoriaController from "../controllers/ProdutoCategoriaController";
import * as ProdutoVariacaoController from "../controllers/ProdutoVariacaoController";

const produtoRoutes = express.Router();
const upload = multer(uploadConfig);

produtoRoutes.get("/produtos", isAuth, ProdutoController.index);
produtoRoutes.post("/produtos", isAuth, ProdutoController.store);
produtoRoutes.get("/produtos/:produtoId", isAuth, ProdutoController.show);
produtoRoutes.put("/produtos/:produtoId", isAuth, ProdutoController.update);
produtoRoutes.delete("/produtos/:produtoId", isAuth, ProdutoController.remove);

produtoRoutes.post(
  "/produtos/upload-imagem",
  isAuth,
  upload.single("file"),
  ProdutoController.uploadImagem
);

produtoRoutes.get("/produto-categorias", isAuth, ProdutoCategoriaController.index);
produtoRoutes.post("/produto-categorias", isAuth, ProdutoCategoriaController.store);
produtoRoutes.get(
  "/produto-categorias/:categoriaId",
  isAuth,
  ProdutoCategoriaController.show
);
produtoRoutes.put(
  "/produto-categorias/:categoriaId",
  isAuth,
  ProdutoCategoriaController.update
);
produtoRoutes.delete(
  "/produto-categorias/:categoriaId",
  isAuth,
  ProdutoCategoriaController.remove
);

produtoRoutes.get("/produto-variacoes", isAuth, ProdutoVariacaoController.listGrupos);
produtoRoutes.post("/produto-variacoes/grupos", isAuth, ProdutoVariacaoController.createGrupo);
produtoRoutes.put("/produto-variacoes/grupos/:grupoId", isAuth, ProdutoVariacaoController.updateGrupo);
produtoRoutes.delete(
  "/produto-variacoes/grupos/:grupoId",
  isAuth,
  ProdutoVariacaoController.deleteGrupo
);

produtoRoutes.post("/produto-variacoes/opcoes", isAuth, ProdutoVariacaoController.createOpcao);
produtoRoutes.put("/produto-variacoes/opcoes/:opcaoId", isAuth, ProdutoVariacaoController.updateOpcao);
produtoRoutes.delete(
  "/produto-variacoes/opcoes/:opcaoId",
  isAuth,
  ProdutoVariacaoController.deleteOpcao
);

export default produtoRoutes;
