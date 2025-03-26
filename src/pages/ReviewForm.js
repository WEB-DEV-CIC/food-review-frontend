import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Rating,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { foodApi } from '../api/restaurantApi';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: '0 auto',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const RatingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

function ReviewForm() {
  const { id: foodId } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await foodApi.getFoodById(foodId);
        setFood(data);
      } catch (err) {
        setError('Failed to load food details');
        console.error('Error fetching food:', err);
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchFood();
    }
  }, [foodId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.rating || formData.rating < 1) {
      setError('Please select a rating');
      return false;
    }
    if (!formData.comment.trim()) {
      setError('Please enter your review comment');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      await foodApi.submitReview(foodId, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/foods/${foodId}`);
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!food) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Food item not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <Typography variant="h4" component="h1" gutterBottom>
          Write a Review for {food.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Share your experience with this food item
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <RatingBox>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={Number(formData.rating)}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  rating: newValue,
                }));
              }}
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {formData.rating ? `${formData.rating} stars` : 'Select rating'}
            </Typography>
          </RatingBox>

          <TextField
            fullWidth
            label="Your Review"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            margin="normal"
            required
            multiline
            rows={4}
            error={!!error && !formData.comment.trim()}
            helperText={error && !formData.comment.trim() ? error : ''}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/foods/${foodId}`)}
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ flex: 2 }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Box>
        </form>

        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSuccess(false)}
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ width: '100%' }}
          >
            Review submitted successfully!
          </Alert>
        </Snackbar>
      </StyledPaper>
    </Container>
  );
}

export default ReviewForm; 