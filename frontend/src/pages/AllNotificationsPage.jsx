import { Container, Box } from '@mui/material';
import AllNotifications from '../components/AllNotifications';

export default function AllNotificationsPage() {
  return (
    <Container maxWidth="md">
      <Box py={3}>
        <AllNotifications />
      </Box>
    </Container>
  );
}
