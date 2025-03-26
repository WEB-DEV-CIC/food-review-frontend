import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { foodApi } from '../api/restaurantApi';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

const FoodList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [foodsResponse, cuisinesResponse] = await Promise.all([
          foodApi.getFoods({
            page,
            search: searchQuery,
            cuisine: selectedCuisine,
          }),
          foodApi.getCuisines(),
        ]);

        setFoods(foodsResponse.foods);
        setTotalPages(foodsResponse.totalPages);
        setCuisines(cuisinesResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load food items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchQuery, selectedCuisine]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchParams({ search: searchQuery, cuisine: selectedCuisine });
  };

  const handleCuisineChange = (event) => {
    setSelectedCuisine(event.target.value);
    setPage(1);
    setSearchParams({ search: searchQuery, cuisine: event.target.value });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    setSearchParams({ page: value.toString(), search: searchQuery, cuisine: selectedCuisine });
  };

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
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Food List
      </Typography>

      <FilterSection>
        <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: 200 }}>
          <TextField
            fullWidth
            placeholder="Search food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Cuisine</InputLabel>
          <Select
            value={selectedCuisine}
            label="Cuisine"
            onChange={handleCuisineChange}
          >
            <MenuItem value="">All Cuisines</MenuItem>
            {cuisines.map((cuisine) => (
              <MenuItem key={cuisine} value={cuisine}>
                {cuisine}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterSection>

      <Grid container spacing={4}>
        {foods.map((food) => (
          <Grid item key={food._id} xs={12} sm={6} md={4}>
            <StyledCard>
              <CardMedia
                component="img"
                height="200"
                image={food.image}
                alt={food.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h3">
                  {food.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {food.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={food.rating} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({food.reviewCount} reviews)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {food.tags?.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/foods/${food._id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default FoodList; 