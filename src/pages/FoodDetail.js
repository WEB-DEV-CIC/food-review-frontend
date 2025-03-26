import React, { useState, useEffect, useMemo } from 'react';
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
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { foodApi } from '../api/restaurantApi';
import ErrorBoundary from '../components/ErrorBoundary';
import ReviewSkeleton from '../components/ReviewSkeleton';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ReviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1.5),
  },
}));

const FoodDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);

  // Memoized sorted reviews
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews]);

  useEffect(() => {
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

  const handleReviewClick = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      setIsSubmitting(true);
      try {
        await navigate(`/foods/${id}/review`);
      } catch (error) {
        console.error('Navigation error:', error);
        setError('Failed to navigate to review form');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLoginClick = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };

  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${food.name} on Food Review!`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setShowCopySnackbar(true);
        break;
      default:
        break;
    }
    handleShareClose();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={isMobile ? 200 : 400} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="text" height={100} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!food) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Alert severity="error">Food not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setShowSuccessMessage(false)}
        >
          Review submitted successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height={isMobile ? 200 : 400}
              image={food.image}
              alt={food.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant={isMobile ? 'h5' : 'h4'}>
                  {food.name}
                </Typography>
                <Tooltip title="Share">
                  <IconButton onClick={handleShareClick} size="small">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {food.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {food.cuisine && (
                  <Chip
                    label={food.cuisine}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
                {food.dietaryRestrictions?.map((restriction) => (
                  <Chip
                    key={restriction}
                    label={restriction}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <StyledPaper>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
              }}
            >
              <Tab label="Reviews" />
              <Tab label="Details" />
            </Tabs>

            {tabValue === 0 ? (
              <Box>
                {loading ? (
                  <>
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                  </>
                ) : sortedReviews.length > 0 ? (
                  sortedReviews.map((review) => (
                    <ReviewCard key={review._id}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1 }}>{review.user?.name?.[0] || 'U'}</Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {review.user?.name || 'Anonymous'}
                            </Typography>
                            <Rating value={review.rating} readOnly size={isMobile ? 'small' : 'medium'} />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {review.comment}
                        </Typography>
                      </CardContent>
                    </ReviewCard>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    No reviews yet. Be the first to review this food!
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  <strong>Price:</strong> ${food.price}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Dietary Restrictions:</strong> {food.dietaryRestrictions?.join(', ')}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Taste Profile:</strong> {food.tasteProfile?.join(', ')}
                </Typography>
              </Box>
            )}
          </StyledPaper>
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
            size={isMobile ? 'medium' : 'large'}
            onClick={handleReviewClick}
            startIcon={isAuthenticated ? <AddIcon /> : <LoginIcon />}
            disabled={isSubmitting}
            sx={{
              py: isMobile ? 1 : 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: isMobile ? '1rem' : '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            {isSubmitting ? 'Loading...' : isAuthenticated ? 'Write a Review' : 'Sign in to Review'}
          </Button>
        </Grid>
      </Grid>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
          }
        }}
      >
        <MenuItem onClick={() => handleShare('facebook')}>
          <FacebookIcon sx={{ mr: 1, color: '#1877f2' }} />
          Facebook
        </MenuItem>
        <MenuItem onClick={() => handleShare('twitter')}>
          <TwitterIcon sx={{ mr: 1, color: '#1da1f2' }} />
          Twitter
        </MenuItem>
        <MenuItem onClick={() => handleShare('whatsapp')}>
          <WhatsAppIcon sx={{ mr: 1, color: '#25d366' }} />
          WhatsApp
        </MenuItem>
        <MenuItem onClick={() => handleShare('copy')}>
          <ContentCopyIcon sx={{ mr: 1 }} />
          Copy Link
        </MenuItem>
      </Menu>

      <Snackbar
        open={showCopySnackbar}
        autoHideDuration={3000}
        onClose={() => setShowCopySnackbar(false)}
        message="Link copied to clipboard!"
      />

      <Dialog 
        open={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)}
        PaperProps={{
          sx: {
            width: '90%',
            maxWidth: 400,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Sign in Required</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please sign in to write a review. This helps us maintain the quality of our reviews and prevent spam.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Benefits of signing in:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2">Track your reviews</Typography>
            <Typography component="li" variant="body2">Edit or delete your reviews</Typography>
            <Typography component="li" variant="body2">Get personalized recommendations</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowLoginDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLoginClick} 
            variant="contained" 
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Wrap the component with ErrorBoundary
const FoodDetail = () => (
  <ErrorBoundary>
    <FoodDetailContent />
  </ErrorBoundary>
);

export default FoodDetail; 