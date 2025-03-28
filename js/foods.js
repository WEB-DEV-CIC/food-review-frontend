// Foods page functionality
const foods = {
    foodGrid: document.getElementById('foodGrid'),
    searchInput: document.getElementById('searchInput'),
    regionFilter: document.getElementById('regionFilter'),
    tasteProfileFilter: document.getElementById('tasteProfileFilter'),
    dietaryFilter: document.getElementById('dietaryFilter'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    currentPageSpan: document.getElementById('currentPage'),
    totalPagesSpan: document.getElementById('totalPages'),
    currentPage: 1,
    totalPages: 1,
    filters: {
        search: '',
        region: '',
        tasteProfile: '',
        dietaryRestrictions: ''
    },

    async init() {
        try {
            await this.loadFoods();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing foods page:', error);
            this.showError('Failed to load foods. Please try again later.');
        }
    },

    setupEventListeners() {
        // Search input with debounce
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadFoods();
            }, 300);
        });

        // Filter change handlers
        this.regionFilter.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.currentPage = 1;
            this.loadFoods();
        });

        this.tasteProfileFilter.addEventListener('change', (e) => {
            this.filters.tasteProfile = e.target.value;
            this.currentPage = 1;
            this.loadFoods();
        });

        this.dietaryFilter.addEventListener('change', (e) => {
            this.filters.dietaryRestrictions = e.target.value;
            this.currentPage = 1;
            this.loadFoods();
        });

        // Pagination handlers
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadFoods();
            }
        });

        this.nextPageBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadFoods();
            }
        });
    },

    async loadFoods() {
        try {
            const params = {
                page: this.currentPage,
                limit: 12,
                ...this.filters
            };

            const response = await window.api.food.getAll(params);
            if (response && response.foods) {
                this.totalPages = response.totalPages || 1;
                this.updatePaginationControls();
                this.renderFoods(response.foods);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading foods:', error);
            this.showError('Failed to load foods. Please try again later.');
        }
    },

    updatePaginationControls() {
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = this.totalPages;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages;
    },

    renderFoods(foods) {
        if (!foods || !Array.isArray(foods) || foods.length === 0) {
            this.showError('No food items found matching your criteria.');
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

// Initialize the foods page
document.addEventListener('DOMContentLoaded', () => {
    if (foods.foodGrid) {
        foods.init();
    } else {
        console.error('Food grid container not found');
    }
}); 