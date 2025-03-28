// Main page functionality
const main = {
    featuredFoods: document.getElementById('featuredFoods'),

    async init() {
        try {
            await this.loadFeaturedFoods();
        } catch (error) {
            console.error('Error loading featured foods:', error);
            this.showError('Failed to load featured foods. Please try again later.');
        }
    },

    async loadFeaturedFoods() {
        try {
            const response = await window.api.food.getAll({ limit: 6 });
            if (response && response.foods) {
                this.renderFoods(response.foods);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading featured foods:', error);
            throw error;
        }
    },

    renderFoods(foods) {
        if (!this.featuredFoods) {
            console.error('Featured foods container not found');
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
                        <a href="food.html?id=${food._id}" class="button">View Details</a>
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
    }
};

// Initialize the main page
document.addEventListener('DOMContentLoaded', () => {
    if (main.featuredFoods) {
        main.init();
    } else {
        console.error('Featured foods container not found');
    }
});