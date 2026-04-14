import React from "react";
import { IconButton, Tooltip, makeStyles } from "@material-ui/core";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { useNodeStorage } from "../../stores/useNodeStorage";

const useStyles = makeStyles(() => ({
  wrapper: {
    position: "relative",
    display: "inline-block",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
  },
  previewRing: {
    boxShadow: "0 0 0 3px rgba(59,130,246,0.6)",
    transform: "translateY(-2px)",
  },
  badge: {
    position: "absolute",
    top: -32,
    left: 0,
    transform: "translateY(-4px)",
    backgroundColor: "#111827",
    color: "#f9fafb",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    pointerEvents: "none",
    maxWidth: "260px",
  },
  title: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  groupBadge: {
    position: "absolute",
    bottom: -28,
    left: 0,
    backgroundColor: "#1d4ed8",
    color: "#fff",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: 11,
    fontWeight: 600,
    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
    maxWidth: 200,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    pointerEvents: "none",
  },
  groupPreview: {
    backgroundColor: "rgba(59,130,246,0.12)",
    color: "#1e3a8a",
    border: "1px dashed #3b82f6",
  },
  button: {
    width: 20,
    height: 20,
    padding: 2,
    pointerEvents: "auto",
    backgroundColor: "#1f2937",
    color: "#f9fafb",
    "&:hover": {
      backgroundColor: "#374151",
    },
  },
}));

const withNodeTitle = (NodeComponent, defaultTitle) => {
  const WrappedNode = (props) => {
    const classes = useStyles();
    const storage = useNodeStorage();
    const title = (props.data && props.data.title) || defaultTitle;
    const groupLabel = props.data?.groupLabel;
    const groupColor = props.data?.groupColor;
    const isPreview = Boolean(props.data?.groupPreview);

    const handleRename = (event) => {
      event.stopPropagation();
      storage.setNodesStorage(props.id);
      storage.setAct("rename");
    };

    return (
      <div
        className={`${classes.wrapper} ${isPreview ? classes.previewRing : ""}`}
      >
        <div className={classes.badge}>
          <span className={classes.title}>{title}</span>
          <Tooltip title="Renomear bloco">
            <IconButton
              size="small"
              className={classes.button}
              onClick={handleRename}
            >
              <DriveFileRenameOutlineIcon style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </div>
        {(groupLabel || isPreview) && (
          <div
            className={`${classes.groupBadge} ${isPreview ? classes.groupPreview : ""}`}
            style={!isPreview && groupColor ? { backgroundColor: groupColor } : undefined}
          >
            {groupLabel || "Selecionando..."}
          </div>
        )}
        <NodeComponent {...props} />
      </div>
    );
  };

  WrappedNode.displayName = `NodeWithTitle(${NodeComponent.displayName || NodeComponent.name || "Component"})`;

  return WrappedNode;
};

export default withNodeTitle;
