import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import api from "../../services/api";
import { getProject } from "../../services/projectService";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 500,
    paddingTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      minWidth: "unset"
    }
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    maxHeight: 400,
    overflowY: "auto"
  },
  taskItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.default,
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`
  },
  taskContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5)
  },
  taskTitle: {
    fontWeight: 500,
    textDecoration: (props) => props.completed ? "line-through" : "none",
    color: (props) => props.completed ? theme.palette.text.secondary : theme.palette.text.primary
  },
  taskUsers: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5)
  },
  addTaskRow: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "flex-start"
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  userSelectContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

const ProjectTasksModal = ({ open, onClose, projectId, onSuccess }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (!open || !projectId) {
      setProject(null);
      setTasks([]);
      setNewTaskTitle("");
      setSelectedTaskId(null);
      setSelectedUserId("");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectData, usersRes] = await Promise.all([
          getProject(projectId),
          api.get("/users", { params: { limit: 100 } })
        ]);
        setProject(projectData);
        setTasks(projectData.tasks || []);
        setUsers(usersRes.data.users || usersRes.data || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, projectId]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Digite o título da tarefa");
      return;
    }

    setSaving(true);
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: newTaskTitle.trim(),
        status: "pending"
      });
      setTasks([...tasks, response.data]);
      setNewTaskTitle("");
      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await api.put(`/projects/tasks/${task.id}`, { status: newStatus });
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/projects/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    }
  };

  const handleAddUserToTask = async (taskId) => {
    if (!selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }

    try {
      await api.post(`/projects/tasks/${taskId}/users`, {
        userId: selectedUserId
      });
      
      // Atualizar a lista de tarefas
      const user = users.find(u => u.id === selectedUserId);
      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          const taskUsers = t.taskUsers || [];
          return {
            ...t,
            taskUsers: [...taskUsers, { user, userId: selectedUserId }]
          };
        }
        return t;
      }));
      
      setSelectedTaskId(null);
      setSelectedUserId("");
      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    }
  };

  const handleRemoveUserFromTask = async (taskId, userId) => {
    try {
      await api.delete(`/projects/tasks/${taskId}/users/${userId}`);
      
      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            taskUsers: (t.taskUsers || []).filter(tu => (tu.user?.id || tu.userId) !== userId)
          };
        }
        return t;
      }));
      
      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    }
  };

  const getTaskUsers = (task) => {
    return (task.taskUsers || []).map(tu => tu.user).filter(u => u && u.id);
  };

  const getAvailableUsersForTask = (task) => {
    const taskUserIds = getTaskUsers(task).map(u => u.id);
    return users.filter(u => !taskUserIds.includes(u.id));
  };

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Tarefas do Projeto
        {project && (
          <Typography variant="body2" color="textSecondary">
            {project.name} • {completedCount}/{tasks.length} concluídas ({progress}%)
          </Typography>
        )}
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box className={classes.addTaskRow}>
              <TextField
                label="Nova tarefa"
                variant="outlined"
                fullWidth
                size="small"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                disabled={saving}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddTask}
                disabled={saving || !newTaskTitle.trim()}
                startIcon={<AddIcon />}
              >
                Adicionar
              </Button>
            </Box>

            {tasks.length === 0 ? (
              <Box className={classes.emptyState}>
                <Typography variant="body1">Nenhuma tarefa cadastrada</Typography>
                <Typography variant="body2">
                  Adicione tarefas para acompanhar o progresso do projeto
                </Typography>
              </Box>
            ) : (
              <Box className={classes.taskList}>
                {tasks.map((task) => (
                  <Box key={task.id} className={classes.taskItem}>
                    <Checkbox
                      checked={task.status === "completed"}
                      onChange={() => handleToggleTask(task)}
                      color="primary"
                    />
                    <Box className={classes.taskContent}>
                      <Typography 
                        className={classes.taskTitle}
                        style={{
                          textDecoration: task.status === "completed" ? "line-through" : "none",
                          color: task.status === "completed" ? "#9ca3af" : "inherit"
                        }}
                      >
                        {task.title}
                      </Typography>
                      
                      <Box className={classes.taskUsers}>
                        {getTaskUsers(task).map((user) => (
                          <Chip
                            key={user.id}
                            label={user.name}
                            size="small"
                            onDelete={() => handleRemoveUserFromTask(task.id, user.id)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        
                        {selectedTaskId === task.id ? (
                          <Box className={classes.userSelectContainer}>
                            <FormControl size="small" style={{ minWidth: 150 }}>
                              <Select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="" disabled>Selecionar</MenuItem>
                                {getAvailableUsersForTask(task).map((user) => (
                                  <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleAddUserToTask(task.id)}
                              disabled={!selectedUserId}
                            >
                              OK
                            </Button>
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedTaskId(null);
                                setSelectedUserId("");
                              }}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => setSelectedTaskId(task.id)}
                            title="Adicionar responsável"
                          >
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Excluir tarefa"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectTasksModal;
