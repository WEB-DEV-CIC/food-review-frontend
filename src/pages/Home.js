import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { foodApi } from '../api/restaurantApi';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF4B2B 30%, #FF416C 90%)',
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 1,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedFoods = async () => {
      try {
        setLoading(true);
        setError(null);
        const foods = await foodApi.getFeaturedFoods();
        setFeaturedFoods(foods);
      } catch (err) {
        console.error('Error fetching featured foods:', err);
        setError('Failed to load featured foods');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedFoods();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
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

  return (
    <Box>
      <HeroSection>
        <Container>
          <Typography variant="h2" component="h1" gutterBottom sx={{ position: 'relative', zIndex: 2 }}>
            Discover Amazing Food
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, position: 'relative', zIndex: 2 }}>
            Find and review the best food in your area
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/foods')}
            sx={{
              backgroundColor: 'white',
              color: '#FF4B2B',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
            }}
          >
            Browse All Foods
          </Button>
        </Container>
      </HeroSection>

      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Food
        </Typography>
        {featuredFoods.length === 0 ? (
          <Alert severity="info">
            No featured food available at the moment.
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {featuredFoods.map((food) => (
              <Grid item key={food._id} xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={food.image}
                    alt={food.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h3">
                      {food.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {food.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={food.rating || 0} readOnly precision={0.5} />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({food.reviewCount || 0} reviews)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {food.tags?.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/foods/${food._id}`)}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Home; 