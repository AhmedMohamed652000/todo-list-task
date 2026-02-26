import { useRef, useEffect } from "react";
import TaskCard from "./TaskCard";
import type { ColumnState } from "../../../types/boardTypes";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface ColumnProps {
  readonly column: ColumnState;
  readonly type: string;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: () => void;
}

function Column({
  column,
  type,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ColumnProps) {
  const scrollDivRef = useRef<HTMLDivElement>(null);

  // Handle scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollDivRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollDivRef.current;

      // Load more when user scrolls to 80% of the content
      if (scrollHeight - (scrollTop + clientHeight) < scrollHeight * 0.2) {
        if (hasMore && !isLoadingMore) {
          onLoadMore();
        }
      }
    };

    const scrollDiv = scrollDivRef.current;
    scrollDiv?.addEventListener("scroll", handleScroll);

    return () => scrollDiv?.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <Box sx={{ backgroundColor: "#ebf0f0", borderRadius: 2, p: 2, width: 400 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: "bold" }}>
            {type} ({column.total})
        </Typography>

      <Droppable droppableId={type}>
        {(provided) => (
          <Box
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                provided.innerRef(el);
                scrollDivRef.current = el;
              }
            }}
            {...provided.droppableProps}
            sx={{
              height: "80vh",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
            }}
          >
            {column.tasks.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={String(task._id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      mb: 2,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <TaskCard task={task} />
                  </Box>
                )}
              </Draggable>
            ))}

            {isLoadingMore && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {!hasMore && column.tasks.length > 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                No more tasks
              </Box>
            )}

            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}

export default Column;