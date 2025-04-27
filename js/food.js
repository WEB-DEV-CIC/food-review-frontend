// Food detail page functionality
const food = {
    foodDetail: document.getElementById('foodDetail'),
    reviewForm: document.getElementById('reviewForm'),
    reviewsList: document.getElementById('reviewsList'),
    foodId: null,

    async init() {
        try {
            // Get food ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            this.foodId = urlParams.get('id');

            if (!this.foodId || this.foodId === '#') {
                this.showError(`
                    <div class="error-container">
                        <h2>Invalid Food ID</h2>
                        <p>We couldn't find the food you're looking for. Please try:</p>
                        <ul>
                            <li>Going back to the <a href="foods.html">foods listing page</a></li>
                            <li>Selecting a food item from the list</li>
                            <li>Checking if the URL is correct</li>
                        </ul>
                    </div>
                `);
                return;
            }

            // Load food details and reviews
            await Promise.all([
                this.loadFoodDetails(),
                this.loadReviews()
            ]);

            // Setup review form if user is logged in
            this.setupReviewForm();
        } catch (error) {
            console.error('Error initializing food page:', error);
            this.showError(`
                <div class="error-container">
                    <h2>Error Loading Food Details</h2>
                    <p>We encountered an error while loading the food details. Please try:</p>
                    <ul>
                        <li>Refreshing the page</li>
                        <li>Going back to the <a href="foods.html">foods listing page</a></li>
                        <li>Checking your internet connection</li>
                    </ul>
                </div>
            `);
        }
    },

    async loadFoodDetails() {
        try {
            const foodData = await window.api.food.getById(this.foodId);
            if (!foodData) {
                throw new Error('Food not found');
            }
            this.renderFoodDetails(foodData);
        } catch (error) {
            console.error('Error loading food details:', error);
            throw error;
        }
    },

    async loadReviews() {
        try {
            const response = await window.api.food.getReviews(this.foodId);
            // Always render reviews, even if empty
            this.renderReviews(response.reviews || []);
        } catch (error) {
            console.error('Error loading reviews:', error);
            // Show empty reviews state instead of error
            this.renderReviews([]);
        }
    },

    renderFoodDetails(foodData) {
        // Safely access properties with defaults
        const name = foodData.name || 'Unnamed Food';
        const imageUrl = foodData.image_url || foodData.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        const description = foodData.description || 'No description available';
        const rating = typeof foodData.rating === 'number' ? foodData.rating : 0;
        const region = foodData.region || 'Region not specified';
        const tasteProfile = Array.isArray(foodData.tasteProfile) ? foodData.tasteProfile : [];
        const dietaryRestrictions = Array.isArray(foodData.dietaryRestrictions) ? foodData.dietaryRestrictions : [];
        const ingredients = Array.isArray(foodData.ingredients) ? foodData.ingredients : [];

        this.foodDetail.innerHTML = `
            <div class="food-header">
                <div class="food-image">
                    <img src="${imageUrl}" 
                     alt="${foodData.name || 'Food Image'}" 
                     onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="food-info">
                    <h1>${name}</h1>
                    <div class="rating">${this.generateStarRating(rating)}</div>
                    <div class="region">${region}</div>
                    <p class="description">${description}</p>
                    
                    ${ingredients.length > 0 ? `
                        <div class="ingredients">
                            <h2>Ingredients</h2>
                            <ul>
                                ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${tasteProfile.length > 0 ? `
                        <div class="taste-profiles">
                            <h2>Taste Profile</h2>
                            ${tasteProfile.map(taste => `<span class="taste-tag">${taste}</span>`).join('')}
                        </div>
                    ` : ''}

                    ${dietaryRestrictions.length > 0 ? `
                        <div class="dietary-restrictions">
                            <h2>Dietary Information</h2>
                            ${dietaryRestrictions.map(diet => `<span class="diet-tag">${diet}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderReviews(reviews) {
        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            this.reviewsList.innerHTML = `
                <div class="no-reviews">
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to review this food!</p>
                    <p class="review-prompt">Share your experience and help others discover this delicious dish.</p>
                </div>
            `;
            return;
        }

        this.reviewsList.innerHTML = reviews.map(review => `
            <div class="review">
                <div class="review-header">
                    <div class="rating">${this.generateStarRating(review.rating)}</div>
                    <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="review-comment">${review.comment}</div>
                <div class="review-author">By ${review.userName || 'Anonymous'}</div>
            </div>
        `).join('');
    },

    setupReviewForm() {
        if (!this.reviewForm) return;

        const token = localStorage.getItem('token');
        if (!token) {
            this.reviewForm.innerHTML = `
                <p>Please <a href="#" id="loginPrompt">login</a> to write a review.</p>
            `;
            document.getElementById('loginPrompt').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('loginBtn').click();
            });
            return;
        }

        this.reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = document.getElementById('reviewRating').value;
            const comment = document.getElementById('reviewComment').value;

            try {
                await window.api.food.addReview(this.foodId, rating, comment);
                await this.loadReviews(); // Reload reviews after submitting
                this.reviewForm.reset();
            } catch (error) {
                console.error('Error submitting review:', error);
                this.showError('Failed to submit review. Please try again.');
            }
        });
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
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = message;
        this.foodDetail.innerHTML = '';
        this.foodDetail.appendChild(errorDiv);
    }
};

// Initialize the food detail page
document.addEventListener('DOMContentLoaded', () => {
    if (food.foodDetail) {
        food.init();
    } else {
        console.error('Food detail container not found');
    }
}); 