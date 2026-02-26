import Box from "@mui/material/Box";
import Header from "./components/Header";
import Board from "./components/Board";
function index() {
  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        maxHeight: "100vh",
        overflow: "hidden",
      }}>
        <Header/>
        <Board/>
      </Box>
  );
}

export default index;
