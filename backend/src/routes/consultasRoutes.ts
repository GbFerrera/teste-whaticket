import { Router } from "express";
import isAuth from "../middleware/isAuth";

const router = Router();

// Endpoint para proxy de consultas da API externa
router.post("/fipe", async (req, res) => {
  try {
    console.log("[PROXY] POST /fipe - Requisição recebida");
    console.log("[PROXY] Headers completos:", JSON.stringify(req.headers, null, 2));
    console.log("[PROXY] Body completo:", JSON.stringify(req.body, null, 2));
    console.log("[PROXY] Body type:", typeof req.body);
    console.log("[PROXY] Body raw:", req.body);
    console.log("[PROXY] req.body.placa:", req.body?.placa);
    console.log("[PROXY] req.body.link:", req.body?.link);
    
    const { placa, link } = req.body;
    
    console.log("[PROXY] Extraído:", { placa, link });
    console.log("[PROXY] placa type:", typeof placa);
    console.log("[PROXY] link type:", typeof link);
    console.log("[PROXY] placa value:", placa);
    console.log("[PROXY] link value:", link);
    
    // TOKEN DIRETO (substitua pelo token novo gerado em https://api.apifull.com.br/)
    const apiKey = "COLE_SEU_NOVO_TOKEN_AQUI";
    
    console.log("[PROXY] Token:", apiKey.substring(0, 30) + "...");

    if (!placa || !link) {
      console.log("[PROXY] ERRO: placa ou link undefined");
      return res.status(400).json({ 
        status: "erro",
        mensagem: "Parâmetros 'placa' e 'link' são obrigatórios"
      });
    }

    // Fazer requisição para API externa
    const requestBody = {
      placa: placa.toUpperCase(),
      link: link
    };

    console.log("[PROXY] Enviando para API externa:", requestBody);

    const response = await fetch(`https://api.apifull.com.br/api/fipe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("[PROXY] Resposta da API:", data);
    
    // Retornar resposta exata da API externa
    res.status(response.status).json(data);

  } catch (error) {
    console.error("[PROXY] Erro na requisição:", error);
    res.status(500).json({ 
      status: "erro",
      mensagem: "Erro interno no proxy de consultas",
      erro: error.message
    });
  }
});

export default router;