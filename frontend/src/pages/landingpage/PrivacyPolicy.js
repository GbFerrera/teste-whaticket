import React from "react";
import LegalPageLayout from "./LegalPageLayout";

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      intro="Explicamos como coletamos, utilizamos e protegemos informações dos usuários da plataforma."
    >
      <p>
        Valorizamos a transparência e seguimos os princípios da LGPD. Ao usar o Atend Zappy, você concorda com a
        coleta e tratamento descritos abaixo.
      </p>

      <h2>1. Dados coletados</h2>
      <p>
        Armazenamos informações essenciais para operação: dados de cadastro, logs de uso, históricos de mensagens e
        integrações conectadas. Podemos coletar métricas anônimas para aprimorar performance.
      </p>

      <h2>2. Finalidade</h2>
      <p>
        Utilizamos os dados para autenticação, suporte, faturamento, envio de comunicados importantes e evolução do
        produto. Não vendemos dados para terceiros.
      </p>

      <h2>3. Compartilhamento</h2>
      <p>
        Compartilhamos dados apenas com provedores indispensáveis (hospedagem, envio de e-mails, gateways) que
        atendem padrões de segurança equivalentes aos nossos.
      </p>

      <h2>4. Armazenamento e segurança</h2>
      <p>
        Empregamos criptografia, backups redundantes e controle de acesso baseado em função. Incidentes serão
        comunicados conforme exigido pela legislação.
      </p>

      <h2>5. Direitos do titular</h2>
      <p>
        Você pode solicitar revisão, correção, portabilidade ou exclusão de dados pelo canal de suporte. Responderemos
        dentro dos prazos legais e manteremos registros da solicitação.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
