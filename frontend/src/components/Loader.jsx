import { Box, CircularProgress } from '@mui/material';

export default function Loader() {
  return (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress />
    </Box>
  );
}
