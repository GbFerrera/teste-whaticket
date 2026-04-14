import React from "react";
import LegalPageLayout from "./LegalPageLayout";

const TermsOfService = () => {
  return (
    <LegalPageLayout
      title="Termos de Serviço"
      intro="Estas condições regulam o uso do Atend Zappy e garantem transparência entre nossa equipe e sua empresa."
    >
      <p>
        Ao acessar ou utilizar a plataforma você concorda em seguir estas condições. Se não concordar com
        qualquer item, interrompa o uso imediatamente e entre em contato para esclarecimentos.
      </p>

      <h2>1. Escopo do serviço</h2>
      <p>
        Oferecemos uma solução SaaS para gestão de atendimentos omnichannel com recursos de IA, automações e
        integrações. As funcionalidades podem variar conforme o plano contratado e poderão receber melhorias
        contínuas sem aviso prévio, mantendo sempre a compatibilidade com fluxos principais.
      </p>

      <h2>2. Credenciais e segurança</h2>
      <p>
        O cliente é responsável por manter usuários e senhas seguros. Aconselhamos ativar duplo fator quando
        disponível, revisar permissões periodicamente e notificar o suporte ao identificar acessos suspeitos.
      </p>

      <h2>3. Responsabilidade do conteúdo</h2>
      <p>
        Mensagens enviadas pelos canais conectados são de responsabilidade do contratante. O uso deve obedecer às
        políticas de cada provedor (WhatsApp, Meta, APIs) e às legislações vigentes, evitando SPAM, fraudes ou
        violações de privacidade.
      </p>

      <h2>4. Suporte e disponibilidade</h2>
      <p>
        Mantemos estrutura redundante e monitoramento 24/7. Em caso de manutenção programada avisaremos nos
        canais oficiais. O SLA segue o plano contratado e contempla suporte via tickets, chat ou WhatsApp.
      </p>

      <h2>5. Suspensão e cancelamento</h2>
      <p>
        Reservamo-nos o direito de suspender contas por inadimplência, uso abusivo ou violação de termos.
        Cancelamentos podem ser solicitados a qualquer momento e entrarão em vigor ao final do ciclo vigente.
      </p>
    </LegalPageLayout>
  );
};

export default TermsOfService;
