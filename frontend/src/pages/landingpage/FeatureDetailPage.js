import React, { useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";

import LandingFooter from "./Footer";
import logoImage from "../../assets/logolp.png";
import backgroundImage from "../../assets/fundolp.png";

const contentMap = {
  "chatbot-inteligente": {
    heroTitle: "Chatbot inteligente que fala a língua do seu cliente",
    heroHighlight: "Automação humanizada",
    heroDescription:
      "Fluxos guiados por IA que entendem contexto, personalizam respostas e coletam dados ricos sem depender 100% do time humano.",
    badges: ["IA proprietária", "Respostas naturais", "Roteamento inteligente"],
    sections: [
      {
        title: "Atenda 24h com personalidade",
        description:
          "Configure personas, tom de voz e integrações com seu CRM para que cada conversa mantenha consistência da marca.",
        bullets: [
          "Scripts condicionais com fallback humano",
          "Aprendizado contínuo com feedback dos operadores",
          "Uso de variáveis e dados externos em tempo real"
        ]
      },
      {
        title: "Construtor visual",
        description:
          "Desenhe fluxos complexos arrastando blocos, acione APIs e dispare notificações em segundos.",
        bullets: [
          "Biblioteca de blocos prontos",
          "Teste A/B integrado",
          "Logs detalhados por mensagem"
        ]
      }
    ],
    ctaLabel: "Quero meu chatbot"
  },
  "fluxos-omnichannel": {
    heroTitle: "Fluxos Omnichannel que conectam WhatsApp, Instagram e mais",
    heroHighlight: "Experiência única",
    heroDescription:
      "Orquestre jornadas em múltiplos canais mantendo histórico unificado, SLAs e indicadores em tempo real.",
    badges: ["Smart routing", "Canais ilimitados", "SLA em tempo real"],
    sections: [
      {
        title: "Regras visuais de distribuição",
        description:
          "Direcione contatos por fila, horário, idioma ou prioridade com poucos cliques.",
        bullets: [
          "Round-robin e skills-based",
          "Fallback automático em caso de indisponibilidade",
          "Alertas proativos para supervisores"
        ]
      },
      {
        title: "Visão 360° do cliente",
        description:
          "Histórico consolidado com tags, notas e interações anteriores independentemente do canal inicial.",
        bullets: [
          "Timeline única",
          "Integração com CRM externo",
          "Exportação para BI"
        ]
      }
    ],
    ctaLabel: "Mapear meus fluxos"
  },
  "campanhas-com-ia": {
    heroTitle: "Campanhas em massa com inteligência artificial",
    heroHighlight: "Conversões previsíveis",
    heroDescription:
      "Combine segmentação avançada com copy gerada por IA para nutrir, recuperar e vender em escala.",
    badges: ["Copy IA", "Segmentação dinâmica", "Reports em tempo real"],
    sections: [
      {
        title: "Criação guiada por IA",
        description:
          "Gere variantes de mensagens, teste tons de voz e personalize campos automaticamente.",
        bullets: [
          "Biblioteca de templates com métricas",
          "Preenchimento automático com dados do contato",
          "Ajuste de tom (formal, empático, direto)"
        ]
      },
      {
        title: "Disparo seguro e mensurado",
        description:
          "Defina janelas, monitore entregas e acompanhe respostas em dashboards dedicados.",
        bullets: [
          "Envio por etapas com retry",
          "Alertas de opt-out",
          "Conversão por funil e atendente"
        ]
      }
    ],
    ctaLabel: "Quero vender com IA"
  },
  "api-e-webhooks": {
    heroTitle: "API & Webhooks para integrar o Atend Zappy ao seu ecossistema",
    heroHighlight: "Plataforma aberta",
    heroDescription:
      "Conecte ERPs, CRMs, bots e data lakes com endpoints REST documentados e webhooks estáveis.",
    badges: ["REST JSON", "SDKs e exemplos", "Monitoramento"],
    sections: [
      {
        title: "API completa",
        description:
          "Crie tickets, envie mensagens, sincronize contatos e extraia métricas com segurança.",
        bullets: [
          "Autenticação por token e scoping",
          "Limites gerenciáveis e filas assíncronas",
          "Versionamento transparente"
        ]
      },
      {
        title: "Webhooks confiáveis",
        description:
          "Receba eventos em milissegundos e confirme processamento com retries automáticos.",
        bullets: [
          "Eventos de mensagens, status e faturamento",
          "Assinaturas múltiplas por rota",
          "Ferramenta de reenvio manual"
        ]
      }
    ],
    ctaLabel: "Explorar documentação"
  }
};

const FeatureDetailPage = () => {
  const history = useHistory();
  const { slug } = useParams();
  const appName = "Atend Zappy";

  const pageData = contentMap[slug];

  const breadcrumbLabel = useMemo(() => {
    if (!pageData) return "Solução";
    const match = Object.entries(contentMap).find(([key]) => key === slug);
    if (!match) return "Solução";
    const textMap = {
      "chatbot-inteligente": "Chatbot inteligente",
      "fluxos-omnichannel": "Fluxos Omnichannel",
      "campanhas-com-ia": "Campanhas com IA",
      "api-e-webhooks": "API & Webhooks"
    };
    return textMap[slug] || "Solução";
  }, [slug, pageData]);

  if (!pageData) {
    return (
      <div className="feature-detail feature-detail--notfound">
        <style>{`
          .feature-detail--notfound {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
            font-family: "Segoe UI", sans-serif;
          }
          .feature-detail--notfound button {
            padding: 10px 24px;
            border-radius: 999px;
            border: none;
            background: #5f47ff;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
        <h2>Conteúdo não encontrado</h2>
        <p>Escolha uma das soluções na página inicial.</p>
        <button type="button" onClick={() => history.push("/")}>Voltar para o início</button>
      </div>
    );
  }

  return (
    <div className="feature-detail">
      <style>{`
        .feature-detail {
          min-height: 100vh;
          background: linear-gradient(180deg, #f9f9ff 0%, #eef0ff 35%, #ffffff 100%);
          color: #0f172a;
        }

        .feature-detail__hero {
          padding: 32px 24px 80px;
          background-image: url(${backgroundImage});
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
        }

        .feature-detail__hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(12, 7, 42, 0.78);
        }

        .feature-detail__hero-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          color: #fff;
        }

        .feature-detail__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 40px;
        }

        .feature-detail__header img {
          height: 40px;
        }

        .feature-detail__header button {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.4);
          padding: 10px 20px;
          border-radius: 999px;
          color: #fff;
          cursor: pointer;
        }

        .feature-detail__breadcrumb {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          margin-bottom: 16px;
        }

        .feature-detail__breadcrumb span {
          color: #a5b4fc;
        }

        .feature-detail__title {
          font-size: 40px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .feature-detail__highlight {
          font-size: 20px;
          font-weight: 600;
          color: #c8d3ff;
          margin-bottom: 16px;
        }

        .feature-detail__description {
          font-size: 18px;
          color: rgba(255,255,255,0.85);
          max-width: 720px;
        }

        .feature-detail__badges {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .feature-detail__badge {
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 14px;
        }

        .feature-detail__sections {
          max-width: 1100px;
          margin: -80px auto 0;
          padding: 0 24px 80px;
          position: relative;
          z-index: 2;
        }

        .feature-detail__card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 30px 80px rgba(15,23,42,0.12);
          margin-bottom: 24px;
          border: 1px solid rgba(99,102,241,0.1);
        }

        .feature-detail__card h3 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #5f47ff;
        }

        .feature-detail__card p {
          color: #475467;
          margin-bottom: 16px;
        }

        .feature-detail__card ul {
          padding-left: 18px;
          color: #1d2939;
          line-height: 1.6;
        }

        .feature-detail__cta {
          margin-top: 32px;
          text-align: center;
        }

        .feature-detail__cta button {
          padding: 14px 36px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #5f47ff);
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(94, 47, 255, 0.35);
        }

        @media (max-width: 768px) {
          .feature-detail__title {
            font-size: 32px;
          }
          .feature-detail__sections {
            margin-top: -40px;
          }
          .feature-detail__card {
            padding: 24px;
          }
        }
      `}</style>

      <section className="feature-detail__hero">
        <div className="feature-detail__hero-content">
          <div className="feature-detail__header">
            <button type="button" onClick={() => history.push("/")}>Voltar</button>
            <img src={logoImage} alt="Logo" />
          </div>
          <div className="feature-detail__breadcrumb">
            Início <span>›</span> Soluções <span>›</span> {breadcrumbLabel}
          </div>
          <div className="feature-detail__highlight">{pageData.heroHighlight}</div>
          <h1 className="feature-detail__title">{pageData.heroTitle}</h1>
          <p className="feature-detail__description">{pageData.heroDescription}</p>
          <div className="feature-detail__badges">
            {pageData.badges.map((badge) => (
              <span key={badge} className="feature-detail__badge">{badge}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-detail__sections">
        {pageData.sections.map((section) => (
          <article key={section.title} className="feature-detail__card">
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}

        <div className="feature-detail__cta">
          <button type="button" onClick={() => history.push("/cadastro")}>{pageData.ctaLabel}</button>
        </div>
      </section>

      <LandingFooter appName={appName} />
    </div>
  );
};

export default FeatureDetailPage;
