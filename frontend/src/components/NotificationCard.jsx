import { Card, CardContent, Chip, Box, Typography, Stack } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const TYPE_COLORS = {
  Placement: 'success',
  Result: 'warning',
  Event: 'info',
};

export default function NotificationCard({ notification, viewed = false, score = null, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderLeft: viewed ? '4px solid #9e9e9e' : '4px solid #2e7d32',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mb={1}>
          <Chip label={notification.Type} color={TYPE_COLORS[notification.Type] || 'default'} size="small" />
          <Box display="flex" alignItems="center" gap={1}>
            {score !== null && (
              <Typography variant="caption" color="text.secondary">
                Score: {score.toFixed(3)}
              </Typography>
            )}
            <FiberManualRecordIcon color={viewed ? 'disabled' : 'success'} fontSize="small" />
          </Box>
        </Stack>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {notification.Message}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(notification.Timestamp.replace(' ', 'T')).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
