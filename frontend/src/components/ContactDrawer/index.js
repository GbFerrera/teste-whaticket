import React, { useEffect, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
	Typography,
	IconButton,
	Link,
	InputLabel,
	Button,
	Paper,
	CardHeader,
	Switch,
	Tooltip,
	Box,
	Select,
	MenuItem,
	TextField,
	Chip,
	CircularProgress
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import CreateIcon from '@material-ui/icons/Create';
import formatSerializedId from '../../utils/formatSerializedId';
import { i18n } from "../../translate/i18n";
import ModalImageCors from "../ModalImageCors";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { ContactForm } from "../ContactForm";
import ContactModal from "../ContactModal";
import { ContactNotes } from "../ContactNotes";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import { TagsKanbanContainer } from "../TagsKanbanContainer";
import { TagsContainer } from "../TagsContainer";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const drawerWidth = 360;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: "#1976d2", // Cor azul
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "50px",
		justifyContent: "flex-start",
		color: "white", // Texto branco para contraste
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.inputBackground,
		flexDirection: "column",
		padding: "8px 12px 80px",
		height: "100%",
		overflowY: "scroll",
		...theme.scrollbarStyles,
		gap: 12,
	},
	contactAvatar: {
		margin: 15,
		width: 160,
		height: 160,
		borderRadius: 10,
	},
	contactHeader: {
		display: "flex",
		padding: 8,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		"& > *": {
			margin: 4,
		},
	},
	contactDetails: {
		marginTop: 8,
		padding: 8,
		display: "flex",
		flexDirection: "column",
	},
	contactExtraInfo: {
		marginTop: 4,
		padding: 6,
	},
	infoCard: {
		borderRadius: 10,
		padding: 12,
		border: "1px solid rgba(17, 27, 33, 0.08)",
		backgroundColor: "#fff",
		display: "flex",
		flexDirection: "column",
		gap: 8,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: 600,
		color: "#111b21",
		display: "flex",
		alignItems: "center",
		gap: 6,
	},
	summaryGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
		gap: 8,
	},
	summaryCard: {
		borderRadius: 12,
		border: "1px solid rgba(17, 27, 33, 0.08)",
		padding: 12,
		background: "#f8fafc",
	},
	summaryLabel: {
		fontSize: 12,
		color: "#667781",
		textTransform: "uppercase",
		letterSpacing: ".04em",
	},
	summaryValue: {
		fontSize: 16,
		fontWeight: 600,
		color: "#111b21",
	},
	tagList: {
		display: "flex",
		flexWrap: "wrap",
		gap: 6,
	},
	mediaSection: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},
	mediaCard: {
		border: "1px solid rgba(17, 27, 33, 0.08)",
		borderRadius: 12,
		padding: 12,
		background: "#fff",
	},
	mediaList: {
		display: "flex",
		flexDirection: "column",
		gap: 8,
	},
	mediaThumbs: {
		display: "flex",
		gap: 8,
		flexWrap: "wrap",
	},
	mediaThumb: {
		width: 72,
		height: 72,
		borderRadius: 8,
		border: "1px solid rgba(17,27,33,0.08)",
		objectFit: "cover",
		cursor: "pointer",
	},
	mediaLink: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		borderRadius: 8,
		border: "1px solid rgba(17,27,33,0.08)",
		padding: "8px 10px",
		gap: 8,
	},
	chipTag: {
		fontWeight: 600,
		color: "#fff",
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const classes = useStyles();

	const safeContact = contact || {};
	const [modalOpen, setModalOpen] = useState(false);
	const [blockingContact, setBlockingContact] = useState(safeContact.active);
	const getDisplayName = c => {
		if (!c || !c.name) return "Contato sem nome";
		const onlyDigits = /^\+?\d+$/.test(c.name.replace(/\s+/g, ""));
		return onlyDigits ? "Contato sem nome" : c.name;
	};
	const [openForm, setOpenForm] = useState(false);
	const { get } = useCompanySettings();
	const [hideNum, setHideNum] = useState(false);
	const { user } = useContext(AuthContext);
    const [acceptAudioMessage, setAcceptAudio] = useState(safeContact.acceptAudioMessage ?? false);
	const [queues, setQueues] = useState([]);
	const [selectedQueue, setSelectedQueue] = useState(ticket?.queueId || "");
	const [loadingQueue, setLoadingQueue] = useState(false);
	const [leadValue, setLeadValue] = useState(ticket?.leadValue ?? "");
	const [savingLeadValue, setSavingLeadValue] = useState(false);
	const [mediaLoading, setMediaLoading] = useState(false);
	const [imageMessages, setImageMessages] = useState([]);
	const [fileMessages, setFileMessages] = useState([]);
	const [linkMessages, setLinkMessages] = useState([]);

	useEffect(() => {
		async function fetchData() {
			const lgpdHideNumber = await get({
				"column": "lgpdHideNumber"
			});
			if (lgpdHideNumber === "enabled") setHideNum(true);
		}
		fetchData();
	}, []);

	useEffect(() => {
		setOpenForm(false);
	}, [open, contact]);

	useEffect(() => {
		if (open && ticket?.id) {
			loadQueues();
			setSelectedQueue(ticket?.queueId || "");
			setLeadValue(ticket?.leadValue ?? "");
			loadTicketMedia(ticket.id);
		}
	}, [open, ticket]);

	const handleContactToggleAcceptAudio = async () => {
        try {
            const resp = await api.put(`/contacts/toggleAcceptAudio/${safeContact.id}`);
            setAcceptAudio(resp.data.acceptAudioMessage);
        } catch (err) {
            toastError(err);
        }
    };

	const loadQueues = async () => {
		try {
			const { data } = await api.get("/queue");
			setQueues(data);
		} catch (err) {
			console.error("Erro ao carregar filas:", err);
		}
	};

	const formatCurrency = (value) => {
		if (value === null || value === undefined || value === "") return "R$ 0,00";
		const numeric = Number(value);
		if (Number.isNaN(numeric)) return "R$ 0,00";
		return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	};

	const handleSaveLeadValue = async () => {
		if (!ticket?.id) return;
		setSavingLeadValue(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				leadValue: leadValue === "" ? null : Number(leadValue)
			});
			toast.success("Valor do ticket atualizado!");
		} catch (err) {
			console.error(err);
			toast.error("Não foi possível salvar o valor.");
			setLeadValue(ticket?.leadValue ?? "");
		} finally {
			setSavingLeadValue(false);
		}
	};

	const handleQueueChange = async (event) => {
		const queueId = event.target.value;
		setSelectedQueue(queueId);
		if (!ticket?.id) return;
		setLoadingQueue(true);
		try {
			await api.put(`/tickets/${ticket.id}`, { queueId: queueId || null });
			toast.success("Fila atualizada!");
		} catch (err) {
			console.error(err);
			toast.error("Erro ao atualizar fila.");
			setSelectedQueue(ticket?.queueId || "");
		} finally {
			setLoadingQueue(false);
		}
	};

	const loadTicketMedia = async (ticketId) => {
		setMediaLoading(true);
		try {
			let page = 1;
			let hasMore = true;
			const collected = [];
			const MAX_PAGES = 5;
			while (hasMore && page <= MAX_PAGES) {
				const { data } = await api.get(`/messages/${ticketId}`, { params: { pageNumber: page } });
				if (data?.messages?.length) {
					collected.push(...data.messages);
				}
				hasMore = Boolean(data?.hasMore && data.messages?.length);
				page += 1;
			}

			const images = [];
			const files = [];
			const links = [];
			const urlRegex = /(https?:\/\/[^\s]+)/gi;

			collected.forEach(message => {
				const isBase64Image = message.body && message.body.startsWith("data:image/");
				const isImage = message.mediaType === "image" || isBase64Image;
				const mediaUrl = isBase64Image ? message.body : message.mediaUrl;

				if (isImage && mediaUrl) {
					images.push({
						id: message.id,
						url: mediaUrl,
						createdAt: message.createdAt
					});
				} else if (message.mediaUrl && !isBase64Image) {
					files.push({
						id: message.id,
						url: message.mediaUrl,
						name: message.body || message.mediaUrl?.split("/").pop()?.split("?")[0] || "arquivo",
						createdAt: message.createdAt
					});
				}

				if (message.body) {
					const matches = message.body.match(urlRegex);
					if (matches) {
						matches.forEach((url, index) => {
							links.push({
								id: `${message.id}-${index}`,
								url,
								createdAt: message.createdAt
							});
						});
					}
				}
			});

			setImageMessages(images);
			setFileMessages(files);
			setLinkMessages(links);
		} catch (err) {
			console.error("Erro ao carregar mídias:", err);
		} finally {
			setMediaLoading(false);
		}
	};

	const handleBlockContact = async (contactId) => {
		try {
			await api.put(`/contacts/block/${contactId}`, { active: false });
			toast.success("Contato bloqueado");
		} catch (err) {
			toastError(err);
		}
		setBlockingContact(true);
	};

	const handleUnBlockContact = async (contactId) => {
		try {
			await api.put(`/contacts/block/${contactId}`, { active: true });
			toast.success("Contato desbloqueado");
		} catch (err) {
			toastError(err);
		}
		setBlockingContact(false);
	};

	if (loading) return null;

	return (
		<>
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="right"
				open={open}
				PaperProps={{ style: { position: "absolute" } }}
				BackdropProps={{ style: { position: "absolute" } }}
				ModalProps={{
					container: document.getElementById("drawer-container"),
					style: { position: "absolute" },
				}}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				<div className={classes.header}>
					<IconButton onClick={handleDrawerClose} style={{ color: "white" }}> {/* Ícone branco */}
						<CloseIcon />
					</IconButton>
					<Typography style={{ justifySelf: "center", color: "white" }}> {/* Texto branco */}
						{i18n.t("contactDrawer.header")}
					</Typography>
				</div>
				<div>
					{!loading ? (
						<>
							<Typography
								style={{ marginBottom: 8, marginTop: 12 }}
								variant="subtitle1"
							>
								<Switch
									size="small"
									checked={acceptAudioMessage}
									onChange={() => handleContactToggleAcceptAudio()}
									name="disableBot"
									color="primary"
								/>
								{i18n.t("ticketOptionsMenu.acceptAudioMessage")}								
							</Typography>
						</>
					) : (<br />)}
				</div>
				{loading ? (
					<ContactDrawerSkeleton classes={classes} />
				) : (
					<div className={classes.content}>
						<Paper square variant="outlined" className={classes.contactHeader}>
							<ModalImageCors imageUrl={safeContact?.urlPicture} />
							<CardHeader
								onClick={() => { }}
								style={{ cursor: "pointer", width: '100%' }}
								titleTypographyProps={{ noWrap: true }}
								subheaderTypographyProps={{ noWrap: true }}
								title={
									<>
										<Typography onClick={() => setOpenForm(true)}>
										{getDisplayName(safeContact)}
											<CreateIcon style={{ fontSize: 16, marginLeft: 5 }} />
										</Typography>
									</>
								}
								subheader={
									<>
										<Typography style={{ fontSize: 12 }}>
											{hideNum && user.profile === "user" ? formatSerializedId(safeContact.number || "").slice(0, -6) + "**-**" + (safeContact.number || "").slice(-2) : formatSerializedId(safeContact.number || "")}
										</Typography>
										<Typography style={{ color: "primary", fontSize: 12 }}>
											<Link href={`mailto:${safeContact.email}`}>{safeContact.email}</Link>
										</Typography>
									</>
								}
							/>
							<Button
								startIcon={<EditIcon />}
								variant="outlined"
								onClick={() => setModalOpen(!openForm)}
								style={{
									color: "white",
									backgroundColor: "#4ec24e",
									boxShadow: "none",
									borderRadius: 0,
									fontSize: "12px",
								}}
							>
								{i18n.t("contactDrawer.buttons.edit")}
							</Button>
							<Button
								startIcon={<ClearIcon />}
								variant="outlined"
								style={{
									color: "white",
									backgroundColor: "#8A2BE2",
									boxShadow: "none",
									borderRadius: 0,
									fontSize: "12px",
								}}
										onClick={() => safeContact.active
											? handleBlockContact(safeContact.id)
											: handleUnBlockContact(safeContact.id)}
								disabled={loading}
							>
								{!safeContact.active ? "Desbloquear contato" : "Bloquear contato"}
							</Button>
							{(safeContact.id && openForm) && <ContactForm initialContact={safeContact} onCancel={() => setOpenForm(false)} />}
						</Paper>
						<TagsKanbanContainer ticket={ticket} className={classes.contactTags} />
						<Paper square variant="outlined" className={classes.contactDetails}>
							<Typography variant="subtitle1" style={{ marginBottom: 10 }}>
								{i18n.t("ticketOptionsMenu.appointmentsModal.title")}
							</Typography>
							<ContactNotes ticket={ticket} />
						</Paper>
						<Paper square variant="outlined" className={classes.contactDetails}>
									<ContactModal
										open={modalOpen}
										onClose={() => setModalOpen(false)}
										contactId={safeContact.id}
									></ContactModal>
							<Typography variant="subtitle1">
								{i18n.t("contactDrawer.extraInfo")}
							</Typography>
									{safeContact?.extraInfo?.map(info => (
								<Paper
									key={info.id}
									square
									variant="outlined"
									className={classes.contactExtraInfo}
								>
									<InputLabel>{info.name}</InputLabel>
									<Typography component="div" noWrap style={{ paddingTop: 2 }}>
										<MarkdownWrapper>{info.value}</MarkdownWrapper>
									</Typography>
								</Paper>
							))}
						</Paper>
					</div>
				)}
			</Drawer>
		</>
	);
};

export default ContactDrawer;