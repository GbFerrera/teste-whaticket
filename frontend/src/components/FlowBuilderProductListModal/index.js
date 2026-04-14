import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Box,
  Typography,
  Chip,
  Checkbox,
  IconButton,
  Divider,
  makeStyles,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDialog-paper": {
      minWidth: "600px",
      maxWidth: "800px",
      maxHeight: "80vh",
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
  },
  dialogContent: {
    padding: "0 24px 24px 24px",
  },
  searchContainer: {
    position: "relative",
    marginBottom: "20px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 44px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    "&:focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "12px",
    marginTop: "20px",
  },
  itemGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "12px",
    maxHeight: "300px",
    overflowY: "auto",
    padding: "4px",
  },
  itemCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#f8fafc",
    },
    "&.selected": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
    },
  },
  itemName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: "4px",
  },
  itemPrice: {
    fontSize: "13px",
    color: "#6b7280",
  },
  itemType: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    marginTop: "6px",
  },
  productType: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  serviceType: {
    backgroundColor: "#f3e8ff",
    color: "#6b21a8",
  },
  selectedCount: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "500",
    marginLeft: "8px",
  },
  dialogActions: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelButton: {
    color: "#6b7280",
    borderColor: "#e5e7eb",
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f9fafb",
    },
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
    "&:disabled": {
      backgroundColor: "#9ca3af",
      color: "#ffffff",
    },
  },
}));

const FlowBuilderProductListModal = ({ open, onClose, onSave, data }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  
  const [listType, setListType] = useState(data?.listType || "all");
  const [title, setTitle] = useState(data?.title || "🛍️ Nossos Produtos e Serviços");
  const [selectedItems, setSelectedItems] = useState(data?.selectedItems || []);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Buscando produtos e serviços...");
        
        // Buscar produtos
        const productsResponse = await api.get("/produtos", {
          params: { companyId: user.companyId }
        });
        console.log("Produtos recebidos:", productsResponse.data);
        setProducts(productsResponse.data || []);

        // Buscar serviços
        const servicesResponse = await api.get("/servicos", {
          params: { companyId: user.companyId }
        });
        console.log("Serviços recebidos:", servicesResponse.data);
        setServices(servicesResponse.data || []);
        
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        toastError(err);
        // Setar arrays vazios para não travar
        setProducts([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, user.companyId]);

  const handleSave = () => {
    const nodeData = {
      title,
      listType,
      selectedItems: listType === "all" ? [] : selectedItems,
    };
    onSave(nodeData);
    onClose();
  };

  const handleToggleItem = (item, type) => {
    const itemId = `${type}_${item.id}`;
    
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = (type, items) => {
    const itemIds = items.map(item => `${type}_${item.id}`);
    const allSelected = itemIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedItems(selectedItems.filter(id => !itemIds.includes(id)));
    } else {
      // Select all
      setSelectedItems([...new Set([...selectedItems, ...itemIds])]);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome && product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.nome && service.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProductsCount = filteredProducts.filter(p => 
    selectedItems.includes(`product_${p.id}`)
  ).length;

  const selectedServicesCount = filteredServices.filter(s => 
    selectedItems.includes(`service_${s.id}`)
  ).length;

  return (
    <Dialog open={open} onClose={onClose} className={classes.root}>
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6" style={{ fontSize: "18px", fontWeight: "600" }}>
          Configurar Lista de Produtos
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {/* Título Personalizado */}
        <Typography className={classes.sectionTitle}>Título da Mensagem</Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="🛍️ Nossos Produtos e Serviços"
          style={{ marginBottom: "20px" }}
          helperText="Título que aparecerá no início da mensagem"
        />

        {/* Tipo de Lista */}
        <Typography className={classes.sectionTitle}>Tipo de Lista</Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={listType}
            onChange={(e) => setListType(e.target.value)}
          >
            <FormControlLabel
              value="all"
              control={<Radio color="primary" />}
              label="Mostrar todos os produtos e serviços"
            />
            <FormControlLabel
              value="selected"
              control={<Radio color="primary" />}
              label="Mostrar apenas itens selecionados"
            />
          </RadioGroup>
        </FormControl>

        {/* Busca */}
        <div className={classes.searchContainer}>
          <SearchIcon className={classes.searchIcon} />
          <input
            type="text"
            placeholder="Buscar produtos ou serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={classes.searchInput}
          />
        </div>

        {/* Lista de Itens - apenas quando listType === "selected" */}
        {listType === "selected" && (
          <>
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <Box mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Typography variant="body2" color="textSecondary">
                  Debug: Produtos={products.length}, Serviços={services.length}, Loading={loading.toString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  CompanyId: {user.companyId}
                </Typography>
              </Box>
            )}
            
            {loading ? (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">
                  Carregando produtos e serviços...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Produtos */}
                {filteredProducts.length > 0 && (
              <>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography className={classes.sectionTitle}>
                    Produtos
                    <span className={classes.selectedCount}>
                      {selectedProductsCount} de {filteredProducts.length}
                    </span>
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll("product", filteredProducts)}
                    style={{ fontSize: "12px" }}
                  >
                    {selectedProductsCount === filteredProducts.length ? "Deselecionar todos" : "Selecionar todos"}
                  </Button>
                </Box>
                <div className={classes.itemGrid}>
                  {filteredProducts.map((product) => {
                    const isSelected = selectedItems.includes(`product_${product.id}`);
                    return (
                      <div
                        key={`product_${product.id}`}
                        className={`${classes.itemCard} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleToggleItem(product, "product")}
                      >
                        <Typography className={classes.itemName}>
                          {product.nome || "Produto sem nome"}
                        </Typography>
                        <Typography className={classes.itemPrice}>
                          {product.valor ? `R$ ${parseFloat(product.valor).toFixed(2)}` : "Preço não definido"}
                        </Typography>
                        <span className={`${classes.itemType} ${classes.productType}`}>
                          Produto
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Serviços */}
            {filteredServices.length > 0 && (
              <>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography className={classes.sectionTitle}>
                    Serviços
                    <span className={classes.selectedCount}>
                      {selectedServicesCount} de {filteredServices.length}
                    </span>
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll("service", filteredServices)}
                    style={{ fontSize: "12px" }}
                  >
                    {selectedServicesCount === filteredServices.length ? "Deselecionar todos" : "Selecionar todos"}
                  </Button>
                </Box>
                <div className={classes.itemGrid}>
                  {filteredServices.map((service) => {
                    const isSelected = selectedItems.includes(`service_${service.id}`);
                    return (
                      <div
                        key={`service_${service.id}`}
                        className={`${classes.itemCard} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleToggleItem(service, "service")}
                      >
                        <Typography className={classes.itemName}>
                          {service.nome || "Serviço sem nome"}
                        </Typography>
                        <Typography className={classes.itemPrice}>
                          {service.possuiDesconto && service.valorComDesconto 
                            ? `R$ ${parseFloat(service.valorComDesconto).toFixed(2)} (com desconto)`
                            : service.valorOriginal 
                              ? `R$ ${parseFloat(service.valorOriginal).toFixed(2)}`
                              : "Preço não definido"
                          }
                        </Typography>
                        <span className={`${classes.itemType} ${classes.serviceType}`}>
                          Serviço
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {filteredProducts.length === 0 && filteredServices.length === 0 && !loading && (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">
                  Nenhum produto ou serviço encontrado
                </Typography>
              </Box>
            )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <div className={classes.dialogActions}>
        <Typography variant="body2" color="textSecondary">
          {listType === "all" 
            ? "Todos os produtos e serviços serão exibidos"
            : `${selectedItems.length} itens selecionados`
          }
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            onClick={onClose}
            variant="outlined"
            className={classes.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            className={classes.saveButton}
            disabled={listType === "selected" && selectedItems.length === 0}
          >
            Salvar
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};

export default FlowBuilderProductListModal;
