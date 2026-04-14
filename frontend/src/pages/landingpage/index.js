  import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import useSettings from "../../hooks/useSettings";
import heroVideo from "../../assets/video1.mp4";
import logoImage from "../../assets/logolp.png";
import backgroundImage from "../../assets/fundolp.png";
import LandingFooter from "./Footer";

export default function LandingPage() {
  const history = useHistory();

  const videoRef = useRef(null);

  const { getPlanList } = usePlans();
  const { getPublicSetting } = useSettings();
  const [plans, setPlans] = useState([]);
  const [appName, setAppName] = useState("Atend Zappy");
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const [hasTestedPlatform, setHasTestedPlatform] = useState(false);

  const handlePlayVideo = () => {
    setShowVideoOverlay(false);
    setHasTestedPlatform(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoPlay = () => {
    setShowVideoOverlay(false);
    setHasTestedPlatform(true);
  };

  const features = [
    { icon: "ai", title: "Super IA", desc: "Inteligência artificial avançada que entende contexto e responde como humano" },
    { icon: "kanban", title: "Kanban", desc: "Gerencie seus leads e atendimentos em quadros visuais" },
    { icon: "users", title: "Multi Atendimento", desc: "Vários atendentes no mesmo WhatsApp simultaneamente" },
    { icon: "bot", title: "Chatbot Inteligente", desc: "Fluxos automatizados com respostas personalizadas", slug: "chatbot-inteligente" },
    { icon: "chart", title: "Relatórios", desc: "Métricas e dashboards em tempo real" },
    { icon: "transfer", title: "Fluxos Omnichannel", desc: "Transfira chats entre setores e canais com regras inteligentes", slug: "fluxos-omnichannel" },
    { icon: "phone", title: "Múltiplos Números", desc: "Gerencie vários WhatsApp no mesmo painel" },
    { icon: "folder", title: "Setorização", desc: "Organize atendimentos por departamentos" },
    { icon: "megaphone", title: "Campanhas com IA", desc: "Dispare mensagens com textos otimizados automaticamente", slug: "campanhas-com-ia" },
    { icon: "tag", title: "Tags e Etiquetas", desc: "Organize contatos com tags personalizadas" },
    { icon: "clock", title: "Agendamentos", desc: "Agende mensagens e lembretes automáticos" },
    { icon: "api", title: "API & Webhooks", desc: "Integre com qualquer sistema via API REST", slug: "api-e-webhooks" },
  ];

  const FeatureIcon = ({ name }) => {
    const iconColor = "#32a3ff";
    const icons = {
      ai: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
          <circle cx="8" cy="14" r="1" fill={iconColor}/>
          <circle cx="16" cy="14" r="1" fill={iconColor}/>
          <path d="M9 18h6"/>
        </svg>
      ),
      kanban: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M8 7v7"/>
          <path d="M12 7v4"/>
          <path d="M16 7v10"/>
        </svg>
      ),
      users: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      bot: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8"/>
          <rect x="4" y="8" width="16" height="12" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M9 13v2"/>
          <path d="M15 13v2"/>
        </svg>
      ),
      chart: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9"/>
          <path d="M13 17V5"/>
          <path d="M8 17v-3"/>
        </svg>
      ),
      transfer: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <path d="M7 23l-4-4 4-4"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      ),
      phone: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2"/>
          <path d="M12 18h.01"/>
        </svg>
      ),
      folder: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
      ),
      megaphone: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 11 18-5v12L3 13v-2z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      ),
      tag: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
          <path d="M7 7h.01"/>
        </svg>
      ),
      clock: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      api: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l6-6-6-6"/>
          <path d="M12 19h8"/>
        </svg>
      ),
    };
    return icons[name] || null;
  };

  const integrations = [
    { icon: "whatsapp", name: "WhatsApp", color: "#32a3ff" },
    { icon: "facebook", name: "Facebook", color: "#1877F2" },
    { icon: "instagram", name: "Instagram", color: "#E4405F" },
    { icon: "google_calendar", name: "Google Agenda", color: "#34A853" },
    { icon: "api_gateway", name: "APIs Externas", color: "#8B5CF6" },
    { icon: "webhook", name: "Webhooks", color: "#FF6B00" },
    { icon: "n8n", name: "N8N", color: "#EA4B71" },
    { icon: "typebot", name: "Typebot", color: "#0042DA" },
    { icon: "email", name: "E-mail Marketing", color: "#1A73E8" },
  ];

  const faqs = [
    {
      question: "O que é o Atend Zappy?",
      answer: "É uma plataforma completa para atendimento Omnichannel com IA, multiatendentes e automações inteligentes."
    },
    {
      question: "Posso testar antes de contratar?",
      answer: "Sim! Fale com nosso time via WhatsApp ou cadastre-se em minutos para iniciar um trial personalizado."
    },
    {
      question: "Quantos atendentes posso ter?",
      answer: "Depende do plano escolhido. Temos opções que vão de times enxutos até operações enterprise com ilimitados agentes."
    },
    {
      question: "Quais canais o sistema integra?",
      answer: "WhatsApp, Facebook, Instagram, chat web, além de webhooks e API REST para integrações customizadas."
    },
    {
      question: "Existe suporte e onboarding?",
      answer: "Claro. Oferecemos onboarding guiado, base de conhecimento, suporte humano e acompanhamento de sucesso do cliente."
    },
    {
      question: "Posso trocar de plano depois?",
      answer: "Sim, você pode evoluir para um plano mais completo ou ajustar recursos conforme o crescimento do seu negócio."
    }
  ];

  const renderIcon = (icon, color) => {
    const stroke = "#101828";
    const wrapper = (children) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="2" y="2" width="32" height="32" rx="10" fill={`${color}22`} />
        {children}
      </svg>
    );

    const icons = {
      whatsapp: wrapper(
        <>
          <path
            d="M18 11a7 7 0 0 0-6 10.6L11 27l5.5-1.4A7 7 0 1 0 18 11Z"
            stroke={stroke}
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M15.5 16.5c.5-1 1-1 1.6-.7.6.2 2 1.4 2.3 2 .3.6.3 1-.2 1.4l-.3.3c-.3.3-.3.6-.1 1 .3.3 1.4 1 2 1 .7 0 1 0 1.2-.4.2-.3.7-.9 1-.7.3.3 1.1 1 .7 2.2-.4 1.2-2.2 1.9-3.7 1.6-1.6-.3-3.4-1.6-4.5-2.7-1.1-1.2-1.9-2.7-2.1-3.5-.1-.7.3-1.2.6-1.5l.2-.2Z"
            fill={stroke}
          />
        </>
      ),
      facebook: wrapper(
        <path
          d="M20 12h3V8h-3c-2.2 0-4 1.8-4 4v3h-3v4h3v7h4v-7h3l1-4h-4v-2c0-.6.4-1 1-1Z"
          fill={stroke}
        />
      ),
      instagram: wrapper(
        <>
          <rect x="11" y="11" width="14" height="14" rx="4" stroke={stroke} strokeWidth="1.8" />
          <circle cx="18" cy="18" r="3.5" stroke={stroke} strokeWidth="1.8" />
          <circle cx="23" cy="13" r="1.2" fill={stroke} />
        </>
      ),
      google_calendar: wrapper(
        <>
          <rect x="12" y="12" width="12" height="12" rx="3" stroke={stroke} strokeWidth="1.8" />
          <path d="M12 15h12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M16 18h4v4h-4z" fill={stroke} />
          <path d="M19 10v4M17 10v4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
      api_gateway: wrapper(
        <>
          <path
            d="M18 12l6 3v6l-6 3-6-3v-6l6-3Z"
            stroke={stroke}
            strokeWidth="1.6"
            fill="none"
          />
          <path d="M18 16v3l2 1" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16 20l-2-1" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
      webhook: wrapper(
        <>
          <path
            d="M20 13h4a4 4 0 0 1 0 8h-1.5"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16 23h-4a4 4 0 0 1 0-8h1.5"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M18 11.5V25" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
      n8n: wrapper(
        <>
          <circle cx="14" cy="14" r="2.2" fill={stroke} />
          <circle cx="22" cy="14" r="2.2" fill={stroke} />
          <circle cx="14" cy="22" r="2.2" fill={stroke} />
          <circle cx="22" cy="22" r="2.2" fill={stroke} />
          <path d="M14 14h8M14 22h8M14 14v8M22 14v8" stroke={stroke} strokeWidth="1.4" />
        </>
      ),
      typebot: wrapper(
        <>
          <path
            d="M23 12H13a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h1l2 3 2-3h5a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3Z"
            stroke={stroke}
            strokeWidth="1.8"
            fill="none"
          />
          <circle cx="15" cy="17" r="1.1" fill={stroke} />
          <circle cx="21" cy="17" r="1.1" fill={stroke} />
        </>
      ),
      email: wrapper(
        <>
          <rect x="11" y="13" width="14" height="10" rx="2" stroke={stroke} strokeWidth="1.8" />
          <path d="M11 15.5l7 4 7-4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
    };

    return icons[icon] || wrapper(<circle cx="18" cy="18" r="4" fill={stroke} />);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlanList();
        if (data && data.length > 0) {
          setPlans(data);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    // Removido o alerta de beforeunload para não incomodar usuários
  }, []);

  const handlePlanClick = (plan) => {
    if (plan?.id) {
      history.push({
        pathname: "/cadastro",
        search: `?planId=${encodeURIComponent(plan.id)}`,
      });
      return;
    }
  };

  const handleFeatureClick = (feature) => {
    if (feature?.slug) {
      history.push(`/solucoes/${feature.slug}`);
    }
  };

  return (
    <>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f5f7fb;
          color: #101828;
        }

        .landing {
          min-height: 100vh;
          background: linear-gradient(180deg, #f7f9fc 0%, #eef1f6 100%);
          background-image: url(${backgroundImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          position: relative;
        }

        .landing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(245, 247, 251, 0.85);
          z-index: -1;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* HEADER */
        .header {
          padding: 20px 0;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          background: #1a1a1a;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .header-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: #ffffff;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .header-btn:hover {
          border-color: #32a3ff;
          color: #32a3ff;
        }

        /* HERO */
        .hero {
          padding: 60px 0;
          text-align: center;
          padding-top: 100px;
        }

        .hero-title {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .hero-title span {
          color: #32a3ff;
        }

        .hero-subtitle {
          font-size: 18px;
          color: rgba(15,23,42,0.7);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* VIDEO */
        .video-wrapper {
          max-width: 800px;
          margin: 0 auto 40px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .video-wrapper iframe,
        .video-wrapper video {
          width: 100%;
          aspect-ratio: 16/9;
          display: block;
          background: #000;
        }

        /* BUTTONS */
        .buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 80px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #32a3ff;
          color: #000;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #32a3ff;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: #fff;
          border: 2px solid rgba(255,255,255,0.2);
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: #32a3ff;
          color: #32a3ff;
        }

        /* SECTIONS */
        .section {
          padding: 60px 0;
        }

        .section-title {
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 40px;
        }

        .section-title span {
          color: #32a3ff;
        }

        /* FEATURES GRID */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 28px;
          }
        }

        .feature-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s;
        }

        .feature-card:hover {
          border-color: rgba(50, 163, 255, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .feature-card--link {
          cursor: pointer;
          position: relative;
        }

        .feature-card--link .feature-link {
          margin-top: 12px;
          background: transparent;
          border: none;
          color: #32a3ff;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .feature-card--link .feature-link svg {
          width: 16px;
          height: 16px;
        }

        .feature-icon {
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 56px;
          height: 56px;
          margin-left: auto;
          margin-right: auto;
          background: rgba(34, 197, 94, 0.1);
          border-radius: 12px;
        }

        .feature-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .feature-desc {
          font-size: 14px;
          color: rgba(15,23,42,0.65);
        }

        /* INTEGRATIONS */
        .integrations-grid {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .integration-item {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          padding: 20px 28px;
          text-align: center;
          transition: all 0.3s;
          min-width: 120px;
        }

        .integration-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .integration-icon {
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
        }

        .integration-name {
          font-size: 13px;
          color: rgba(15,23,42,0.85);
          font-weight: 500;
        }

        .soon-badge {
          background: rgba(15,23,42,0.06);
          color: rgba(15,23,42,0.6);
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 6px;
          display: inline-block;
        }

        .integration-item.soon {
          opacity: 0.6;
        }

        /* PLANS */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
        }

        .plan-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px 28px;
          color: #1a1a2e;
          position: relative;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .plan-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .plan-card.featured {
          border-color: #32a3ff;
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.2);
        }

        .plan-name {
          font-size: 24px;
          font-weight: 700;
          color: #32a3ff;
          margin-bottom: 12px;
        }

        .plan-description {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .plan-features {
          margin-bottom: 24px;
        }

        .plan-feature {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          margin-right: 8px;
        }

        .plan-feature.included {
          background: #e8f5e9;
          color: #32a3ff;
          border: 1px solid #c8e6c9;
        }

        .plan-feature.not-included {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
          text-decoration: line-through;
          opacity: 0.7;
        }

        .plan-feature.highlight {
          background: #e3f2fd;
          color: #32a3ff;
        }

        .plan-feature.highlight::after {
          content: " ℹ";
          font-size: 12px;
        }

        .plan-resources {
          font-size: 13px;
          color: #32a3ff;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .plan-resources::before {
          content: "› ";
        }

        .plan-price-label {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .plan-price {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 24px;
        }

        .plan-price span {
          font-size: 18px;
          font-weight: 400;
        }

        .plan-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid #1a1a2e;
          background: transparent;
          color: #1a1a2e;
        }

        .plan-btn:hover {
          background: #1a1a2e;
          color: #fff;
        }

        .plan-card.featured .plan-btn {
          background: #32a3ff;
          border-color: #32a3ff;
          color: #fff;
        }

        .plan-card.featured .plan-btn:hover {
          background: #32a3ff;
          border-color: #32a3ff;
        }

        .plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #32a3ff;
          color: #fff;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .plan-discount {
          font-size: 12px;
          color: #32a3ff;
          margin-bottom: 16px;
          font-weight: 500;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 40px 0;
          margin-top: 40px;
          background: #1a1a1a;
          color: #ffffff;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-links {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 14px;
        }

        .footer-links a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #32a3ff;
        }

        .footer-logo {
          font-size: 20px;
          font-weight: 700;
          color: #32a3ff;
        }

        .footer-social {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .social-link:hover {
          border-color: #32a3ff;
          background: rgba(34, 197, 94, 0.1);
        }

        .social-link svg {
          width: 20px;
          height: 20px;
        }

        /* WHATSAPP FLOATING BUTTON */
        .whatsapp-float {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          background: #32a3ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: #32a3ff;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .whatsapp-float:hover {
          transform: scale(1.1);
          box-shadow: #32a3ff;
        }

        .whatsapp-float svg {
          width: 32px;
          height: 32px;
          fill: #fff;
        }

        .footer-copy {
          width: 100%;
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }

        /* FAQ */
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .faq-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          padding: 20px;
          transition: transform 0.25s ease, border-color 0.25s ease;
          min-height: 180px;
        }

        .faq-card:hover {
          transform: translateY(-4px);
          border-color: rgba(50,163,255,0.3);
        }

        .faq-question {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .faq-answer {
          color: rgba(15,23,42,0.75);
          font-size: 15px;
          line-height: 1.5;
        }
      `}</style>

      <div className="landing">
        {/* HEADER */}
        <header className="header">
          <div className="container header-inner">
            <img src={logoImage} alt="Logo" className="header-logo" />
            <button className="header-btn" onClick={() => history.push("/login")}>
              Entrar
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Multi Atendimento <span>Descomplicado</span><br />no WhatsApp
            </h1>
            <p className="hero-subtitle">
              Centralize e agilize o atendimento da sua empresa com IA, chatbots e múltiplos atendentes.
            </p>

            {/* VIDEO */}
            <div className="video-wrapper">
              <video
                src={heroVideo}
                controls
                preload="metadata"
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>

            {/* BUTTONS */}
            <div className="buttons">
              <button className="btn-primary" onClick={() => window.open("https://wa.me/552433540335?text=" + encodeURIComponent(`Olá! Gostaria de saber mais sobre o ${appName}.`), "_blank")}>
                Fale Conosco
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">
              Nossas <span>Funcionalidades</span>
            </h2>
            <div className="features-grid">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`feature-card ${f.slug ? "feature-card--link" : ""}`}
                  onClick={() => handleFeatureClick(f)}
                  role={f.slug ? "button" : undefined}
                  tabIndex={f.slug ? 0 : undefined}
                  onKeyPress={(e) => {
                    if (!f.slug) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleFeatureClick(f);
                    }
                  }}
                >
                  <div className="feature-icon"><FeatureIcon name={f.icon} /></div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                  {f.slug && (
                    <button
                      type="button"
                      className="feature-link"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleFeatureClick(f);
                      }}
                    >
                      Saiba mais
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">
              <span>Integrações</span> Disponíveis
            </h2>
            <div className="integrations-grid">
              {integrations.map((int, i) => (
                <div key={i} className={`integration-item ${int.soon ? 'soon' : ''}`} style={{ borderColor: int.soon ? undefined : `${int.color}33` }}>
                  <div className="integration-icon">{renderIcon(int.icon, int.color)}</div>
                  <div className="integration-name">{int.name}</div>
                  {int.soon && <span className="soon-badge">Em breve</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANS */}
        {plans.length > 0 && (
          <section className="section">
            <div className="container">
              <h2 className="section-title">
                Nossos <span>Planos</span>
              </h2>
              <p style={{ textAlign: 'center', color: 'rgba(15,23,42,0.65)', marginBottom: '40px', marginTop: '-20px' }}>
                Descubra planos que acompanham o seu negócio e o engajamento dos seus clientes
              </p>
              <div className="plans-grid">
                {[...plans]
                  .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
                  .map((plan, i, sortedPlans) => {
                    const middleIndex = Math.floor(sortedPlans.length / 2);
                    const isFeatured = i === middleIndex;
                    return (
                      <div key={plan.id || i} className={`plan-card ${isFeatured ? 'featured' : ''}`}>
                        {isFeatured && <div className="plan-badge">Recomendado</div>}
                        <div className="plan-name">{plan.name}</div>
                        <div className="plan-description">
                          {plan.users > 0 ? `Até ${plan.users} atendentes` : 'Atendentes ilimitados'}
                        </div>
                        <div className="plan-features">
                          <span className="plan-feature included">
                            {plan.connections > 0 ? `${plan.connections} conexões` : 'Conexões ilimitadas'}
                          </span>
                          <span className="plan-feature included">
                            {plan.queues > 0 ? `${plan.queues} filas` : 'Filas ilimitadas'}
                          </span>
                          <span className={`plan-feature ${plan.useWhatsapp ? 'included' : 'not-included'}`}>
                            WhatsApp
                          </span>
                          <span className={`plan-feature ${plan.useFacebook ? 'included' : 'not-included'}`}>
                            Facebook
                          </span>
                          <span className={`plan-feature ${plan.useInstagram ? 'included' : 'not-included'}`}>
                            Instagram
                          </span>
                          <span className={`plan-feature ${plan.useOpenAi ? 'included' : 'not-included'}`}>
                            IA
                          </span>
                          <span className={`plan-feature ${plan.useKanban ? 'included' : 'not-included'}`}>
                            Kanban
                          </span>
                          <span className={`plan-feature ${plan.useCampaigns ? 'included' : 'not-included'}`}>
                            Campanhas
                          </span>
                        </div>
                        <div className="plan-resources">Recursos inclusos</div>
                        <div className="plan-price-label">Por apenas:</div>
                        <div className="plan-price">
                          R$ {plan.amount}<span>/mês</span>
                        </div>
                        <div className="plan-discount">30% de desconto contratando o plano anual</div>
                        <button className="plan-btn" onClick={() => handlePlanClick(plan)}>
                          Contratar
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">
              Perguntas <span>Frequentes</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(15,23,42,0.65)', marginBottom: '30px', marginTop: '-10px' }}>
              Tire dúvidas rápidas sobre como o {appName} potencializa o seu atendimento.
            </p>
            <div className="faq-grid">
              {faqs.map((item, index) => (
                <div key={item.question + index} className="faq-card">
                  <div className="faq-question">{item.question}</div>
                  <div className="faq-answer">{item.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingFooter appName={appName} />

      </div>

      {/* WHATSAPP FLOATING BUTTON */}
      <a 
        href="https://wa.me/552433540335" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
        title="Fale conosco no WhatsApp"
      >
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}