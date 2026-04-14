# AtendZappy SaaS - Versão com Traefik

Este é uma versão modificada do script de instalação do AtendZappy SaaS que substitui o Nginx pelo Traefik como proxy reverso.

## Principais Mudanças

### Substituição do Nginx por Traefik

- **Nginx removido**: Todas as funções relacionadas ao Nginx foram substituídas
- **Traefik adicionado**: Proxy reverso moderno com auto-descoberta de serviços
- **SSL automático**: Certificados Let's Encrypt gerenciados automaticamente
- **Dashboard**: Interface web de administração do Traefik

## Vantagens do Traefik

1. **Auto-descoberta**: Configuração automática de novos serviços
2. **SSL/TLS automático**: Certificados Let's Encrypt renovados automaticamente
3. **Load Balancer**: Balanceamento de carga integrado
4. **Dashboard**: Interface web para monitoramento
5. **Menos configuração**: Configuração dinâmica baseada em arquivos

## Arquivos Criados

- `atendzappy-traefik`: Script principal modificado
- `traefik_static_conf.toml`: Configuração estática do Traefik (template)
- `traefik_dynamic_conf.toml`: Configuração dinâmica do Traefik (template)
- `README-TRAEFIK.md`: Este arquivo de documentação

## Como Usar

### Instalação Nova

1. Torne o script executável:
   ```bash
   chmod +x atendzappy-traefik
   ```

2. Execute o script:
   ```bash
   sudo ./atendzappy-traefik
   ```

3. Siga as instruções do menu interativo

### Acesso ao Dashboard Traefik

Após a instalação, acesse o dashboard do Traefik em:
```
http://IP_DO_SERVIDOR:8080/dashboard/
```

O IP do servidor é mostrado no final da instalação.

## Configurações do Traefik

### Configuração Estática
Arquivo: `/etc/traefik/traefik.toml`

- EntryPoints: HTTP (80) e HTTPS (443)
- Redirecionamento automático HTTP para HTTPS
- Resolvedor Let's Encrypt para SSL automático
- Dashboard na porta 8080
- Provider Docker para auto-descoberta
- Provider File para configuração dinâmica

### Configuração Dinâmica
Arquivo: `/etc/traefik/dynamic-conf/{instancia}-config.toml`

Cada instância tem seu próprio arquivo de configuração dinâmica com:
- Routers para frontend e backend
- Services com load balancer
- Configuração TLS automática

## Comandos Úteis

### Gerenciar Traefik
```bash
# Ver status do container Traefik
sudo docker ps | grep traefik

# Ver logs do Traefik
sudo docker logs traefik

# Reiniciar Traefik
sudo docker restart traefik

# Acessar o container
sudo docker exec -it traefik sh
```

### Gerenciar Instâncias
```bash
# Ver status do PM2
sudo pm2 status

# Ver logs de uma instância
sudo pm2 logs {instancia}-backend
sudo pm2 logs {instancia}-frontend

# Reiniciar serviços
sudo pm2 restart all
```

## Estrutura de Diretórios

```
/etc/traefik/
|-- traefik.toml                    # Configuração estática
|-- acme.json                       # Certificados SSL
|-- dynamic-conf/
|   |-- {instancia}-config.toml     # Configuração por instância
|-- logs/                           # Logs do Traefik
```

## Portas Utilizadas

- **80**: HTTP (redirecionado para HTTPS)
- **443**: HTTPS (frontend/backend)
- **8080**: Dashboard Traefik
- **3000-3999**: Frontend (interno)
- **4000-4999**: Backend (interno)
- **5000-5999**: Redis (interno)

## Segurança

- Dashboard do Traefik exposto apenas para desenvolvimento
- Em produção, considere restringir acesso ao dashboard
- Certificados SSL automáticos via Let's Encrypt
- Configuração de firewall recomendada

## Troubleshooting

### Problemas Comuns

1. **Container Traefik não inicia**
   ```bash
   sudo docker logs traefik
   # Verificar configuração em /etc/traefik/traefik.toml
   ```

2. **Certificados SSL não gerados**
   ```bash
   # Verificar arquivo ACME
   sudo cat /etc/traefik/acme.json
   # Verificar logs para erros Let's Encrypt
   sudo docker logs traefik | grep letsencrypt
   ```

3. **Serviços não acessíveis**
   ```bash
   # Verificar configuração dinâmica
   sudo ls -la /etc/traefik/dynamic-conf/
   # Verificar se PM2 está rodando
   sudo pm2 status
   ```

### Logs Importantes

- **Traefik**: `sudo docker logs traefik`
- **PM2**: `sudo pm2 logs`
- **Backend**: `sudo pm2 logs {instancia}-backend`
- **Frontend**: `sudo pm2 logs {instancia}-frontend`

## Migração do Nginx

Se você já tem instalações com Nginx:

1. Faça backup das configurações existentes
2. Pare os serviços Nginx: `sudo systemctl stop nginx`
3. Execute o novo script para novas instalações
4. Para migração, manualmente configure as instâncias existentes no Traefik

## Suporte

Para dúvidas ou problemas:
- Verifique os logs conforme indicado acima
- Consulte a documentação oficial do Traefik
- Entre em contato com o suporte Fae Developer
