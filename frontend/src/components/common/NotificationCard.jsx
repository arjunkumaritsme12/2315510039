import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import FiberNewIcon from '@mui/icons-material/FiberNew';

const TYPE_COLORS = { Placement: 'success', Result: 'warning', Event: 'info' };

export default function NotificationCard({ notification, isNew = false, score = null }) {
  return (
    <Card
      elevation={isNew ? 4 : 1}
      sx={{
        mb: 1.5,
        border: isNew ? '2px solid #1976d2' : '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip
            label={notification.Type}
            color={TYPE_COLORS[notification.Type] || 'default'}
            size="small"
          />
          {isNew && <FiberNewIcon color="primary" fontSize="small" />}
          {score !== null && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Score: {score.toFixed(3)}
            </Typography>
          )}
        </Box>
        <Typography variant="body1" sx={{ fontWeight: isNew ? 600 : 400, mt: 0.5 }}>
          {notification.Message}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(notification.Timestamp).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
