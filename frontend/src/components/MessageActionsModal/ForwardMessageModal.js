import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Checkbox,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Forward as ForwardIcon, Search as SearchIcon } from "@material-ui/icons";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      maxWidth: "500px",
      width: "100%",
      height: "600px",
    },
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#00a884",
    borderBottom: "1px solid #e9edef",
  },
  content: {
    padding: "0",
    display: "flex",
    flexDirection: "column",
  },
  searchContainer: {
    padding: "16px",
    borderBottom: "1px solid #e9edef",
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#e9edef",
      },
      "&:hover fieldset": {
        borderColor: "#00a884",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00a884",
      },
    },
  },
  listContainer: {
    flex: 1,
    overflow: "auto",
  },
  listItem: {
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  selectedCount: {
    padding: "12px 24px",
    backgroundColor: "#f0f2f5",
    borderTop: "1px solid #e9edef",
    color: "#667781",
    fontSize: "14px",
  },
  actions: {
    padding: "16px 24px",
    justifyContent: "flex-end",
    gap: "8px",
    borderTop: "1px solid #e9edef",
  },
  cancelButton: {
    color: "#667781",
  },
  forwardButton: {
    backgroundColor: "#00a884",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#008f6f",
    },
  },
}));

const ForwardMessageModal = ({ open, onClose, onForward, message }) => {
  const classes = useStyles();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const MAX_SELECTION = 5;

  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter((contact) =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number?.includes(searchTerm)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  const loadContacts = async () => {
    try {
      const { data } = await api.get("/contacts", {
        params: {
          searchParam: "",
        },
      });
      setContacts(data.contacts || []);
      setFilteredContacts(data.contacts || []);
    } catch (err) {
      console.error("Erro ao carregar contatos:", err);
    }
  };

  const handleToggleContact = (contactId) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      } else {
        if (prev.length >= MAX_SELECTION) {
          return prev;
        }
        return [...prev, contactId];
      }
    });
  };

  const handleForward = () => {
    if (selectedContacts.length > 0) {
      onForward(selectedContacts);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedContacts([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className={classes.dialog}>
      <DialogTitle className={classes.title}>
        <ForwardIcon />
        Encaminhar mensagem
      </DialogTitle>
      <DialogContent className={classes.content}>
        <div className={classes.searchContainer}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Buscar contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: <SearchIcon style={{ color: "#667781", marginRight: "8px" }} />,
            }}
          />
        </div>
        <div className={classes.listContainer}>
          <List>
            {filteredContacts.map((contact) => (
              <ListItem
                key={contact.id}
                button
                onClick={() => handleToggleContact(contact.id)}
                className={classes.listItem}
                disabled={!selectedContacts.includes(contact.id) && selectedContacts.length >= MAX_SELECTION}
              >
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  style={{ color: "#00a884" }}
                  disabled={!selectedContacts.includes(contact.id) && selectedContacts.length >= MAX_SELECTION}
                />
                <ListItemAvatar>
                  <Avatar src={contact.profilePicUrl}>
                    {contact.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.name || "Sem nome"}
                  secondary={contact.number || "Sem número"}
                />
              </ListItem>
            ))}
          </List>
        </div>
        {selectedContacts.length > 0 && (
          <div className={classes.selectedCount}>
            {selectedContacts.length} de {MAX_SELECTION} contato(s) selecionado(s)
          </div>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={handleClose} className={classes.cancelButton}>
          Cancelar
        </Button>
        <Button
          onClick={handleForward}
          variant="contained"
          className={classes.forwardButton}
          disabled={selectedContacts.length === 0}
        >
          Encaminhar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForwardMessageModal;
