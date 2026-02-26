import Box from "@mui/material/Box";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import useQuerySearch from "../../../hooks/useQuerySearch";
import { useSelector } from "react-redux";

function Header() {
  const [search, setSearch] = useQuerySearch();
  const numberOfTasks = useSelector((state: any) => state.todoSlice.numbersOfTasks) || 0;
  return (
    <Box
      sx={{
        color: "#fff",
        padding: "0.8rem",
        borderBottom: "1px solid #e3e3e6",
      }}>
      {/* // Header content goes here */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        {/* // brand and number of tasks */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            gap: 0.5,
          }}>
          {/* // logo */}
          <Box
            sx={{
              background: "#3c64d7",
              p: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <WidgetsOutlinedIcon />
          </Box>
          {/* // brand name */}
          <Box sx={{ ml: 1, fontSize: "1.2rem", fontWeight: "bold" }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                textTransform: "uppercase",
                fontWeight: 900,
                color: "#000",
                fontSize: 14,
              }}>
              kanban board
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{
                textTransform: "capitalize",
                color: "#9b9797",
                fontSize: 12,
                fontWeight: 600,
              }}>
              {numberOfTasks} Tasks
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: 350 }}>
          <TextField
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#e6e7e9",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Header;
