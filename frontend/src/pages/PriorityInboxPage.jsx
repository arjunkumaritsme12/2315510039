import { Container, Box } from '@mui/material';
import PriorityInbox from '../components/PriorityInbox';

export default function PriorityInboxPage() {
  return (
    <Container maxWidth="md">
      <Box py={3}>
        <PriorityInbox />
      </Box>
    </Container>
  );
}
