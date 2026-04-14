import React from 'react';
import { Typography, Grid, Card, CardContent, Button } from '@material-ui/core';
import moment from 'moment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function ReviewOrder({ invoice, onPay }) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Detalhes da Fatura
      </Typography>
      
      <Card style={{ marginBottom: 16 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Descrição
              </Typography>
              <Typography variant="body1">
                {invoice?.detail || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Valor
              </Typography>
              <Typography variant="h6" color="primary">
                {invoice?.value ? invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Data de Vencimento
              </Typography>
              <Typography variant="body1">
                {invoice?.dueDate ? moment(invoice.dueDate).format('DD/MM/YYYY') : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1" style={{ 
                color: invoice?.status === 'paid' ? 'green' : 'orange',
                fontWeight: 'bold'
              }}>
                {invoice?.status === 'paid' ? 'Pago' : 'Em Aberto'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Informações de Pagamento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Ao clicar em "PAGAR", você será redirecionado para o gateway de pagamento 
            para concluir a transação de forma segura.
          </Typography>
        </CardContent>
      </Card>

      <Grid container justify="flex-end">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AttachMoneyIcon />}
          onClick={onPay}
          disabled={invoice?.status === 'paid'}
        >
          {invoice?.status === 'paid' ? 'JÁ PAGO' : 'PAGAR'}
        </Button>
      </Grid>
    </React.Fragment>
  );
}
