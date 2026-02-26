import React from "react";
import { useForm } from "react-hook-form";
import type { Task } from "../../../types/task";
import {
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

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  initialData?: Partial<Task>;
  title: string;
  loading?: boolean;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  title,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Partial<Task>>({
    defaultValues: initialData,
  });

  const closeHandler = () => {
    reset(initialData);
    onClose();
  };

  const submitHandler = async (data: Partial<Task>) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={closeHandler} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(submitHandler)}>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            fullWidth
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message as string}
            disabled={isSubmitting || loading}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register("description")}
            disabled={isSubmitting || loading}
          />
          <FormControl fullWidth disabled={isSubmitting || loading}>
            <InputLabel>Priority</InputLabel>
            <Select
              defaultValue={initialData.priority || "medium"}
              label="Priority"
              {...register("priority", { required: true })}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth disabled={isSubmitting || loading}>
            <InputLabel>Column</InputLabel>
            <Select
              defaultValue={initialData.column || "Backlog"}
              label="Column"
              {...register("column", { required: true })}>
              <MenuItem value="Backlog">Backlog</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHandler} disabled={isSubmitting || loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loading}
            sx={{ textTransform: "none" }}>
            {loading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskDialog;