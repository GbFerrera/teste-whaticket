import React, { useState } from "react";
import {
	Menu,
	MenuItem,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from "@material-ui/core";
import {
	MoreHoriz as MoreHorizIcon,
	CheckCircle as CheckCircleIcon,
	Block as BlockIcon,
	Close as CloseIcon,
	Delete as DeleteIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
	dropdownArrow: {
		backgroundColor: "transparent",
		padding: 4,
		"&:hover": {
			backgroundColor: "rgba(0, 0, 0, 0.04)",
		},
	},
	actionButton: {
		width: 36,
		height: 36,
		borderRadius: "50%",
		marginRight: 8,
		color: "#ffffff",
		"&:hover": {
			opacity: 0.8,
		},
	},
	greenButton: {
		backgroundColor: "#00a884",
	},
	blueButton: {
		backgroundColor: "#2196f3",
	},
	orangeButton: {
		backgroundColor: "#ff9800",
	},
	redButton: {
		backgroundColor: "#f44336",
	},
	menuPaper: {
		minWidth: 200,
	},
	actionItem: {
		display: "flex",
		alignItems: "center",
		padding: "12px 16px",
		gap: 12,
	},
}));

const TicketActionsMenu = ({ ticket, onUpdate, anchorEl: externalAnchorEl, open: externalOpen, onClose: externalOnClose }) => {
	const classes = useStyles();
	const history = useHistory();
	const [internalAnchorEl, setInternalAnchorEl] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Usar props externas se fornecidas, senão usar estado interno
	const anchorEl = externalAnchorEl !== undefined ? externalAnchorEl : internalAnchorEl;
	const isOpen = externalOpen !== undefined ? externalOpen : Boolean(internalAnchorEl);

	const handleClick = (event) => {
		event.stopPropagation();
		setInternalAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		if (externalOnClose) {
			externalOnClose();
		} else {
			setInternalAnchorEl(null);
		}
	};

	const handleAcceptTicket = async () => {
		try {
			await api.put("/tickets/" + ticket.id, {
				status: "open",
				userId: ticket.userId,
			});
			
			// Redireciona para /atendimentos após aceitar
			history.push("/atendimentos");
			
			handleClose();
			if (onUpdate) onUpdate();
		} catch (err) {
			console.error("Erro ao aceitar ticket:", err);
		}
	};

	const handleIgnoreTicket = async () => {
		try {
			await api.put("/tickets/" + ticket.id, {
				status: "closed",
			});
			
			// Redireciona para /atendimentos após ignorar
			history.push("/atendimentos");
			
			handleClose();
			if (onUpdate) onUpdate();
		} catch (err) {
			console.error("Erro ao ignorar ticket:", err);
		}
	};

	const handleCloseTicket = async () => {
		try {
			await api.put("/tickets/" + ticket.id, {
				status: "closed",
			});
			
			// Redireciona para /atendimentos após fechar
			history.push("/atendimentos");
			
			handleClose();
			if (onUpdate) onUpdate();
		} catch (err) {
			console.error("Erro ao fechar ticket:", err);
		}
	};

	const handleDeleteTicket = async () => {
		try {
			await api.delete("/tickets/" + ticket.id);
			
			// Redireciona para /atendimentos após deletar
			history.push("/atendimentos");
			
			setDeleteDialogOpen(false);
			handleClose();
			if (onUpdate) onUpdate();
		} catch (err) {
			console.error("Erro ao deletar ticket:", err);
		}
	};

	return (
		<>
			<IconButton
				size="small"
				onClick={handleClick}
				style={{ 
					padding: 4,
					color: '#000000'
				}}
			>
				<MoreHorizIcon style={{ fontSize: 18 }} />
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={isOpen}
				onClose={handleClose}
				classes={{ paper: classes.menuPaper }}
				MenuListProps={{
					style: { padding: 0 }
				}}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				<div style={{ padding: "8px 0", minWidth: 200 }}>
					<Typography style={{ fontSize: 14, fontWeight: 500, padding: "8px 16px", color: "#667781" }}>
						O que você deseja fazer?
					</Typography>
					
					{ticket.status === "pending" ? (
						<>
							<MenuItem onClick={handleAcceptTicket} style={{ padding: "10px 16px" }}>
								<CheckCircleIcon style={{ fontSize: 18, marginRight: 10, color: "#00a884" }} />
								<Typography style={{ fontSize: 14 }}>Aceitar Ticket</Typography>
							</MenuItem>
							<MenuItem 
								onClick={() => {
									setDeleteDialogOpen(true);
									handleClose();
								}} 
								style={{ padding: "10px 16px" }}
							>
								<DeleteIcon style={{ fontSize: 18, marginRight: 10, color: "#f44336" }} />
								<Typography style={{ fontSize: 14 }}>Excluir Ticket</Typography>
							</MenuItem>
							<MenuItem onClick={handleIgnoreTicket} style={{ padding: "10px 16px" }}>
								<BlockIcon style={{ fontSize: 18, marginRight: 10, color: "#ff9800" }} />
								<Typography style={{ fontSize: 14 }}>Ignorar Ticket</Typography>
							</MenuItem>
						</>
					) : ticket.status === "open" ? (
						<>
							<MenuItem 
								onClick={() => {
									setDeleteDialogOpen(true);
									handleClose();
								}} 
								style={{ padding: "10px 16px" }}
							>
								<DeleteIcon style={{ fontSize: 18, marginRight: 10, color: "#f44336" }} />
								<Typography style={{ fontSize: 14 }}>Excluir Ticket</Typography>
							</MenuItem>
							<MenuItem onClick={handleCloseTicket} style={{ padding: "10px 16px" }}>
								<CloseIcon style={{ fontSize: 18, marginRight: 10, color: "#ff9800" }} />
								<Typography style={{ fontSize: 14 }}>Fechar Ticket</Typography>
							</MenuItem>
						</>
					) : (
						<MenuItem 
							onClick={() => {
								setDeleteDialogOpen(true);
								handleClose();
							}} 
							style={{ padding: "10px 16px" }}
						>
							<DeleteIcon style={{ fontSize: 18, marginRight: 10, color: "#f44336" }} />
							<Typography style={{ fontSize: 14 }}>Excluir Ticket</Typography>
						</MenuItem>
					)}
				</div>
			</Menu>

			{/* Dialog de Confirmação de Exclusão */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Confirmar Exclusão</DialogTitle>
				<DialogContent>
					<Typography>
						Tem certeza que deseja deletar este ticket? Esta ação não pode ser
						desfeita.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} color="primary">
						Cancelar
					</Button>
					<Button onClick={handleDeleteTicket} color="secondary" variant="contained">
						Deletar
					</Button>
				</DialogActions>
			</Dialog>

		</>
	);
};

export default TicketActionsMenu;
