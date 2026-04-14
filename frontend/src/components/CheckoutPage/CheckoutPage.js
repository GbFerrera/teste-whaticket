import React, { useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Formik, Form } from "formik";

import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";

import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import useStyles from "./styles";

export default function CheckoutPage(props) {
  console.log("CheckoutPage - props:", props);
  console.log("CheckoutPage - props.Invoice:", props.Invoice);
  
  const steps = ["Pagamento"];
  const { formId, formField } = checkoutFormModel;

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0); // Começa no passo de pagamento
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId, setinvoiceId] = useState(props.Invoice.id);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const { user, socket } = useContext(AuthContext);

  function _renderStepContent(step, setFieldValue, setActiveStep, values) {
    // Mostrar apenas revisão da fatura para pagamento
    return <ReviewOrder 
      invoice={props.Invoice} 
      onPay={() => _handleSubmit(values, { setSubmitting: () => {} })}
    />;
  }

  async function _submitForm(values, actions) {
    console.log("_submitForm chamado - values:", values);
    console.log("_submitForm chamado - invoiceId:", invoiceId);
    
    try {
      // Usar dados da fatura em vez do formulário
      const invoice = props.Invoice;
      const newValues = {
        invoiceId: invoiceId,
        amount: invoice.value,
        description: invoice.detail,
        dueDate: invoice.dueDate,
        companyId: invoice.companyId
      }

      console.log("Enviando para /invoices/pay:", newValues);
      const { data } = await api.post("/invoices/pay", newValues);
      console.log("Resposta do backend:", data);
      
      // Redirecionar para o link de pagamento
      if (data.success && data.paymentLink) {
        console.log("Redirecionando para:", data.paymentLink);
        window.open(data.paymentLink, '_blank');
        toast.success("Redirecionando para pagamento...");
      }
      
      setDatePayment(data)
      actions.setSubmitting(false);
      setActiveStep(activeStep + 1);
    } catch (err) {
      console.error("Erro no pagamento:", err);
      toastError(err);
    }
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center">
        Pagar Fatura
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <CheckoutSuccess pix={datePayment} />
        ) : (
          <Formik
            initialValues={{
              ...user,
              ...formInitialValues
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(activeStep, setFieldValue, setActiveStep, values)}

                <div className={classes.buttons}>
                  {activeStep !== 1 && activeStep !== 0 && (
                    <Button
                        startIcon={<ArrowBackIcon />}
                        style={{
                        color: "white",
                        backgroundColor: "#db6565",
                        boxShadow: "none",
                        borderRadius: 0
                        }}
                      onClick={_handleBack}
                      className={classes.button}
                      >
                      VOLTAR
                    </Button>
                  )}
                  <div className={classes.wrapper}>
                    {activeStep !== 1 && (
                      <Button
                        startIcon={<AttachMoneyIcon />}
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        style={{
                        color: "white",
                        backgroundColor: "#437db5",
                        boxShadow: "none",
                        borderRadius: 0
                        }}
                        className={classes.button}
                      >
                        {isLastStep ? "PAGAR" : "PRÓXIMO"}
                      </Button>
                    )}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </React.Fragment>
    </React.Fragment>
  );
}
