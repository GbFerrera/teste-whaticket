import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { Stack } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  btnWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const FlowBuilderTransferFlowModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const [activeModal, setActiveModal] = useState(false);
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState("");

  useEffect(() => {
    if (open === 'edit') {
      (async () => {
        try {
          const { data: flowsData } = await api.get("/flowbuilder");
          setFlows(flowsData.flows || []);
          if (data?.data?.flowId) {
            setSelectedFlow(data.data.flowId);
          }
          setActiveModal(true);
        } catch (error) {
          console.log(error);
        }
      })();
    } else if (open === 'create') {
      (async () => {
        try {
          const { data: flowsData } = await api.get("/flowbuilder");
          setFlows(flowsData.flows || []);
          setSelectedFlow("");
          setActiveModal(true);
        } catch (error) {
          console.log(error);
        }
      })();
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSave = () => {
    if (!selectedFlow) {
      return toast.error('Selecione um fluxo');
    }
    const flow = flows.find(item => item.id === selectedFlow);
    if (open === 'edit') {
      onUpdate({
        ...data,
        data: { flowId: flow.id, flowName: flow.name }
      });
    } else if (open === 'create') {
      onSave({
        data: { flowId: flow.id, flowName: flow.name }
      });
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog open={activeModal} onClose={handleClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {open === 'create' ? `Transferir para outro fluxo` : `Editar transferência de fluxo`}
        </DialogTitle>
        <Stack>
          <DialogContent dividers>
            <Select
              labelId="flow-select-label"
              id="flow-select"
              value={selectedFlow}
              style={{ width: "100%" }}
              onChange={(e) => setSelectedFlow(e.target.value)}
              displayEmpty
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              <MenuItem value="" disabled>
                Selecione um fluxo
              </MenuItem>
              {flows.length > 0 && (
                flows.map((flow, index) => (
                  <MenuItem dense key={index} value={flow.id}>{flow.name}</MenuItem>
                ))
              )}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              startIcon={<CancelIcon />}
              style={{
                color: "white",
                backgroundColor: "#db6565",
                boxShadow: "none",
                borderRadius: 0,
                fontSize: "12px",
              }}
              variant="outlined"
            >
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              startIcon={<SaveIcon />}
              type="submit"
              style={{
                color: "white",
                backgroundColor: "#437db5",
                boxShadow: "none",
                borderRadius: 0,
                fontSize: "12px",
              }}
              variant="contained"
              className={classes.btnWrapper}
              onClick={handleSave}
            >
              {open === 'create' ? `Adicionar` : 'Salvar'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderTransferFlowModal;
