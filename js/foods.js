// Food list page functionality
window.foods = {
    foodGrid: null,
    sortDropdown: null,

    async init() {
        console.log('Initializing foods list functionality');
        try {
            // Check if foodGrid element exists
            if (!this.foodGrid) {
                console.log('Food grid container not found, retrying...');
                this.foodGrid = document.getElementById('featuredFoods');
                if (!this.foodGrid) {
                    console.error('Food grid container still not found after retry');
                    return;
                }
            }

            // Get sort dropdown
            this.sortDropdown = document.getElementById('sortDropdown');
            if (this.sortDropdown) {
                this.sortDropdown.addEventListener('change', (e) => this.handleSortChange(e));
            }
            
            // Check if API is available
            if (!window.api || !window.api.food) {
                console.error('API or food API not available');
                this.showError('API not available. Please check console for details.');
                return;
            }
            
            console.log('Loading foods...');
            await this.loadFoods();
            console.log('Foods loaded successfully');
        } catch (error) {
            console.error('Error loading foods:', error);
            this.showError('Failed to load foods. Please try again later.');
        }
    },

    async handleSortChange(e) {
        const sortValue = e.target.value;
        let sortParam = '';

        switch(sortValue) {
            case 'alphabetic':
                sortParam = 'name';
                break;
            case 'latest':
                sortParam = 'rating';
                break;
            case 'reviews':
                sortParam = 'reviewCount';
                break;
            default:
                sortParam = '';
        }

        await this.loadFoods(sortParam);
    },

    async loadFoods(sortParam = '') {
        try {
            console.log('Calling API to get foods');
            
            // Check if API is available
            if (!window.api || !window.api.food) {
                console.error('API or food API not available');
                this.showError('API not available');
                return;
            }
            
            const response = await window.api.food.getAll(sortParam ? { sort: sortParam } : {});
            console.log('API response:', response);
            
            if (response && response.foods) {
                console.log(`Rendering ${response.foods.length} food items`);
                this.renderFoods(response.foods);
            } else {
                console.error('Invalid response format:', response);
                this.showError('Invalid response from server');
            }
        } catch (error) {
            console.error('Error loading foods:', error);
            this.showError('Failed to load foods');
        }
    },

    renderFoods(foods) {
        if (!this.foodGrid) {
            console.error('Food grid container not found');
            return;
        }
        if (!foods || !Array.isArray(foods) || foods.length === 0) {
            this.showError('No food items available.');
            return;
        }

        this.foodGrid.innerHTML = foods.map(food => {
            // Ensure food object exists and has required properties
            if (!food || !food._id) {
                console.warn('Invalid food item:', food);
                return '';
            }
            
            // Safely access properties with defaults
            const name = food.name || 'Unnamed Food';
            const imageUrl = food.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            const rating = typeof food.rating === 'number' ? food.rating : 0;
            const cuisine = food.cuisine || 'Cuisine not specified';
            const tasteProfile = Array.isArray(food.tasteProfile) ? food.tasteProfile : [];
            const dietaryRestrictions = Array.isArray(food.dietaryRestrictions) ? food.dietaryRestrictions : [];

            return `
                <div class="food-card" data-rating="${rating}" data-cuisine="${cuisine}">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'">
                    <div class="food-info">
                        <h3>${name}</h3>
                        <div class="rating" data-rating="${rating}">${this.generateStarRating(rating)}</div>
                        <div class="cuisine">${cuisine}</div>
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
        if (!this.foodGrid.innerHTML.trim()) {
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
        if (!this.foodGrid) return;
        this.foodGrid.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    }
};