import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import Ticket from "../Ticket";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";

const ChatModal = ({ open, onClose, contact, ticketUuid }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="chat-modal-title"
    >
      <DialogTitle disableTypography id="chat-modal-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              src={contact?.avatar}
              alt={contact?.name}
              style={{ marginRight: 12 }}
            />
            <Box>
              <Typography variant="subtitle1">
                {contact?.name || "Contato"}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {contact?.statusText || "Ativo agora"}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent
        style={{
          padding: 0,
          minHeight: 400,
          maxHeight: 600,
        }}
      >
        {ticketUuid ? (
          <QueueSelectedProvider>
            <MemoryRouter initialEntries={[`/tickets/${ticketUuid}`]}>
              <Switch>
                <Route path="/tickets/:ticketId">
                  <Ticket />
                </Route>
              </Switch>
            </MemoryRouter>
          </QueueSelectedProvider>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={400}
          >
            <Typography variant="body2" color="textSecondary">
              Selecione um ticket para visualizar a conversa.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

ChatModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contact: PropTypes.object,
  ticketUuid: PropTypes.string,
};

export default ChatModal;
