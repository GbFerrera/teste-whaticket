import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box, LinearProgress, Chip } from "@mui/material";
import { Groups, SaveAlt, TrendingUp, TrendingDown, Dashboard as DashboardIcon, Loop as LoopIcon, Event as EventIcon } from "@mui/icons-material";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import SendIcon from '@material-ui/icons/Send';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import * as XLSX from 'xlsx';
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import TabPanel from "../../components/TabPanel";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import Chart from "react-apexcharts";
import { listTutorialVideos, getVideoThumbnailFallback } from "../../services/tutorialVideoService";
import Grid from '@mui/material/Grid';
import useDashboard from "../../hooks/useDashboard";
import VideoModal from "../../components/VideoModal";
import CrmModal from "../../components/CrmModal";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import ChatsUser from "./ChartsUser";
import { listSliderBanners } from "../../services/sliderHomeService";
import ChartDonut from "./ChartDonut";
import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { Avatar, Button, Card, CardContent, Container, Stack, Tab, Tabs } from "@mui/material";
import { i18n } from "../../translate/i18n";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import ForbiddenPage from "../../components/ForbiddenPage";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import { getBackendUrl } from "../../config";
import api from "../../services/api";
import { useHistory } from "react-router-dom";
import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
  // Container principal
  container: {
    padding: theme.spacing(4),
    width: "100%",
    margin: 0,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  
  // Header da página
  pageHeader: {
    marginBottom: theme.spacing(4),
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: theme.spacing(0.5),
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#6b7280",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: "#9ca3af",
    fontSize: "14px",
    "& span": {
      color: "#3b82f6",
    },
  },
  
  // Slider de Banners
  bannerSlider: {
    width: "100%",
    height: "320px",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: theme.spacing(4),
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 3,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    "&:hover": {
      background: "#ffffff",
      transform: "translateY(-50%) scale(1.1)",
    },
  },
  bannerArrowLeft: {
    left: theme.spacing(2),
  },
  bannerArrowRight: {
    right: theme.spacing(2),
  },
  bannerDots: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: theme.spacing(1),
    zIndex: 3,
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&.active": {
      backgroundColor: "#fff",
      transform: "scale(1.2)",
    },
  },
  
  // Cards de Indicadores
  indicatorCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
    height: "100%",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
    },
  },
  indicatorLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: theme.spacing(1),
  },
  indicatorValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: theme.spacing(1),
  },
  indicatorTrend: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "13px",
  },
  trendUp: {
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  trendDown: {
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  trendNeutral: {
    color: "#6b7280",
  },
  
  // Gráficos
  chartCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f1f5f9",
    height: "100%",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a1a2e",
  },
  chartSubtitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginTop: theme.spacing(0.5),
  },
  chartBadge: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: "13px",
    fontWeight: 500,
  },
  badgeUp: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
  },
  badgeDown: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
  },
  
  // Tags Card
  tagsCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f1f5f9",
    height: "100%",
  },
  tagsTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a1a2e",
    marginBottom: theme.spacing(2),
  },
  tagsProgressBar: {
    display: "flex",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: theme.spacing(3),
  },
  tagItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5, 0),
    borderBottom: "1px solid #f1f5f9",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: theme.spacing(1.5),
  },
  tagName: {
    fontSize: "14px",
    color: "#374151",
    flex: 1,
  },
  tagValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a2e",
    marginRight: theme.spacing(2),
  },
  tagPercent: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a2e",
  },
  
  // Tutoriais
  tutorialsSection: {
    marginTop: theme.spacing(4),
    background: "#ffffff",
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f1f5f9",
  },
  tutorialsTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1a1a2e",
    marginBottom: theme.spacing(3),
  },
  tutorialCard: {
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    },
  },
  tutorialThumbnail: {
    width: "100%",
    height: 160,
    objectFit: "cover",
  },
  tutorialInfo: {
    padding: theme.spacing(2),
    background: "#f8fafc",
  },
  tutorialName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a2e",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const { getPlanCompany } = usePlans();
  
  // Estados
  const [sliderBanners, setSliderBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tutorialVideos, setTutorialVideos] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [tags, setTags] = useState([]);
  const [previousTags, setPreviousTags] = useState([]);
  const [ticketsLast30Days, setTicketsLast30Days] = useState({ labels: [], tickets: [], leads: [], finished: [] });
  const [previousCounters, setPreviousCounters] = useState({});
  const [nextInvoice, setNextInvoice] = useState(null);
  const [companyPlan, setCompanyPlan] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("1Y");
  const [hoveredState, setHoveredState] = useState(null);
  
  // Hook do Dashboard
  const { find, getReport } = useDashboard();
  
  // Carregar dados
  const backendBaseUrl = useMemo(() => getBackendUrl()?.replace(/\/$/, ""), []);

  const buildBannerImageUrl = useCallback((banner) => {
    if (!banner) return "";
    const rawPath = banner.imageUrl || banner.image;
    if (!rawPath) return "";

    if (/^https?:\/\//i.test(rawPath)) {
      return rawPath;
    }

    let normalized = rawPath.replace(/\\/g, "/");
    if (normalized.startsWith("/")) {
      normalized = normalized.slice(1);
    }
    if (!normalized.startsWith("public/")) {
      normalized = `public/${normalized.replace(/^public\//, "")}`;
    }

    if (backendBaseUrl) {
      return `${backendBaseUrl}/${normalized}`;
    }

    return `/${normalized}`;
  }, [backendBaseUrl]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carregar banners
        const { data: bannersResponse } = await listSliderBanners();
        const parsedBanners = Array.isArray(bannersResponse)
          ? bannersResponse
          : bannersResponse?.sliderBanners || [];
        if (parsedBanners.length > 0) {
          const activeBanners = parsedBanners.filter(
            b => b?.status === "active" || b?.status === "ativo" || b?.isActive || b?.active
          );
          setSliderBanners(activeBanners.length > 0 ? activeBanners : parsedBanners);
        }
        
        // Carregar tutoriais
        const tutorialsData = await listTutorialVideos();
        if (tutorialsData && tutorialsData.length > 0) {
          setTutorialVideos(tutorialsData.filter(t => t.status === 'active').slice(0, 6));
        }
        
        // Carregar métricas do dashboard - Mês atual
        const dashboardData = await find({
          date_from: moment().startOf('month').format('YYYY-MM-DD'),
          date_to: moment().endOf('month').format('YYYY-MM-DD'),
        });
        
        if (dashboardData) {
          setCounters(dashboardData.counters || {});
          setAttendants(dashboardData.attendants || []);
          
          // Tags com contagem de contatos
          if (dashboardData.tagsContactsSummary) {
            setTags(dashboardData.tagsContactsSummary.slice(0, 5));
          }
        }
        
        // Carregar métricas do mês anterior para comparação
        const previousMonthData = await find({
          date_from: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
          date_to: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
        });
        
        if (previousMonthData && previousMonthData.counters) {
          setPreviousCounters(previousMonthData.counters);
          
          // Tags do mês anterior para comparação
          if (previousMonthData.tagsContactsSummary) {
            setPreviousTags(previousMonthData.tagsContactsSummary);
          }
        }
        
        // Carregar dados dos últimos 30 dias - por semana (4 períodos)
        const dayPromises = [];
        const labels = [];
        
        // Dividir em 6 períodos de 5 dias para melhor visualização
        for (let i = 5; i >= 0; i--) {
          const periodEnd = moment().subtract(i * 5, 'days').format('YYYY-MM-DD');
          const periodStart = moment().subtract((i * 5) + 4, 'days').format('YYYY-MM-DD');
          
          labels.push(moment().subtract(i * 5, 'days').format('DD/MM'));
          
          dayPromises.push(
            find({
              date_from: periodStart,
              date_to: periodEnd,
            }).catch(() => null)
          );
        }
        
        const dayResults = await Promise.all(dayPromises);
        setTicketsLast30Days({
          labels,
          tickets: dayResults.map(r => (r?.counters?.supportHappening || 0) + (r?.counters?.supportFinished || 0) + (r?.counters?.supportPending || 0)),
          leads: dayResults.map(r => r?.counters?.leads || 0),
          finished: dayResults.map(r => r?.counters?.supportFinished || 0),
        });
        
        // Carregar dados dos gráficos
        try {
          const { data: chartsResponse } = await api.get("/dashboard/charts");
          setChartData(chartsResponse);
        } catch (chartErr) {
          console.error('Erro ao carregar gráficos:', chartErr);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const loadNextInvoice = async () => {
      if (user?.profile !== "admin" || user?.companyId === 1) return;
      try {
        const { data } = await api.get("/invoices/all", {
          params: { pageNumber: 1 }
        });
        let invoicesList = [];
        if (Array.isArray(data)) {
          invoicesList = data;
        } else if (Array.isArray(data?.records)) {
          invoicesList = data.records;
        }

        const pendingInvoices = invoicesList
          .filter(inv => inv && inv.status !== "paid")
          .sort((a, b) => {
            const dateA = moment(a.dueDate || a.createdAt).valueOf();
            const dateB = moment(b.dueDate || b.createdAt).valueOf();
            return dateA - dateB;
          });

        if (pendingInvoices.length > 0) {
          setNextInvoice(pendingInvoices[0]);
        } else {
          setNextInvoice(null);
        }
      } catch (err) {
        console.error("Erro ao carregar próxima fatura:", err);
        setNextInvoice(null);
      }
    };

    loadNextInvoice();
  }, [user?.profile]);

  useEffect(() => {
    const loadCompanyPlan = async () => {
      if (user?.profile !== "admin" || user?.companyId === 1 || !user?.companyId) return;
      try {
        const planData = await getPlanCompany(undefined, user.companyId);
        if (planData) {
          const recurrence = planData?.plan?.recurrence || user?.company?.recurrence || "MENSAL";
          const recurrenceMonthsMap = {
            MENSAL: 1,
            TRIMESTRAL: 3,
            SEMESTRAL: 6,
            ANUAL: 12
          };
          const rawStart = planData?.createdAt || user?.company?.createdAt || null;
          const trialActive = planData?.plan?.trial;
          const trialDays = planData?.plan?.trialDays || 0;
          let contractStartMoment = rawStart ? moment(rawStart) : null;
          let trialEndMoment = null;

          if (trialActive && contractStartMoment) {
            trialEndMoment = moment(contractStartMoment).add(trialDays, "day");
            contractStartMoment = moment(trialEndMoment);
          }

          const monthsToAdd = recurrenceMonthsMap[recurrence] || 1;
          const contractEndMoment = contractStartMoment
            ? moment(contractStartMoment).add(monthsToAdd, "month")
            : null;

          setCompanyPlan({
            planName: planData?.plan?.name || "Plano não definido",
            startDate: contractStartMoment ? contractStartMoment.toISOString() : null,
            dueDate: contractEndMoment ? contractEndMoment.toISOString() : null,
            recurrence,
            trial: trialActive,
            trialDays,
            trialEndDate: trialEndMoment ? trialEndMoment.toISOString() : null
          });
        }
      } catch (err) {
        console.error("Erro ao carregar plano da empresa:", err);
        setCompanyPlan(null);
      }
    };

    loadCompanyPlan();
  }, [user?.profile, user?.companyId, user?.company?.dueDate, user?.company?.createdAt, user?.company?.recurrence, getPlanCompany]);
  
  // Auto-slide dos banners
  useEffect(() => {
    if (sliderBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % sliderBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setCurrentSlide(0);
    }
  }, [sliderBanners]);
  
  // Navegação do slider
  const handlePrevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? sliderBanners.length - 1 : prev - 1);
  };
  
  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % sliderBanners.length);
  };
  
  // Abrir vídeo tutorial
  const handleOpenVideo = (video) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };
  
  // Cores das tags
  const tagColors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
  
  // Calcular total de tags
  const totalTagsCount = tags.reduce((acc, tag) => acc + (tag.contactsCount || 0), 0);
  const totalPreviousTagsCount = previousTags.reduce((acc, tag) => acc + (tag.contactsCount || 0), 0);
  
  // Função para obter contagem anterior de uma tag
  const getPreviousTagCount = (tagId) => {
    const prevTag = previousTags.find(t => t.id === tagId);
    return prevTag?.contactsCount || 0;
  };
  
  // Calcular variação de uma tag
  const getTagTrend = (currentCount, previousCount) => {
    if (previousCount === 0) return { value: currentCount > 0 ? 100 : 0, isUp: currentCount > 0 };
    const diff = ((currentCount - previousCount) / previousCount) * 100;
    return { value: Math.abs(diff).toFixed(0), isUp: diff >= 0 };
  };
  
  const hasSlides = sliderBanners.length > 0;

  // Dados filtrados dos gráficos por período
  const filteredChartMonths = useMemo(() => {
    if (!chartData?.contactsByMonth) return [];
    const months = chartData.contactsByMonth;
    if (chartPeriod === "1M") return months.slice(-1);
    if (chartPeriod === "6M") return months.slice(-6);
    return months; // 1Y
  }, [chartData, chartPeriod]);

  // Configuração do gráfico de barras + linha (Contatos por mês)
  const contactsChartOptions = useMemo(() => ({
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: ["#6366f1", "#10b981"],
    dataLabels: { enabled: false },
    stroke: { width: [0, 3], curve: "smooth" },
    xaxis: {
      categories: filteredChartMonths.map(m => m.label),
      labels: { style: { colors: "#9ca3af", fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "12px" } } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { position: "bottom", horizontalAlign: "center", fontSize: "13px", markers: { radius: 12 } },
    tooltip: { theme: "light" },
  }), [filteredChartMonths]);

  const contactsChartSeries = useMemo(() => {
    const data = filteredChartMonths.map(m => m.count);
    // Calcular acumulado para a linha
    let acc = 0;
    const accumulated = data.map(v => { acc += v; return acc; });
    return [
      { name: "Novos Contatos", type: "bar", data },
      { name: "Acumulado", type: "line", data: accumulated },
    ];
  }, [filteredChartMonths]);

  // Configuração do gráfico donut (Contatos por Tag)
  const donutChartOptions = useMemo(() => {
    if (!chartData?.tagsSummary?.length) return {};
    return {
      chart: { type: "donut", fontFamily: "inherit" },
      labels: chartData.tagsSummary.map(t => t.name),
      colors: chartData.tagsSummary.map(t => t.color || "#6366f1"),
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 2, colors: ["#fff"] },
      plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Total", fontSize: "14px", fontWeight: 600, color: "#6b7280", formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } },
      tooltip: { theme: "light" },
    };
  }, [chartData]);

  const donutChartSeries = useMemo(() => {
    if (!chartData?.tagsSummary?.length) return [];
    return chartData.tagsSummary.map(t => t.count);
  }, [chartData]);

  // Nomes completos dos estados para o mapa
  const stateNames = {
    AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",DF:"Distrito Federal",
    ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",MT:"Mato Grosso",MS:"Mato Grosso do Sul",
    MG:"Minas Gerais",PA:"Pará",PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",
    RJ:"Rio de Janeiro",RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",
    RR:"Roraima",SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins"
  };

  // Função para obter contagem de contatos por estado
  const getStateCount = (stateCode) => {
    if (!chartData?.contactsByState) return 0;
    const found = chartData.contactsByState.find(s => s.state === stateCode);
    return found ? found.count : 0;
  };

  // Cor do estado baseada na quantidade de contatos
  const getStateColor = (stateCode) => {
    const count = getStateCount(stateCode);
    if (!chartData?.contactsByState?.length) return "#e2e8f0";
    const max = Math.max(...chartData.contactsByState.map(s => s.count), 1);
    const intensity = Math.min(count / max, 1);
    if (count === 0) return "#e2e8f0";
    // Gradiente de verde claro a verde escuro
    const r = Math.round(187 - intensity * 171);
    const g = Math.round(247 - intensity * 118);
    const b = Math.round(208 - intensity * 148);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Função para calcular variação percentual
  const calcTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, isUp: true };
    const diff = ((current - previous) / previous) * 100;
    return { value: Math.abs(diff).toFixed(2), isUp: diff >= 0 };
  };
  
  // Calcular tendências reais
  const leadsTrend = calcTrend(counters.leads || 0, previousCounters.leads || 0);
  const waitTimeTrend = calcTrend(counters.avgWaitTime || 0, previousCounters.avgWaitTime || 0);
  const openTrend = calcTrend(counters.supportHappening || 0, previousCounters.supportHappening || 0);
  const finishedTrend = calcTrend(counters.supportFinished || 0, previousCounters.supportFinished || 0);
  
  // Formatar tempo médio de espera
  const formatWaitTime = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    const mins = Math.round(parseFloat(minutes));
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}min`;
  };
  
  // Total de tickets dos últimos 30 dias
  const totalTickets30Days = ticketsLast30Days.tickets.reduce((a, b) => a + b, 0);
  const totalLeads30Days = ticketsLast30Days.leads.reduce((a, b) => a + b, 0);
  const totalFinished30Days = ticketsLast30Days.finished.reduce((a, b) => a + b, 0);
  
  // Total de tickets do período para comparação
  const totalTicketsCurrentMonth = counters.supportFinished || 0;
  const totalTicketsPreviousMonth = previousCounters.supportFinished || 0;
  const ticketsTrend = calcTrend(totalTicketsCurrentMonth, totalTicketsPreviousMonth);

  if (loading) {
    return (
      <div className={classes.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <Typography style={{ color: '#6b7280' }}>Carregando dashboard...</Typography>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      {/* Header da Página */}
      <div className={classes.pageHeader}>
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item>
            <Typography className={classes.pageTitle}>Painel</Typography>
            <Typography className={classes.pageSubtitle}>
              Bem-vindo, {user?.name || 'Usuário'}
            </Typography>
          </Grid>
          <Grid item>
            <div className={classes.breadcrumb}>
              Lar <span>›</span> <span>Painel</span>
            </div>
          </Grid>
        </Grid>
      </div>
      
      {/* Cards de Informações do Plano - apenas para admins de companies != 1 */}
      {user?.profile === "admin" && user?.companyId !== 1 && companyPlan && (
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          {/* Card Nome do Plano */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              onClick={() => history.push("/financeiro")}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <DashboardIcon style={{ fontSize: 20, color: "#3b82f6" }} />
                <Typography style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  Plano Atual
                </Typography>
              </Box>
              <Typography style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
                {companyPlan.planName || "Sem plano"}
              </Typography>
              {companyPlan.trial && companyPlan.trialEndDate && moment(companyPlan.trialEndDate).isAfter(moment()) && (
                <Chip
                  label="Período de teste"
                  size="small"
                  style={{ 
                    alignSelf: "flex-start", 
                    fontWeight: 600, 
                    fontSize: 10,
                    background: "#fef3c7",
                    color: "#d97706"
                  }}
                />
              )}
            </Box>
          </Grid>
          
          {/* Card Início do Contrato */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <EventIcon style={{ fontSize: 20, color: "#10b981" }} />
                <Typography style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  Início do Contrato
                </Typography>
              </Box>
              <Typography style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
                {companyPlan.startDate
                  ? moment(companyPlan.startDate).format("DD/MM/YYYY")
                  : "--/--/----"}
              </Typography>
              {companyPlan.startDate && (
                <Typography style={{ fontSize: 11, color: "#6b7280" }}>
                  {moment(companyPlan.startDate).fromNow()}
                </Typography>
              )}
            </Box>
          </Grid>
          
          {/* Card Vencimento */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <EventIcon style={{ fontSize: 20, color: "#ef4444" }} />
                <Typography style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  Vencimento
                </Typography>
              </Box>
              <Typography style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
                {companyPlan.dueDate
                  ? moment(companyPlan.dueDate).format("DD/MM/YYYY")
                  : "--/--/----"}
              </Typography>
              {companyPlan.dueDate && (
                <Typography style={{ fontSize: 11, color: moment(companyPlan.dueDate).isBefore(moment()) ? "#ef4444" : "#6b7280" }}>
                  {moment(companyPlan.dueDate).fromNow()}
                </Typography>
              )}
            </Box>
          </Grid>
          
          {/* Card Recorrência / Teste */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <LoopIcon style={{ fontSize: 20, color: "#8b5cf6" }} />
                <Typography style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  Recorrência
                </Typography>
              </Box>
              <Typography style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
                {companyPlan.recurrence === "MENSAL"
                  ? "Mensal"
                  : companyPlan.recurrence === "TRIMESTRAL"
                  ? "Trimestral"
                  : companyPlan.recurrence === "SEMESTRAL"
                  ? "Semestral"
                  : companyPlan.recurrence === "ANUAL"
                  ? "Anual"
                  : companyPlan.recurrence || "Não definida"}
              </Typography>
              {companyPlan.trial && companyPlan.trialEndDate && (
                <Typography style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>
                  Teste até {moment(companyPlan.trialEndDate).format("DD/MM/YYYY")}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
      
      {/* Slider de Banners */}
      {hasSlides && (
        <div className={classes.bannerSlider}>
          <img
            key={`banner-${currentSlide}-${sliderBanners[currentSlide]?.id || currentSlide}`}
            src={buildBannerImageUrl(sliderBanners[currentSlide])}
            alt={`Banner ${currentSlide + 1}`}
            className={classes.bannerImage}
            onError={(e) => {
              e.target.style.visibility = "hidden";
            }}
          />
          
          {sliderBanners.length > 1 && (
            <>
              <div 
                className={`${classes.bannerArrow} ${classes.bannerArrowLeft}`}
                onClick={handlePrevSlide}
              >
                <ArrowBackIosIcon style={{ fontSize: 18, marginLeft: 4 }} />
              </div>
              <div 
                className={`${classes.bannerArrow} ${classes.bannerArrowRight}`}
                onClick={handleNextSlide}
              >
                <ArrowForwardIosIcon style={{ fontSize: 18 }} />
              </div>
              
              <div className={classes.bannerDots}>
                {sliderBanners.map((_, index) => (
                  <div
                    key={index}
                    className={`${classes.bannerDot} ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Seção de Gráficos */}
      {chartData && (
        <>
          {/* Cards de Resumo */}
          <Grid container spacing={2} style={{ marginBottom: 24 }}>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.indicatorCard}>
                <Typography className={classes.indicatorLabel}>Total de Contatos</Typography>
                <Typography className={classes.indicatorValue}>
                  {(chartData.totalContacts || 0).toLocaleString("pt-BR")}
                </Typography>
                <div className={classes.indicatorTrend}>
                  <span className={classes.trendNeutral}>Base completa</span>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.indicatorCard}>
                <Typography className={classes.indicatorLabel}>Novos este mês</Typography>
                <Typography className={classes.indicatorValue}>
                  {(chartData.newContactsThisMonth || 0).toLocaleString("pt-BR")}
                </Typography>
                <div className={classes.indicatorTrend}>
                  {(() => {
                    const trend = calcTrend(chartData.newContactsThisMonth || 0, chartData.newContactsPrevMonth || 0);
                    return trend.isUp ? (
                      <span className={classes.trendUp}><ArrowUpward style={{ fontSize: 14 }} /> {trend.value}%</span>
                    ) : (
                      <span className={classes.trendDown}><ArrowDownward style={{ fontSize: 14 }} /> {trend.value}%</span>
                    );
                  })()}
                  <span className={classes.trendNeutral}> vs mês anterior</span>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.indicatorCard}>
                <Typography className={classes.indicatorLabel}>Atendimentos</Typography>
                <Typography className={classes.indicatorValue}>
                  {((counters.supportHappening || 0) + (counters.supportFinished || 0) + (counters.supportPending || 0)).toLocaleString("pt-BR")}
                </Typography>
                <div className={classes.indicatorTrend}>
                  {openTrend.isUp ? (
                    <span className={classes.trendUp}><ArrowUpward style={{ fontSize: 14 }} /> {openTrend.value}%</span>
                  ) : (
                    <span className={classes.trendDown}><ArrowDownward style={{ fontSize: 14 }} /> {openTrend.value}%</span>
                  )}
                  <span className={classes.trendNeutral}> vs mês anterior</span>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.indicatorCard}>
                <Typography className={classes.indicatorLabel}>Estados Alcançados</Typography>
                <Typography className={classes.indicatorValue}>
                  {(chartData.contactsByState?.length || 0)}
                </Typography>
                <div className={classes.indicatorTrend}>
                  <span className={classes.trendNeutral}>de 27 estados</span>
                </div>
              </div>
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3} style={{ marginBottom: 24 }}>
            {/* Gráfico de Contatos por Mês */}
            <Grid item xs={12} md={6}>
              <div className={classes.chartCard}>
                <div className={classes.chartHeader}>
                  <div>
                    <Typography className={classes.chartTitle}>Contatos</Typography>
                    <Typography className={classes.chartSubtitle}>
                      {(chartData.totalContacts || 0).toLocaleString("pt-BR")}
                    </Typography>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["1M", "6M", "1Y"].map((p) => (
                      <Button
                        key={p}
                        size="small"
                        variant={chartPeriod === p ? "contained" : "outlined"}
                        onClick={() => setChartPeriod(p)}
                        style={{
                          minWidth: 36,
                          padding: "2px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 8,
                          textTransform: "none",
                          ...(chartPeriod === p
                            ? { background: "#6366f1", color: "#fff", border: "none" }
                            : { color: "#9ca3af", borderColor: "#e5e7eb" }),
                        }}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
                {filteredChartMonths.length > 0 && (
                  <Chart
                    options={contactsChartOptions}
                    series={contactsChartSeries}
                    type="line"
                    height={280}
                  />
                )}
              </div>
            </Grid>

            {/* Gráfico Donut - Contatos por Tag */}
            <Grid item xs={12} md={3}>
              <div className={classes.chartCard}>
                <div className={classes.chartHeader}>
                  <Typography className={classes.chartTitle}>Contatos por Tag</Typography>
                </div>
                {donutChartSeries.length > 0 ? (
                  <>
                    <Chart
                      options={donutChartOptions}
                      series={donutChartSeries}
                      type="donut"
                      height={200}
                    />
                    <div style={{ marginTop: 16 }}>
                      {chartData.tagsSummary.map((tag, i) => {
                        const total = donutChartSeries.reduce((a, b) => a + b, 0);
                        const perc = total > 0 ? ((tag.count / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={tag.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < chartData.tagsSummary.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: tag.color || "#6366f1" }} />
                              <Typography style={{ fontSize: 13, color: "#374151" }}>{tag.name}</Typography>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                              <Typography style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{tag.count.toLocaleString("pt-BR")}</Typography>
                              <Typography style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{perc}%</Typography>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                    <Typography style={{ fontSize: 14 }}>Nenhuma tag com contatos</Typography>
                  </div>
                )}
              </div>
            </Grid>

            {/* Mapa do Brasil - Contatos por Estado */}
            <Grid item xs={12} md={3}>
              <div className={classes.chartCard} style={{ position: "relative" }}>
                <div className={classes.chartHeader}>
                  <Typography className={classes.chartTitle}>Contatos por Região</Typography>
                </div>
                
                {/* Tooltip do estado */}
                {hoveredState && (
                  <div style={{
                    position: "absolute", top: 50, right: 16, background: "#1a1a2e", color: "#fff",
                    padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    <div style={{ fontWeight: 600 }}>{stateNames[hoveredState] || hoveredState}</div>
                    <div style={{ color: "#93c5fd" }}>{getStateCount(hoveredState).toLocaleString("pt-BR")} contatos</div>
                  </div>
                )}

                <svg viewBox="0 0 600 560" style={{ width: "100%", height: "auto", maxHeight: 260 }}>
                  {/* Mapa simplificado do Brasil - cada estado como um retângulo posicionado */}
                  {[
                    { code: "AM", x: 100, y: 80, w: 90, h: 70 },
                    { code: "RR", x: 120, y: 10, w: 40, h: 50 },
                    { code: "AP", x: 230, y: 10, w: 40, h: 50 },
                    { code: "PA", x: 200, y: 60, w: 90, h: 70 },
                    { code: "MA", x: 300, y: 70, w: 50, h: 50 },
                    { code: "PI", x: 350, y: 90, w: 40, h: 50 },
                    { code: "CE", x: 400, y: 70, w: 45, h: 40 },
                    { code: "RN", x: 450, y: 70, w: 40, h: 30 },
                    { code: "PB", x: 450, y: 105, w: 40, h: 25 },
                    { code: "PE", x: 430, y: 135, w: 55, h: 25 },
                    { code: "AL", x: 470, y: 165, w: 30, h: 25 },
                    { code: "SE", x: 440, y: 165, w: 28, h: 25 },
                    { code: "BA", x: 360, y: 150, w: 70, h: 80 },
                    { code: "TO", x: 280, y: 140, w: 45, h: 70 },
                    { code: "AC", x: 30, y: 140, w: 55, h: 35 },
                    { code: "RO", x: 100, y: 160, w: 55, h: 45 },
                    { code: "MT", x: 165, y: 170, w: 75, h: 75 },
                    { code: "GO", x: 260, y: 220, w: 60, h: 60 },
                    { code: "DF", x: 310, y: 240, w: 20, h: 20 },
                    { code: "MG", x: 340, y: 240, w: 80, h: 60 },
                    { code: "ES", x: 430, y: 250, w: 35, h: 35 },
                    { code: "RJ", x: 400, y: 310, w: 45, h: 30 },
                    { code: "SP", x: 300, y: 310, w: 70, h: 45 },
                    { code: "MS", x: 195, y: 260, w: 55, h: 55 },
                    { code: "PR", x: 265, y: 360, w: 60, h: 40 },
                    { code: "SC", x: 290, y: 405, w: 50, h: 35 },
                    { code: "RS", x: 260, y: 445, w: 65, h: 60 },
                  ].map((s) => (
                    <g key={s.code}
                      onMouseEnter={() => setHoveredState(s.code)}
                      onMouseLeave={() => setHoveredState(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        x={s.x} y={s.y} width={s.w} height={s.h} rx={4}
                        fill={hoveredState === s.code ? "#3b82f6" : getStateColor(s.code)}
                        stroke="#fff" strokeWidth={2}
                        style={{ transition: "fill 0.2s ease" }}
                      />
                      <text
                        x={s.x + s.w / 2} y={s.y + s.h / 2 + 4}
                        textAnchor="middle" fontSize={s.w < 35 ? 8 : 10}
                        fill={hoveredState === s.code || getStateCount(s.code) > 0 ? "#fff" : "#94a3b8"}
                        fontWeight={600}
                      >
                        {s.code}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Top 5 estados */}
                {chartData.contactsByState?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {chartData.contactsByState.slice(0, 5).map((s, i) => (
                      <div key={s.state} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"][i] || "#e2e8f0" }} />
                          <Typography style={{ fontSize: 12, color: "#374151" }}>{stateNames[s.state] || s.state}</Typography>
                        </div>
                        <Typography style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>{s.count.toLocaleString("pt-BR")}</Typography>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
        </>
      )}

      {/* Seção de Tutoriais */}
      {tutorialVideos.length > 0 && (
        <div className={classes.tutorialsSection}>
          <Typography className={classes.tutorialsTitle}>Tutoriais</Typography>
          <Grid container spacing={2}>
            {tutorialVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={video.id}>
                <div 
                  className={classes.tutorialCard}
                  onClick={() => handleOpenVideo(video)}
                >
                  <img
                    src={video.thumbnailUrl || getVideoThumbnailFallback(video.videoUrl)}
                    alt={video.title}
                    className={classes.tutorialThumbnail}
                  />
                  <div className={classes.tutorialInfo}>
                    <Typography className={classes.tutorialName}>{video.title}</Typography>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
      
      {/* Modal de Vídeo */}
      <VideoModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={selectedVideo?.videoUrl}
        title={selectedVideo?.title}
      />
    </div>
  );
};

export default Dashboard;