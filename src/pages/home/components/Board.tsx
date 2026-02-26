import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import useQuerySearch from "../../../hooks/useQuerySearch";
import { useEdit } from "../../../hooks/useEdit";
import { useCreate } from "../../../hooks/useCreate";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { numbersOfTasks } from "../../../redux/slice";
import  { Columns } from "../../../types/boardTypes";
import type { Task } from "../../../types/task";
import Column from "./Column";
import TaskDialog from "./TaskDialog";
import { Box, Button } from "@mui/material";

function Board() {
  const [search] = useQuerySearch();
  const dispatch = useDispatch();

  const editTaskMutation = useEdit([
    "fetchBacklog",
    "fetchInProgress",
    "fetchReview",
    "fetchDone",
  ]);

  const createTaskMutation = useCreate([
    "fetchBacklog",
    "fetchInProgress",
    "fetchReview",
    "fetchDone",
  ]);

  const [openCreate, setOpenCreate] = useState(false);

  // Infinite scroll hooks for each column
  const backlogData = useInfiniteScroll({
    endpoint: `tasks?column=Backlog&search=${search}`,
    queryKey: ["fetchBacklog", search],
  });

  const inProgressData = useInfiniteScroll({
    endpoint: `tasks?column=In Progress&search=${search}`,
    queryKey: ["fetchInProgress", search],
  });

  const reviewData = useInfiniteScroll({
    endpoint: `tasks?column=Review&search=${search}`,
    queryKey: ["fetchReview", search],
  });

  const doneData = useInfiniteScroll({
    endpoint: `tasks?column=Done&search=${search}`,
    queryKey: ["fetchDone", search],
  });

  const [columns, setColumns] = useState<Columns>({
    Backlog: { tasks: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    "In Progress": { tasks: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    Review: { tasks: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    Done: { tasks: [], total: 0, page: 1, limit: 10, totalPages: 1 },
  });

  const hasLocalChangesRef = useRef(false);

  const handleCreateOpen = () => setOpenCreate(true);
  const handleCreateClose = () => setOpenCreate(false);

  const handleCreateSave = async (data: Partial<Task>) => {
    try {
      await createTaskMutation.mutateAsync({
        endpoint: "tasks",
        data,
      });
      setOpenCreate(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  useEffect(() => {
    // Don't overwrite local drag changes
    if (hasLocalChangesRef.current) return;

    const updatedColumns: Columns = {
      Backlog: {
        tasks: backlogData.tasks,
        total: backlogData.total,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(backlogData.total / 10),
      },
      "In Progress": {
        tasks: inProgressData.tasks,
        total: inProgressData.total,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(inProgressData.total / 10),
      },
      Review: {
        tasks: reviewData.tasks,
        total: reviewData.total,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(reviewData.total / 10),
      },
      Done: {
        tasks: doneData.tasks,
        total: doneData.total,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(doneData.total / 10),
      },
    };

    setColumns(updatedColumns);

    dispatch(
      numbersOfTasks(
        backlogData.total +
          inProgressData.total +
          reviewData.total +
          doneData.total,
      ),
    );
  }, [
    backlogData.tasks,
    backlogData.total,
    inProgressData.tasks,
    inProgressData.total,
    reviewData.tasks,
    reviewData.total,
    doneData.tasks,
    doneData.total,
    dispatch,
  ]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (!sourceColumn || !destColumn) return;

    const sourceTasks = [...sourceColumn.tasks];
    const [removed] = sourceTasks.splice(source.index, 1);

    if (!removed) return;

    // Optimistic update for same column reordering
    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, removed);

      const updatedTasks = sourceTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      // Update local state immediately
      hasLocalChangesRef.current = true;
      setColumns((prev) => ({
        ...prev,
        [source.droppableId]: {
          ...sourceColumn,
          tasks: updatedTasks,
        },
      }));

      // Update all affected tasks via mutation (no refetch)
      const minIndex = Math.min(source.index, destination.index);
      const maxIndex = Math.max(source.index, destination.index);
      const tasksToUpdate = updatedTasks.slice(minIndex, maxIndex + 1);
      
      Promise.all(
        tasksToUpdate.map((task) =>
          editTaskMutation.mutateAsync({
            endpoint: "tasks",
            id: task._id,
            data: { order: task.order },
          })
        )
      ).catch((error) => {
        console.error("Failed to update tasks", error);
      });

      return;
    }

    // Cross-column move
    const destTasks = [...destColumn.tasks];
    const movedTask = { ...removed, column: destination.droppableId, order: destination.index };
    destTasks.splice(destination.index, 0, movedTask);

    // Recalculate orders for source column (items shift up after removal)
    const updatedSourceTasks = sourceTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    // Recalculate orders for destination column
    const updatedDestTasks = destTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    // Update local state immediately
    hasLocalChangesRef.current = true;
    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: {
        ...sourceColumn,
        tasks: updatedSourceTasks,
        total: sourceColumn.total - 1,
      },
      [destination.droppableId]: {
        ...destColumn,
        tasks: updatedDestTasks,
        total: destColumn.total + 1,
      },
    }));

    // Update all affected tasks via mutation (no refetch)
    const updatePromises: Promise<unknown>[] = [];

    // Update moved task with new column and position
    updatePromises.push(
      editTaskMutation.mutateAsync({
        endpoint: "tasks",
        id: removed._id,
        data: { 
          column: destination.droppableId,
          order: destination.index,
        },
      })
    );

    // Update all tasks in source column that shifted up (from source.index onwards)
    const sourceTasksToUpdate = updatedSourceTasks.slice(source.index);
    sourceTasksToUpdate.forEach((task) => {
      updatePromises.push(
        editTaskMutation.mutateAsync({
          endpoint: "tasks",
          id: task._id,
          data: { order: task.order },
        })
      );
    });

    // Update all tasks in destination column that shifted down (from destination.index + 1 onwards)
    const destTasksToUpdate = updatedDestTasks.slice(destination.index + 1);
    destTasksToUpdate.forEach((task) => {
      updatePromises.push(
        editTaskMutation.mutateAsync({
          endpoint: "tasks",
          id: task._id,
          data: { order: task.order },
        })
      );
    });

    Promise.all(updatePromises).catch((error) => {
      console.error("Failed to update tasks", error);
    });
  };

  return (
    <>
      <Button sx={{ m: 2 }} variant="contained" onClick={handleCreateOpen}>
        + New Task
      </Button>

      <TaskDialog
        open={openCreate}
        onClose={handleCreateClose}
        onSubmit={handleCreateSave}
        title="Create Task"
        loading={createTaskMutation.isPending}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            height: "90vh",
          }}
        >
          <Column
            column={columns.Backlog}
            type="Backlog"
            hasMore={backlogData.hasMore}
            isLoadingMore={backlogData.isLoadingMore}
            onLoadMore={() => backlogData.loadMore()}
          />
          <Column
            column={columns["In Progress"]}
            type="In Progress"
            hasMore={inProgressData.hasMore}
            isLoadingMore={inProgressData.isLoadingMore}
            onLoadMore={() => inProgressData.loadMore()}
          />
          <Column
            column={columns.Review}
            type="Review"
            hasMore={reviewData.hasMore}
            isLoadingMore={reviewData.isLoadingMore}
            onLoadMore={() => reviewData.loadMore()}
          />
          <Column
            column={columns.Done}
            type="Done"
            hasMore={doneData.hasMore}
            isLoadingMore={doneData.isLoadingMore}
            onLoadMore={() => doneData.loadMore()}
          />
        </Box>
      </DragDropContext>
    </>
  );
}

export default Board;