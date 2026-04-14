import React from "react";
import { useParams, useLocation } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import ChatIcon from "@material-ui/icons/Chat";

import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		backgroundColor: theme.palette.background.default,
		padding: '16px 20px',
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
		[theme.breakpoints.down('sm')]: {
			padding: '8px',
		},
	},

	chatPapper: {
		display: "flex",
		height: "100%",
		background: theme.palette.background.paper,
		borderRadius: 16,
		boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
		overflow: 'hidden',
		[theme.breakpoints.down('sm')]: {
			borderRadius: 12,
		},
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
		borderRight: `1px solid ${theme.palette.divider}`,
		background: theme.palette.background.paper,
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		background: theme.palette.background.paper,
	},
	welcomeMsg: {
		background: theme.palette.background.default,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
		flexDirection: 'column',
		gap: 16,
		color: theme.palette.text.secondary,
		fontSize: 16,
	},
	welcomeIcon: {
		fontSize: 80,
		color: theme.palette.primary.main,
		opacity: 0.6,
		marginBottom: 8,
	},
}));

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const isEmbed = searchParams.get("embed") === "1";

	if (isEmbed && ticketId) {
		// Modo embed: só a conversa do ticket (com campo de resposta), sem lista lateral
		return (
			<div className={classes.chatContainer}>
				<div className={classes.chatPapper}>
					<div className={classes.messagessWrapper}>
						<Ticket />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<Ticket />
						) : (
							<div className={classes.welcomeMsg}>
								<ChatIcon className={classes.welcomeIcon} />
								<span>{i18n.t("chat.noTicketMessage")}</span>
							</div>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
