import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  createServiceOrder,
  showServiceOrder,
  updateServiceOrder
} from "../../services/serviceOrdersService";
import { PAYMENT_OPTIONS } from "../../constants/serviceOrders";

const useStyles = makeStyles(theme => ({
  modalTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: theme.spacing(1)
  },
  modalContent: {
    backgroundColor: "#f5f6fb"
  },
  modalGrid: {
    marginTop: theme.spacing(1)
  },
  panelCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: theme.spacing(2.5),
    boxShadow: "0 15px 45px rgba(15,23,42,0.12)",
    marginBottom: theme.spacing(2)
  },
  cartContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5)
  },
  cartItem: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    backgroundColor: "#f8fafc"
  },
  catalogWrapper: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: theme.spacing(2.5),
    minHeight: 520,
    boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  },
  catalogChips: {
    display: "flex",
    gap: theme.spacing(1)
  },
  catalogGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 260px))",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    alignContent: "flex-start",
    gap: theme.spacing(2),
    overflowY: "auto",
    ...theme.scrollbarStyles
  },
  catalogCard: {
    borderRadius: 18,
    padding: theme.spacing(1.5),
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    background: "linear-gradient(180deg, #fff, #f8fafc)",
    minHeight: "auto"
  },
  variationSelectors: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1)
  },
  variationSelect: {
    backgroundColor: "#fff",
    borderRadius: 10
  },
  totalsBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 16,
    backgroundColor: "#0f172a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1)
  }
}));

const currency = value =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value) || 0
  );

const ServiceOrderModal = ({ open, onClose, onSaved, orderId = null }) => {
  const classes = useStyles();
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentType, setPaymentType] = useState("");
  const [garantiaFlag, setGarantiaFlag] = useState(false);
  const [garantiaPrazoDias, setGarantiaPrazoDias] = useState("30");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [items, setItems] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [catalogTab, setCatalogTab] = useState("services");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const isEditing = Boolean(orderId);

  useEffect(() => {
    if (!open) return;
    const loadCatalogs = async () => {
      setCatalogLoading(true);
      try {
        const [productsResponse, servicesResponse] = await Promise.all([
          api.get("/produtos"),
          api.get("/servicos")
        ]);
        setProducts(productsResponse.data || []);
        setServices(servicesResponse.data || []);
      } catch (error) {
        toast.error("Não foi possível carregar produtos e serviços");
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalogs();
  }, [open]);

  useEffect(() => {
    if (!open || !orderId) return;
    setPrefillLoading(true);
    const loadOrder = async () => {
      try {
        const data = await showServiceOrder(orderId);
        setSelectedCustomer(data.customer || null);
        setPaymentType(data.pagamentoTipo || "");
        setGarantiaFlag(Boolean(data.garantiaFlag));
        setGarantiaPrazoDias(
          data.garantiaPrazoDias !== null && data.garantiaPrazoDias !== undefined
            ? String(data.garantiaPrazoDias)
            : "30"
        );
        setDeliveryDate(data.entregaPrevista ? data.entregaPrevista.slice(0, 10) : "");
        setInternalNotes(data.observacoesInternas || "");
        setCustomerNotes(data.observacoesCliente || "");

        const mappedItems = (data.items || []).map(item => {
          const isService = item.itemType === "service";
          const name = isService ? item.service?.nome : item.product?.nome;
          return {
            tempId: `${item.itemType}-${item.id}-${Date.now()}`,
            itemType: item.itemType,
            resourceId: isService ? item.serviceId : item.productId,
            name: name || item.description || (isService ? "Serviço" : "Produto"),
            description: item.description,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            discount: Number(item.discount) || 0,
            total: Number(item.total) || 0,
            variationKey: null,
            variationLabel: null,
            variationSelection: null
          };
        });
        setItems(mappedItems);
      } catch (error) {
        toast.error("Não foi possível carregar esta ordem de serviço");
        onClose();
      } finally {
        setPrefillLoading(false);
      }
    };

    loadOrder();
  }, [open, orderId, onClose]);

  useEffect(() => {
    if (!customerSearch || customerSearch.length < 3) {
      setCustomerOptions([]);
      return;
    }
    setCustomerLoading(true);
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get("/crm/clients", { params: { searchParam: customerSearch } });
        setCustomerOptions(data.clients || []);
      } catch (error) {
        toast.error("Não foi possível buscar clientes");
      } finally {
        setCustomerLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [customerSearch]);

  const filteredCatalog = useMemo(() => {
    const term = catalogSearch.toLowerCase();
    const list = catalogTab === "services" ? services : products;
    return list.filter(entry =>
      !term ||
      entry.nome?.toLowerCase().includes(term) ||
      entry.descricao?.toLowerCase().includes(term)
    );
  }, [catalogSearch, catalogTab, products, services]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const discounts = items.reduce((acc, item) => acc + (item.discount || 0), 0);
    const total = subtotal - discounts;
    return { subtotal, discounts, total };
  }, [items]);

  const getProductVariationGroups = useCallback(product => {
    if (!product || !Array.isArray(product.variacoes) || !product.variacoes.length) {
      return [];
    }
    const map = new Map();
    product.variacoes.forEach(variacao => {
      const option = variacao.opcao;
      const group = option?.grupo;
      if (!option || !group) return;
      if (!map.has(group.id)) {
        map.set(group.id, {
          id: group.id,
          nome: group.nome,
          options: []
        });
      }
      map.get(group.id).options.push({
        id: option.id,
        nome: option.nome,
        valorOverride:
          variacao.valorOverride !== null && variacao.valorOverride !== undefined
            ? Number(variacao.valorOverride)
            : null
      });
    });
    return Array.from(map.values());
  }, []);

  const handleVariationSelect = (productId, groupId, optionId) => {
    const parsedOption = optionId ? Number(optionId) : undefined;
    setSelectedVariations(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [groupId]: parsedOption
      }
    }));
  };

  const handleAddItem = source => {
    if (!source) return;
    const itemType = catalogTab === "services" ? "service" : "product";
    const variationGroups = itemType === "product" ? getProductVariationGroups(source) : [];
    let variationLabel = "";
    let variationKey = null;
    let overridePrice = null;

    if (variationGroups.length) {
      const selection = selectedVariations[source.id] || {};
      const missing = variationGroups.some(group => !selection[group.id]);
      if (missing) {
        toast.warn("Selecione as variações deste produto antes de adicionar");
        return;
      }
      const descriptors = [];
      const keyParts = [];
      variationGroups.forEach(group => {
        const option = group.options.find(opt => opt.id === selection[group.id]);
        if (option) {
          descriptors.push(`${group.nome}: ${option.nome}`);
          keyParts.push(`${group.id}:${option.id}`);
          if (option.valorOverride !== null && option.valorOverride !== undefined) {
            overridePrice = Number(option.valorOverride);
          }
        }
      });
      variationLabel = descriptors.join(" | ");
      variationKey = keyParts.sort().join("|");
    }

    const baseUnitPrice = Number(
      itemType === "service"
        ? source.valorComDesconto ?? source.valorOriginal ?? 0
        : source.valor ?? 0
    );
    const finalUnitPrice = overridePrice ?? baseUnitPrice;
    const variationKeyValue = variationGroups.length ? variationKey : null;

    setItems(prev => {
      const existingIndex = prev.findIndex(item => {
        if (item.itemType !== itemType || item.resourceId !== source.id) return false;
        if (itemType === "service") return true;
        return (item.variationKey || null) === variationKeyValue;
      });

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        next[existingIndex].total =
          next[existingIndex].quantity * next[existingIndex].unitPrice - (next[existingIndex].discount || 0);
        return next;
      }

      return [
        ...prev,
        {
          tempId: `${catalogTab}-${source.id}-${Date.now()}`,
          itemType,
          resourceId: source.id,
          name: source.nome,
          description: source.descricao,
          quantity: 1,
          unitPrice: finalUnitPrice,
          discount: 0,
          total: finalUnitPrice,
          variationKey: variationKeyValue,
          variationLabel: variationLabel || null,
          variationSelection: variationGroups.length ? { ...(selectedVariations[source.id] || {}) } : null
        }
      ];
    });
  };

  const handleQuantityChange = (tempId, delta) => {
    setItems(prev =>
      prev
        .map(item => {
          if (item.tempId !== tempId) return item;
          const nextQuantity = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: nextQuantity,
            total: nextQuantity * item.unitPrice - (item.discount || 0)
          };
        })
        .filter(Boolean)
    );
  };

  const handleDiscountChange = (tempId, value) => {
    const parsed = Math.max(0, Number(value) || 0);
    setItems(prev =>
      prev.map(item => {
        if (item.tempId !== tempId) return item;
        return {
          ...item,
          discount: parsed,
          total: item.quantity * item.unitPrice - parsed
        };
      })
    );
  };

  const handleRemoveItem = tempId => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const buildPayloadItems = () =>
    items.map(item => ({
      itemType: item.itemType,
      serviceId: item.itemType === "service" ? item.resourceId : undefined,
      productId: item.itemType === "product" ? item.resourceId : undefined,
      description: item.variationLabel ? `${item.name} (${item.variationLabel})` : item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount
    }));

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.warn("Selecione um cliente");
      return;
    }
    if (!items.length) {
      toast.warn("Adicione pelo menos um item");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        pagamentoTipo: paymentType || null,
        entregaPrevista: deliveryDate || null,
        garantiaFlag,
        garantiaPrazoDias: garantiaFlag ? Number(garantiaPrazoDias || 0) : null,
        observacoesInternas: internalNotes || null,
        observacoesCliente: customerNotes || null,
        items: buildPayloadItems()
      };
      let data;
      if (isEditing) {
        data = await updateServiceOrder(orderId, payload);
      } else {
        data = await createServiceOrder(payload);
      }
      if (onSaved) {
        onSaved(data);
      }
      handleReset();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Não foi possível criar a ordem de serviço"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setPaymentType("");
    setGarantiaFlag(false);
    setGarantiaPrazoDias("30");
    setDeliveryDate("");
    setInternalNotes("");
    setCustomerNotes("");
    setItems([]);
    setCatalogTab("services");
    setCatalogSearch("");
    setSelectedVariations({});
    setPrefillLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle disableTypography className={classes.modalTitle}>
        <Typography variant="h6" style={{ fontWeight: 700 }}>
          {isEditing ? "Editar Ordem de Serviço" : "PDV de Ordem de Serviço"}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.modalContent}>
        {prefillLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
            <CircularProgress />
          </Box>
        ) : (
        <Grid container spacing={3} className={classes.modalGrid}>
          <Grid item xs={12} md={4}>
            <div className={classes.panelCard}>
              <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 700 }}>
                1. Cliente
              </Typography>
              <Autocomplete
                options={customerOptions}
                getOptionLabel={option => `${option.name || "Sem nome"} - ${option.phone || option.email || ""}`}
                loading={customerLoading}
                onInputChange={(e, value) => setCustomerSearch(value)}
                onChange={(e, option) => setSelectedCustomer(option)}
                value={selectedCustomer}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Busque cliente por nome, telefone ou email"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {customerLoading ? <CircularProgress size={18} color="inherit" /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
              <TextField
                label="Pagamento"
                variant="outlined"
                select
                fullWidth
                value={paymentType}
                onChange={event => setPaymentType(event.target.value)}
                margin="normal"
              >
                {PAYMENT_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Previsão de entrega"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={deliveryDate}
                onChange={event => setDeliveryDate(event.target.value)}
                margin="normal"
              />
              <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                <Typography variant="body2" color="textSecondary">
                  Garantia estendida
                </Typography>
                <Switch
                  color="primary"
                  checked={garantiaFlag}
                  onChange={event => setGarantiaFlag(event.target.checked)}
                />
              </Box>
              {garantiaFlag && (
                <TextField
                  label="Dias de garantia"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={garantiaPrazoDias}
                  onChange={event => setGarantiaPrazoDias(event.target.value)}
                  margin="normal"
                />
              )}
              <TextField
                label="Observações internas"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                value={internalNotes}
                onChange={event => setInternalNotes(event.target.value)}
                margin="normal"
              />
              <TextField
                label="Observações para o cliente"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                value={customerNotes}
                onChange={event => setCustomerNotes(event.target.value)}
                margin="normal"
              />
            </div>

            <div className={classes.panelCard}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                  2. Itens adicionados
                </Typography>
                <ShoppingCartIcon color="primary" />
              </Box>
              <div className={classes.cartContainer}>
                {items.map(item => (
                  <div key={item.tempId} className={classes.cartItem}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography style={{ fontWeight: 600 }}>{item.name}</Typography>
                      <Chip
                        size="small"
                        label={item.itemType === "service" ? "Serviço" : "Produto"}
                        color={item.itemType === "service" ? "secondary" : "default"}
                      />
                    </Box>
                    {item.variationLabel && (
                      <Typography variant="caption" color="textSecondary">
                        {item.variationLabel}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      {item.description?.slice(0, 140) || "Sem descrição"}
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={5}>
                        <Box display="flex" alignItems="center" gap={8}>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.tempId, -1)}>
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                          <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.tempId, 1)}>
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Desconto"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={item.discount}
                          onChange={event => handleDiscountChange(item.tempId, event.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalOfferIcon fontSize="small" />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <IconButton size="small" onClick={() => handleRemoveItem(item.tempId)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        R$ {item.unitPrice.toFixed(2)} un.
                      </Typography>
                      <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                        {currency(item.total)}
                      </Typography>
                    </Box>
                  </div>
                ))}
                {!items.length && (
                  <Box textAlign="center" py={2} color="text.secondary">
                    Adicione serviços ou produtos à venda.
                  </Box>
                )}
              </div>
              <Divider style={{ margin: "16px 0" }} />
              <div className={classes.totalsBox}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>{currency(totals.subtotal)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Descontos</Typography>
                  <Typography>- {currency(totals.discounts)}</Typography>
                </Box>
                <Divider light style={{ opacity: 0.3 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Total a pagar</Typography>
                  <Typography variant="h6">{currency(totals.total)}</Typography>
                </Box>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={8}>
            <div className={classes.catalogWrapper}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box className={classes.catalogChips}>
                  <Chip
                    icon={<LocalMallIcon />}
                    label="Serviços"
                    color={catalogTab === "services" ? "primary" : "default"}
                    onClick={() => setCatalogTab("services")}
                  />
                  <Chip
                    icon={<ShoppingCartIcon />}
                    label="Produtos"
                    color={catalogTab === "products" ? "primary" : "default"}
                    onClick={() => setCatalogTab("products")}
                  />
                </Box>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar no catálogo"
                  value={catalogSearch}
                  onChange={event => setCatalogSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              <Divider />
              <div className={classes.catalogGrid}>
                {catalogLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  filteredCatalog.map(entry => (
                    <div key={`${catalogTab}-${entry.id}`} className={classes.catalogCard}>
                      <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                        {entry.nome || "Sem nome"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {entry.descricao?.length > 70
                          ? `${entry.descricao.slice(0, 70)}…`
                          : entry.descricao || "Sem descrição"}
                      </Typography>
                      <Typography variant="h6">
                        {currency(
                          catalogTab === "services"
                            ? entry.valorComDesconto ?? entry.valorOriginal ?? 0
                            : entry.valor ?? 0
                        )}
                      </Typography>
                      {(() => {
                        const variationGroups =
                          catalogTab === "products" ? getProductVariationGroups(entry) : [];
                        const selection = selectedVariations[entry.id] || {};
                        const hasVariations = variationGroups.length > 0;
                        const canAdd = !hasVariations || variationGroups.every(group => selection[group.id]);

                        if (hasVariations) {
                          return (
                            <div className={classes.variationSelectors}>
                              {variationGroups.map(group => (
                                <TextField
                                  key={`${entry.id}-group-${group.id}`}
                                  select
                                  variant="outlined"
                                  size="small"
                                  label={group.nome}
                                  value={selection[group.id] || ""}
                                  onChange={event =>
                                    handleVariationSelect(entry.id, group.id, event.target.value)
                                  }
                                  className={classes.variationSelect}
                                >
                                  <MenuItem value="">
                                    <em>Selecione</em>
                                  </MenuItem>
                                  {group.options.map(option => (
                                    <MenuItem key={option.id} value={option.id}>
                                      {option.nome}
                                      {option.valorOverride !== null && option.valorOverride !== undefined
                                        ? ` • ${currency(option.valorOverride)}`
                                        : ""}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ))}
                              <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => handleAddItem(entry)}
                                disabled={!canAdd}
                              >
                                Adicionar
                              </Button>
                            </div>
                          );
                        }

                        return (
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleAddItem(entry)}
                            disabled={!canAdd}
                          >
                            Adicionar
                          </Button>
                        );
                      })()}
                    </div>
                  ))
                )}
                {!catalogLoading && !filteredCatalog.length && (
                  <Box textAlign="center" color="text.secondary" gridColumn="1 / -1">
                    Nenhum item encontrado.
                  </Box>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
        )}
      </DialogContent>
      <DialogActions style={{ padding: "16px 24px" }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Finalizar venda
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceOrderModal;
