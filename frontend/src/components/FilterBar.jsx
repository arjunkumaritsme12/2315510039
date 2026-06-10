import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

export default function FilterBar({ notificationType, onTypeChange, searchText, onSearchChange }) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      <TextField
        label="Search notifications"
        size="small"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        sx={{ minWidth: { xs: '100%', sm: 260 } }}
      />
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Filter by Type</InputLabel>
        <Select value={notificationType} label="Filter by Type" onChange={(event) => onTypeChange(event.target.value)}>
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="Placement">Placement</MenuItem>
          <MenuItem value="Result">Result</MenuItem>
          <MenuItem value="Event">Event</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
