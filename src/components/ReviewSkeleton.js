import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1.5),
  },
}));

const ReviewSkeleton = () => {
  return (
    <StyledCard>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={100} height={16} />
          </Box>
        </Box>
        <Skeleton variant="text" width={80} height={16} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={60} />
      </CardContent>
    </StyledCard>
  );
};

export default ReviewSkeleton; 