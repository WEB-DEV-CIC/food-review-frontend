import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Rating,
  Chip,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import { foodApi } from '../api/restaurantApi';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const ReviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
}));

const LoadingSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={400} />
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" height={40} width="60%" />
      <Skeleton variant="text" height={24} width="40%" sx={{ mb: 2 }} />
      <Skeleton variant="text" height={24} width="80%" />
      <Skeleton variant="text" height={24} width="60%" />
    </Box>
  </Box>
);

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const foodData = await foodApi.getFoodById(id);
        setFood(foodData);
        setReviews(foodData.reviews || []);
      } catch (err) {
        setError('Failed to load food details');
        console.error('Error fetching food data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleReviewClick = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      navigate(`/foods/${id}/review`);
    }
  };

  const handleLoginClick = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <LoadingSkeleton />
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Skeleton variant="text" height={24} width="60%" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="70%" />
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!food) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Food item not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="400"
              image={food.image || 'https://via.placeholder.com/800x400'}
              alt={food.name}
            />
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {food.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={food.rating || 0} readOnly precision={0.5} />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  ({food.reviewCount || 0} reviews)
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {food.cuisine}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {food.tags?.map((tag) => (
                  <Chip key={tag} label={tag} />
                ))}
              </Box>
              <Typography variant="body1" paragraph>
                {food.description}
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                mb: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                }
              }}
            >
              <Tab label="Reviews" />
              <Tab label="Ingredients" />
              <Tab label="Nutrition" />
            </Tabs>

            {tabValue === 0 && (
              <Box>
                {reviews.length === 0 ? (
                  <Alert severity="info">
                    No reviews yet. Be the first to review this food!
                  </Alert>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard key={review._id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2 }}>{review.userName?.[0]}</Avatar>
                          <Box>
                            <Typography variant="subtitle1">{review.userName}</Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        </Box>
                        <Typography variant="body1" paragraph>
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </ReviewCard>
                  ))
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReviewClick}
                    startIcon={isAuthenticated ? <AddIcon /> : <LoginIcon />}
                  >
                    {isAuthenticated ? 'Write a Review' : 'Sign in to Review'}
                  </Button>
                </Box>
              </Box>
            )}

            {tabValue === 1 && (
              <Alert severity="info">
                Ingredients information coming soon!
              </Alert>
            )}

            {tabValue === 2 && (
              <Alert severity="info">
                Nutrition information coming soon!
              </Alert>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Food Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1">
                <strong>Price:</strong> ${food.price}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1">
                <strong>Dietary Restrictions:</strong> {food.dietaryRestrictions?.join(', ')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1">
                <strong>Taste Profile:</strong> {food.tasteProfile?.join(', ')}
              </Typography>
            </Box>
          </StyledPaper>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleReviewClick}
            startIcon={isAuthenticated ? <AddIcon /> : <LoginIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
            }}
          >
            {isAuthenticated ? 'Write a Review' : 'Sign in to Review'}
          </Button>
        </Grid>
      </Grid>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>Sign in Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please sign in to write a review. This helps us maintain the quality of our reviews and prevent spam.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Cancel</Button>
          <Button onClick={handleLoginClick} variant="contained" color="primary">
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FoodDetail; 