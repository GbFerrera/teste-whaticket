import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
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

const FlowBuilderIntervalModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [timerMinutes, setTimerMinutes] = useState("")
  const [activeModal, setActiveModal] = useState(false)

  const formatMinutesValue = (seconds) => {
    const numericSeconds = Number(seconds) || 0;
    if (!numericSeconds) return "";
    const minutes = numericSeconds / 60;
    return Number.isInteger(minutes) ? String(minutes) : String(parseFloat(minutes.toFixed(2)));
  };

  const buildIntervalLabel = (seconds) => {
    const minutes = (Number(seconds) || 0) / 60;
    if (!minutes) return "Intervalo";
    const formatted = Number.isInteger(minutes) ? minutes : parseFloat(minutes.toFixed(2));
    return `Intervalo ${formatted} min`;
  };

  useEffect(() => {
    if(open === 'edit'){
      setTimerMinutes(formatMinutesValue(data?.data?.sec))
      setActiveModal(true)
    } else if(open === 'create'){
      setTimerMinutes("")
      setActiveModal(true)
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);
  

  const handleClose = () => {
    close(null)
    setActiveModal(false)
  };

  const handleSaveContact = async values => {
    const minutesValue = Number(timerMinutes);

    if(!minutesValue || minutesValue <= 0){
      return toast.error('Adicione o valor de intervalo em minutos')
    }

    const secondsValue = Math.round(minutesValue * 60);
    const intervalPayload = {
      sec: secondsValue,
      label: buildIntervalLabel(secondsValue)
    };
    if(open === 'edit'){
      onUpdate({
        ...data,
        data: {
          ...(data?.data || {}),
          ...intervalPayload
        }
      });
    } else if(open === 'create'){
      onSave(intervalPayload)
    }
    handleClose()
    
  };

  return (
    <div className={classes.root}>
      <Dialog open={activeModal} onClose={handleClose} fullWidth="md" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {open === 'create' ? `Adicionar um intervalo ao fluxo`: `Editar intervalo`}
        </DialogTitle>        
            <Stack>
              <DialogContent dividers>
                <TextField
                  label={'Tempo em minutos'}
                  name="timer"
                  type="number"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  autoFocus
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 1 } }}
                  margin="dense"
                  className={classes.textField}
                  style={{ width: "95%" }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleClose}
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
                  onClick={() => handleSaveContact()}
                >
                  {open === 'create' ? `Adicionar` : 'Editar'}                  
                </Button>
              </DialogActions>
            </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderIntervalModal;
