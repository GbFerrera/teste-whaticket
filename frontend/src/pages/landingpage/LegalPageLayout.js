import React from "react";
import logoImage from "../../assets/logolp.png";
import LandingFooter from "./Footer";

const LegalPageLayout = ({ title, intro, children }) => {
  const appName = "Atend Zappy";

  return (
    <div className="legal-page">
      <style>{`
        .legal-page {
          min-height: 100vh;
          background: #f7f6ff;
          color: #101828;
          display: flex;
          flex-direction: column;
        }

        .legal-page__header {
          padding: 28px 20px;
          background: #ffffff;
          border-bottom: 1px solid rgba(79, 70, 229, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .legal-page__logo {
          height: 36px;
          object-fit: contain;
        }

        .legal-page__cta {
          background: transparent;
          border: 1px solid rgba(79, 70, 229, 0.25);
          color: #4f46e5;
          padding: 8px 20px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
        }

        .legal-page__content {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          flex: 1;
        }

        .legal-page__title {
          font-size: 36px;
          font-weight: 700;
          color: #1e1b4b;
          margin-bottom: 8px;
        }

        .legal-page__intro {
          font-size: 16px;
          color: #4f46e5;
          margin-bottom: 32px;
        }

        .legal-page__card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(79, 70, 229, 0.08);
        }

        .legal-page__card h2 {
          margin-top: 32px;
          font-size: 22px;
          color: #4338ca;
        }

        .legal-page__card p,
        .legal-page__card li {
          color: #475467;
          line-height: 1.7;
        }

        .legal-page__card ul {
          padding-left: 20px;
        }

        @media (max-width: 768px) {
          .legal-page__card {
            padding: 24px;
          }
          .legal-page__title {
            font-size: 28px;
          }
        }
      `}</style>

      <header className="legal-page__header">
        <img src={logoImage} alt="Logo" className="legal-page__logo" />
        <button className="legal-page__cta" onClick={() => window.history.back()}>
          Voltar
        </button>
      </header>

      <main className="legal-page__content">
        <div className="legal-page__card">
          <h1 className="legal-page__title">{title}</h1>
          {intro && <p className="legal-page__intro">{intro}</p>}
          <div>{children}</div>
        </div>
      </main>

      <LandingFooter appName={appName} />
    </div>
  );
};

export default LegalPageLayout;
