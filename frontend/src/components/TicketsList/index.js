import React from "react";
import PropTypes from "prop-types";
import {
	Avatar,
	Badge,
	CircularProgress,
	IconButton,
	Tab,
	Tabs,
	Tooltip,
	Typography
} from "@material-ui/core";
import {
	Archive as ArchiveIcon,
	Delete as DeleteIcon,
	DoneAll as DoneAllIcon,
	FilterList as FilterListIcon,
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon
} from "@material-ui/icons";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ConnectionIcon from "../ConnectionIcon";
import TicketActionsMenu from "../TicketActionsMenu";

const TicketsList = ({
	classes,
	isMobile,
	user,
	channelQuickOptions,
	selectedChannelsQuickFilter,
	toggleChannelQuickFilter,
	showAllTickets,
	setShowAllTickets,
	closingAllTickets,
	handleOpenCloseAllDialog,
	hasActiveFilters,
	setFilterAnchor,
	tabIndex,
	setTabIndex,
	TAB_CONFIG,
	unreadCounts,
	loading,
	tickets,
	selectedTicket,
	handleTicketClick,
	handleTicketContextMenu,
	formatMessageTime,
	formatWaitingTime,
	handleRemoveGroup,
	selectedTicketForMenu,
	setSelectedTicketForMenu,
	ticketMenuAnchor,
	setTicketMenuAnchor,
	loadTickets,
	loadUnreadCounts,
	getChannelStyle
}) => {
	return (
		<div className={`${classes.sidebar} ${isMobile ? classes.sidebarMobile : ""}`}>
			<div className={classes.sidebarHeader}>
				<Avatar src={user?.profileImage} alt={user?.name}>
					{user?.name?.charAt(0)}
				</Avatar>
				<div style={{ flex: 1 }} />
				<div style={{ display: "flex", gap: 6, marginRight: 8 }}>
					{channelQuickOptions.map(option => {
						const isActive = selectedChannelsQuickFilter.includes(option.key);
						return (
							<Tooltip key={option.key} title={`Filtrar ${option.label}`}>
								<span>
									<IconButton
										size="small"
										onClick={() => toggleChannelQuickFilter(option.key)}
										style={{
											border: `1px solid ${option.color}`,
											color: isActive ? "#ffffff" : option.color,
											backgroundColor: isActive ? option.color : "transparent",
											width: 34,
											height: 34
										}}
									>
										{option.icon}
									</IconButton>
								</span>
							</Tooltip>
						);
					})}
				</div>
				{(user?.profile === "admin" || user?.allUserChat === "enabled" || user?.allTicket === "enabled") && (
					<Tooltip title={showAllTickets ? "Ver apenas meus tickets" : "Ver todos os tickets"}>
						<IconButton
							size="small"
							onClick={() => setShowAllTickets(!showAllTickets)}
							style={{
								marginRight: 8,
								backgroundColor: showAllTickets ? "#00a884" : "transparent",
								color: showAllTickets ? "#ffffff" : "inherit"
							}}
						>
							{showAllTickets ? <VisibilityIcon /> : <VisibilityOffIcon />}
						</IconButton>
					</Tooltip>
				)}
				<Tooltip title="Encerrar todos os atendimentos">
					<span>
						<IconButton
							size="small"
							onClick={handleOpenCloseAllDialog}
							disabled={closingAllTickets}
							style={{ marginRight: 8 }}
						>
							<DoneAllIcon />
						</IconButton>
					</span>
				</Tooltip>
				<Tooltip title="Ver Finalizados">
					<IconButton
						size="small"
						onClick={() => setTabIndex(TAB_CONFIG.length - 2)}
						style={{ marginRight: 8 }}
					>
						<ArchiveIcon />
					</IconButton>
				</Tooltip>
				<IconButton
					size="small"
					onClick={(e) => setFilterAnchor(e.currentTarget)}
					style={{
						backgroundColor: hasActiveFilters ? "#00a884" : "transparent",
						color: hasActiveFilters ? "#ffffff" : "inherit"
					}}
				>
					<FilterListIcon />
				</IconButton>
			</div>

			<Tabs
				value={tabIndex}
				onChange={(e, newValue) => setTabIndex(newValue)}
				className={classes.tabs}
				indicatorColor="primary"
				textColor="primary"
				variant="fullWidth"
			>
				{TAB_CONFIG.map((tab, index) => (
					<Tab
						key={tab.key}
						label={
							<Badge
								badgeContent={unreadCounts[tab.key] ?? 0}
								color="error"
								max={99}
							>
								<span style={{ fontSize: "0.75rem" }}>{tab.name}</span>
							</Badge>
						}
						value={index}
					/>
				))}
			</Tabs>

			<div className={classes.ticketsList}>
				{loading ? (
					<div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
						<CircularProgress size={30} />
					</div>
				) : tickets.length === 0 ? (
					<div style={{ padding: 20, textAlign: "center", color: "#667781" }}>
						Nenhum atendimento encontrado
					</div>
				) : (
					tickets.map((ticket) => (
						<div
							key={ticket.id}
							className={`${classes.ticketItem} ${selectedTicket?.id === ticket.id ? "active" : ""}`}
							onClick={() => handleTicketClick(ticket)}
							onContextMenu={(e) => handleTicketContextMenu(e, ticket)}
						>
							<Avatar
								src={ticket.contact?.profilePicUrl}
								className={classes.ticketAvatar}
							>
								{ticket.contact?.name?.charAt(0)}
							</Avatar>
							<div className={classes.ticketInfo}>
								<Typography className={classes.ticketName}>
									{ticket.contact?.name || "Sem nome"}
								</Typography>
								<div className={classes.ticketLastMessage}>
									{ticket.lastMessage || "Sem mensagens"}
								</div>
								<div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
									{ticket.whatsapp?.name && (() => {
										const channelStyle = getChannelStyle(ticket.channel);
										return (
											<div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: channelStyle.bg, padding: "2px 6px", borderRadius: 4 }}>
												<ConnectionIcon connectionType={ticket.channel} size={12} />
												<Typography style={{ fontSize: 10, color: channelStyle.color, fontWeight: 500 }}>
													{ticket.whatsapp.name}
												</Typography>
											</div>
										);
									})()}
									{ticket.queue?.name && (
										<div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
											<Typography style={{ fontSize: 10, color: "#667781", fontWeight: 500 }}>
												{ticket.queue.name}
											</Typography>
										</div>
									)}
									{TAB_CONFIG[tabIndex]?.key === "groups" && (ticket.lastFlowId || ticket.hashFlowId) && (
										<Tooltip title={`ID: ${ticket.lastFlowId || ticket.hashFlowId}`} arrow>
											<div style={{ display: "flex", alignItems: "center", backgroundColor: "#f3e8ff", padding: "2px 6px", borderRadius: 4 }}>
												<SmartToyIcon style={{ fontSize: 12, color: "#9054bc" }} />
											</div>
										</Tooltip>
									)}
									{ticket.user?.name && (
										<div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
											<Typography style={{ fontSize: 10, color: "#667781", fontWeight: 500 }}>
												{ticket.user.name}
											</Typography>
										</div>
									)}
									{TAB_CONFIG[tabIndex]?.key === "pending" && formatWaitingTime(ticket) && (
										<div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#fff3e0", padding: "2px 6px", borderRadius: 4 }}>
											<Typography style={{ fontSize: 10, color: "#ff9800", fontWeight: 500 }}>
												{formatWaitingTime(ticket)}
											</Typography>
										</div>
									)}
								</div>
							</div>
							<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, marginLeft: "auto", alignSelf: "flex-start" }}>
								<Typography className={classes.ticketTime}>
									{ticket.lastMessage && formatMessageTime(ticket.updatedAt)}
								</Typography>
								{ticket.unreadMessages > 0 && (
									<div className={classes.unreadBadge}>
										{ticket.unreadMessages}
									</div>
								)}
								{TAB_CONFIG[tabIndex]?.key === "groups" && ticket.isGroup && (
									<Tooltip title="Remover grupo">
										<IconButton
											size="small"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoveGroup(ticket);
											}}
											style={{ padding: 2 }}
										>
											<DeleteIcon style={{ fontSize: 16, color: "#f44336" }} />
										</IconButton>
									</Tooltip>
								)}
							</div>
						</div>
					))
				)}
			</div>

			{selectedTicketForMenu && (
				<TicketActionsMenu
					ticket={selectedTicketForMenu}
					anchorEl={ticketMenuAnchor}
					open={Boolean(ticketMenuAnchor)}
					onClose={() => {
						setTicketMenuAnchor(null);
						setSelectedTicketForMenu(null);
					}}
					onUpdate={() => {
						loadTickets();
						loadUnreadCounts();
						setTicketMenuAnchor(null);
						setSelectedTicketForMenu(null);
					}}
				/>
			)}
		</div>
	);
};

TicketsList.propTypes = {
	classes: PropTypes.object.isRequired,
	isMobile: PropTypes.bool.isRequired,
	user: PropTypes.object.isRequired,
	channelQuickOptions: PropTypes.array.isRequired,
	selectedChannelsQuickFilter: PropTypes.array.isRequired,
	toggleChannelQuickFilter: PropTypes.func.isRequired,
	showAllTickets: PropTypes.bool.isRequired,
	setShowAllTickets: PropTypes.func.isRequired,
	closingAllTickets: PropTypes.bool.isRequired,
	handleOpenCloseAllDialog: PropTypes.func.isRequired,
	hasActiveFilters: PropTypes.bool.isRequired,
	setFilterAnchor: PropTypes.func.isRequired,
	tabIndex: PropTypes.number.isRequired,
	setTabIndex: PropTypes.func.isRequired,
	TAB_CONFIG: PropTypes.array.isRequired,
	unreadCounts: PropTypes.object.isRequired,
	loading: PropTypes.bool.isRequired,
	tickets: PropTypes.array.isRequired,
	selectedTicket: PropTypes.object,
	handleTicketClick: PropTypes.func.isRequired,
	handleTicketContextMenu: PropTypes.func.isRequired,
	formatMessageTime: PropTypes.func.isRequired,
	formatWaitingTime: PropTypes.func.isRequired,
	handleRemoveGroup: PropTypes.func.isRequired,
	selectedTicketForMenu: PropTypes.object,
	setSelectedTicketForMenu: PropTypes.func.isRequired,
	ticketMenuAnchor: PropTypes.any,
	setTicketMenuAnchor: PropTypes.func.isRequired,
	loadTickets: PropTypes.func.isRequired,
	loadUnreadCounts: PropTypes.func.isRequired,
	getChannelStyle: PropTypes.func.isRequired
};

export default TicketsList;
