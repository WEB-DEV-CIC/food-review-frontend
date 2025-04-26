// Main page functionality
const main = {
    featuredFoods: null,

    async init() {
        console.log('Initializing main functionality');
        try {
            // Check if we're on a page that should display featured foods
            this.featuredFoods = document.getElementById('featuredFoods');
            if (!this.featuredFoods) {
                console.log('Featured foods container not found - this page might not need it');
                return; // Exit quietly if this page doesn't need featured foods
            }
            
            // Check if API is available
            if (!window.api || !window.api.food) {
                console.error('API or food API not available');
                this.showError('API not available. Please check console for details.');
                return;
            }
            
            console.log('Loading featured foods...');
            await this.loadFeaturedFoods();
            console.log('Featured foods loaded successfully');
        } catch (error) {
            console.error('Error loading featured foods:', error);
            this.showError('Failed to load featured foods. Please try again later.');
        }
    },

    async loadFeaturedFoods() {
        try {
            console.log('Calling API to get featured foods');
            
            // Check if API is available
            if (!window.api || !window.api.food) {
                console.error('API or food API not available, using fallback data');
                this.renderFoods(this.getFallbackFoods());
                return;
            }
            
            const response = await window.api.food.getAll({ limit: 6 });
            console.log('API response:', response);
            
            if (response && response.foods) {
                console.log(`Rendering ${response.foods.length} food items`);
                this.renderFoods(response.foods);
            } else {
                console.error('Invalid response format:', response);
                console.log('Using fallback data due to invalid response format');
                this.renderFoods(this.getFallbackFoods());
            }
        } catch (error) {
            console.error('Error loading featured foods:', error);
            console.log('Using fallback data due to error');
            this.renderFoods(this.getFallbackFoods());
        }
    },

    renderFoods(foods) {
        if (!this.featuredFoods) {
            console.log('Featured foods container not found - this page might not need it');
            return;
        }
        if (!foods || !Array.isArray(foods) || foods.length === 0) {
            this.showError('No food items available.');
            return;
        }

        this.featuredFoods.innerHTML = foods.map(food => {
            // Ensure food object exists and has required properties
            if (!food || !food._id) {
                console.warn('Invalid food item:', food);
                return '';
            }
            
            // Safely access properties with defaults
            const name = food.name || 'Unnamed Food';
            const imageUrl = food.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            const rating = typeof food.rating === 'number' ? food.rating : 0;
            const region = food.region || 'Region not specified';
            const tasteProfile = Array.isArray(food.tasteProfile) ? food.tasteProfile : [];
            const dietaryRestrictions = Array.isArray(food.dietaryRestrictions) ? food.dietaryRestrictions : [];

            return `
                <div class="food-card">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'">
                    <div class="food-info">
                        <h3>${name}</h3>
                        <div class="rating">${this.generateStarRating(rating)}</div>
                        <div class="region">${region}</div>
                        ${tasteProfile.length > 0 ? `
                            <div class="taste-profiles">
                                ${tasteProfile.map(taste => `<span class="taste-tag">${taste}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${dietaryRestrictions.length > 0 ? `
                            <div class="dietary-restrictions">
                                ${dietaryRestrictions.map(diet => `<span class="diet-tag">${diet}</span>`).join('')}
                            </div>
                        ` : ''}
                        <a href="food-details.html?id=${food._id}" class="button">View Details</a>
                    </div>
                </div>
            `;
        }).join('');

        // If no valid food items were rendered, show error
        if (!this.featuredFoods.innerHTML.trim()) {
            this.showError('No valid food items available.');
        }
    },

    generateStarRating(rating) {
        if (typeof rating !== 'number' || isNaN(rating)) return '☆☆☆☆☆';
        const fullStars = Math.floor(Math.max(0, Math.min(5, rating)));
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar && fullStars < 5) stars += '½';
        stars += '☆'.repeat(5 - Math.ceil(Math.min(5, rating)));
        return stars;
    },

    showError(message) {
        if (!this.featuredFoods) return;
        this.featuredFoods.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    },

    getFallbackFoods() {
        return [
            {
                _id: 'fallback1',
                name: 'Delicious Pizza',
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                rating: 4.5,
                region: 'Italian',
                tasteProfile: ['Savory', 'Cheesy'],
                dietaryRestrictions: ['Vegetarian']
            },
            {
                _id: 'fallback2',
                name: 'Fresh Sushi',
                image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                rating: 4.8,
                region: 'Japanese',
                tasteProfile: ['Fresh', 'Umami'],
                dietaryRestrictions: ['Gluten-Free']
            },
            {
                _id: 'fallback3',
                name: 'Spicy Tacos',
                image: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                rating: 4.2,
                region: 'Mexican',
                tasteProfile: ['Spicy', 'Savory'],
                dietaryRestrictions: ['Gluten-Free']
            }
        ];
    }
};

// Initialize the main page
document.addEventListener('DOMContentLoaded', function() {
    main.init();
});