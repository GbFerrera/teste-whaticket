import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import { openApi } from '../../services/api';

// Cache global para evitar múltiplas chamadas
let cachedLoadingImage = null;
let loadingImagePromise = null;

const CustomLoader = ({ 
  size = 30,
  color = '#9c27b0',
  text = '',
  style = {}
}) => {
  const [loadingImage, setLoadingImage] = useState(cachedLoadingImage);

  useEffect(() => {
    // Se já temos cache, usar imediatamente
    if (cachedLoadingImage !== null) {
      setLoadingImage(cachedLoadingImage);
      return;
    }

    // Se já existe uma promise em andamento, reusar
    if (loadingImagePromise) {
      loadingImagePromise.then(img => {
        setLoadingImage(img);
      });
      return;
    }

    // Buscar a imagem de loading dos settings públicos (não precisa autenticação)
    console.log('[CustomLoader] Buscando appLogoLoading da API...');
    loadingImagePromise = openApi.get('/public-settings/appLogoLoading', {
      params: { token: 'wtV' }
    })
      .then(({ data }) => {
        console.log('[CustomLoader] Resposta da API:', data);
        // A API retorna diretamente o valor
        cachedLoadingImage = data || '';
        console.log('[CustomLoader] Imagem em cache:', cachedLoadingImage);
        return cachedLoadingImage;
      })
      .catch(err => {
        console.error('[CustomLoader] Erro ao carregar imagem de loading:', err);
        cachedLoadingImage = '';
        return '';
      })
      .finally(() => {
        loadingImagePromise = null;
      });

    loadingImagePromise.then(img => {
      setLoadingImage(img);
    });
  }, []);

  if (loadingImage) {
    return (
      <img 
        src={`${process.env.REACT_APP_BACKEND_URL}/public/${loadingImage}`}
        alt="Loading..."
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          ...style
        }}
      />
    );
  }

  // Fallback para CircularProgress padrão
  return <CircularProgress size={size} style={{ color, ...style }} />;
};

export default CustomLoader;
