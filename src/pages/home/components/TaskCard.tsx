import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { Task } from "../../../types/task";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDelete } from "../../../hooks/useDelete";
import { useEdit } from "../../../hooks/useEdit";

const priorityStyles = {
  high: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
  },
  medium: {
    backgroundColor: "#FFEDD5",
    color: "#EA580C",
  },
  low: {
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
  },
};

const TaskCard = ({ task }: { task: Task }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteTaskMutation = useDelete("tasks");
  const editTaskMutation = useEdit<Partial<Task>>("tasks");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<Partial<Task>>({
      defaultValues: task,
    });

  const handleEditOpen = () => {
    reset(task);
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
  };

  const handleSaveEdit = async (data: Partial<Task>) => {
    try {
      await editTaskMutation.mutateAsync({
        endpoint: "tasks",
        id: task._id,
        data,
      });

      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('fetch');
        },
      });

      setOpenEditDialog(false);
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDelete = async () => {
    if (globalThis.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTaskMutation.mutateAsync({
          endpoint: "tasks",
          id: task._id,
        });

        // Invalidate all fetch queries to refresh data in Board
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === 'string' && key.startsWith('fetch');
          },
        });
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          mb: 2,
        }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F2937" }}>
                {task.title}
              </Typography>

              <Typography variant="body2" sx={{ color: "#6B7280", mt: 1 }}>
                {task.description}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={task.priority}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    ...priorityStyles[task.priority],
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
              <IconButton
                size="small"
                onClick={handleEditOpen}
                sx={{ color: "#3B82F6" }}
                disabled={editTaskMutation.isPending || deleteTaskMutation.isPending}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{ color: "#EF4444" }}
                disabled={deleteTaskMutation.isPending || editTaskMutation.isPending}>
                {deleteTaskMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <form onSubmit={handleSubmit(handleSaveEdit)}>
          <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message as string}
              disabled={isSubmitting || editTaskMutation.isPending}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              {...register("description")}
              disabled={isSubmitting || editTaskMutation.isPending}
            />
            <FormControl fullWidth disabled={isSubmitting || editTaskMutation.isPending}>
              <InputLabel>Priority</InputLabel>
              <Select
                defaultValue={task.priority}
                label="Priority"
                {...register("priority", { required: true })}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} disabled={isSubmitting || editTaskMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || editTaskMutation.isPending}
              sx={{ textTransform: "none" }}>
              {editTaskMutation.isPending ? <CircularProgress size={20} /> : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TaskCard;
