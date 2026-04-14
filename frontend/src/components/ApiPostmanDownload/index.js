import React, { useState } from "react";
import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const buildUrlObject = rawUrl => {
  try {
    const url = new URL(rawUrl);
    return {
      raw: rawUrl,
      protocol: url.protocol.replace(":", ""),
      host: url.host.split("."),
      path: url.pathname
        .split("/")
        .filter(Boolean),
      query: url.searchParams.size
        ? Array.from(url.searchParams.entries()).map(([key, value]) => ({
            key,
            value
          }))
        : undefined
    };
  } catch (error) {
    return { raw: rawUrl };
  }
};

const ApiPostmanDownload = ({
  collectionName,
  requests,
  filename = "postman-collection.json",
  helperText
}) => {
  const [token, setToken] = useState("");

  const buildCollection = () => {
    const items = requests.map(request => {
      const headers = [
        {
          key: "Authorization",
          value: `Bearer ${token}`,
          type: "text"
        }
      ];

      if (request.method !== "GET" && request.bodyMode !== "formdata") {
        headers.push({
          key: "Content-Type",
          value: "application/json",
          type: "text"
        });
      }

      const baseRequest = {
        name: request.name,
        request: {
          method: request.method,
          header: headers,
          url: buildUrlObject(request.url),
          description: request.description || ""
        }
      };

      if (request.body && request.bodyMode !== "formdata") {
        baseRequest.request.body = {
          mode: "raw",
          raw: JSON.stringify(request.body, null, 2),
          options: {
            raw: {
              language: "json"
            }
          }
        };
      }

      if (request.bodyMode === "formdata") {
        baseRequest.request.body = {
          mode: "formdata",
          formdata: request.formData || []
        };
      }

      return baseRequest;
    });

    return {
      info: {
        _postman_id: uuidv4(),
        name: collectionName,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: items
    };
  };

  const handleDownload = () => {
    if (!token) {
      toast.error("Informe o token antes de baixar a coleção.");
      return;
    }

    const collection = buildCollection();
    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Box mt={2} mb={2}>
      <Typography variant="subtitle1" gutterBottom>
        Baixar coleção Postman
      </Typography>
      {helperText && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {helperText}
        </Typography>
      )}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <TextField
            label="Token da API"
            variant="outlined"
            margin="dense"
            fullWidth
            value={token}
            onChange={event => setToken(event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            startIcon={<GetAppIcon />}
            variant="contained"
            color="primary"
            onClick={handleDownload}
          >
            Baixar JSON
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApiPostmanDownload;
