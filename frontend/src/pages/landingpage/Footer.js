import React from "react";

const footerColumns = [
  {
    title: "Ideal para",
    items: [
      "Empreendedores digitais",
      "Agências e squads",
      "Times de suporte",
      "CS e Sucesso do Cliente"
    ]
  },
  {
    title: "Produtos",
    items: [
      "Chatbot inteligente",
      "Fluxos Omnichannel",
      "Campanhas com IA",
      "API & Webhooks"
    ]
  },
  {
    title: "Recursos",
    items: [
      "Central de ajuda",
      "Tutoriais em vídeo",
      "Blog",
      "Roadmap público"
    ]
  },
  {
    title: "Empresa",
    items: [
      "Sobre nós",
      "Carreiras",
      "Parceiros",
      "Contato"
    ]
  }
];

const policyLinks = [
  { label: "Termos de Serviço", href: "/termos-de-servico" },
  { label: "Política de Uso", href: "/politica-de-uso" },
  { label: "Privacidade", href: "/politica-de-privacidade" }
];

const LandingFooter = ({ appName = "Atend Zappy" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <style>{`
        .lp-footer {
          background: #f7f6ff;
          padding: 64px 32px 32px;
          margin-top: 96px;
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.08);
          position: relative;
          overflow: hidden;
        }

        .lp-footer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top, rgba(99,102,241,0.15), transparent 55%);
          z-index: 0;
        }

        .lp-footer__content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        .lp-footer__cta {
          background: linear-gradient(135deg, #6846ff, #7a7bff);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          color: #fff;
          box-shadow: 0 20px 40px rgba(95, 71, 255, 0.35);
          flex-wrap: wrap;
        }

        .lp-footer__cta h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .lp-footer__cta p {
          margin: 6px 0 0;
          font-size: 16px;
          color: rgba(255,255,255,0.85);
        }

        .lp-footer__cta button {
          background: #fff;
          color: #5f47ff;
          border: none;
          border-radius: 50px;
          padding: 12px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(255,255,255,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .lp-footer__cta button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(255,255,255,0.45);
        }

        .lp-footer__columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 32px;
          margin: 48px 0 32px;
        }

        .lp-footer__column h4 {
          color: #7f60ff;
          font-size: 16px;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .lp-footer__column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .lp-footer__column li {
          margin-bottom: 10px;
          color: #4c4f63;
          font-size: 15px;
          line-height: 1.4;
        }

        .lp-footer__policies {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 14px;
          color: #6f7390;
          border-top: 1px solid rgba(79, 70, 229, 0.12);
          border-bottom: 1px solid rgba(79, 70, 229, 0.12);
          padding: 16px 0;
          justify-content: center;
        }

        .lp-footer__policies a {
          color: inherit;
          text-decoration: none;
          font-weight: 600;
        }

        .lp-footer__bottom {
          margin-top: 24px;
          text-align: center;
          color: #8a8fb8;
          font-size: 13px;
        }

        .lp-footer__brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #6d60ff;
        }

        @media (max-width: 768px) {
          .lp-footer {
            padding: 48px 20px 24px;
          }

          .lp-footer__cta {
            flex-direction: column;
            text-align: center;
          }

          .lp-footer__cta h3 {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="lp-footer__content">
        <div className="lp-footer__cta">
          <div>
            <h3>Teste grátis por 7 dias</h3>
            <p>Conecte seu WhatsApp, equipe e fluxos com IA em minutos.</p>
          </div>
          <button type="button">Quero conhecer</button>
        </div>

        <div className="lp-footer__columns">
          {footerColumns.map((column) => (
            <div className="lp-footer__column" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lp-footer__policies">
          {policyLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="lp-footer__bottom">
          <div className="lp-footer__brand">{appName}</div>
          <div>
            {appName} © {currentYear} • Todos os direitos reservados • CNPJ 30.655.874/0001-48
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
