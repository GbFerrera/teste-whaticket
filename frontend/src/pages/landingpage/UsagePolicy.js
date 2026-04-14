import React from "react";
import LegalPageLayout from "./LegalPageLayout";

const UsagePolicy = () => {
  return (
    <LegalPageLayout
      title="Política de Uso"
      intro="Diretrizes para garantir um ambiente seguro e colaborativo dentro do Atend Zappy."
    >
      <p>
        Esta política orienta como utilizar a plataforma com responsabilidade, protegendo os dados da sua empresa,
        dos seus clientes e da nossa infraestrutura.
      </p>

      <h2>1. Boas práticas operacionais</h2>
      <p>
        Utilize apenas canais oficiais autorizados pelos provedores. Evite listas compradas, disparos em massa sem
        consentimento e mensagens sensíveis fora de ambientes criptografados.
      </p>

      <h2>2. Limites e automações</h2>
      <p>
        Scripts, bots e integrações devem respeitar limites de requisições e autenticação. Qualquer automação que
        impacte terceiros negativamente poderá ser suspensa até ajuste.
      </p>

      <h2>3. Conteúdo proibido</h2>
      <p>
        É vedado disseminar spam, phishing, discursos de ódio, informações ilegais ou que violem direitos
        autorais/registro de marcas. Denúncias podem resultar em suspensão imediata.
      </p>

      <h2>4. Privacidade dos usuários</h2>
      <p>
        Dados de clientes só devem ser coletados com base legal apropriada. Remova informações mediante solicitação e
        configure políticas de retenção conforme LGPD.
      </p>

      <h2>5. Consequências</h2>
      <p>
        Violações reincidentes podem acarretar limitação de recursos, bloqueio temporário ou cancelamento definitivo
        do acesso, sem prejuízo de medidas legais cabíveis.
      </p>
    </LegalPageLayout>
  );
};

export default UsagePolicy;
