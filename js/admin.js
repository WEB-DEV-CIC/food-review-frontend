// Admin functionality
const Admin = (function() {
    let instance = null;

    class AdminClass {
        constructor() {
            if (instance) return instance;
            instance = this;

            this.state = {
                data: {
                    dashboard: null,
                    foods: [],
                    reviews: []
                },
                loading: {
                    dashboard: false,
                    foods: false,
                    reviews: false
                },
                selectedFoods: new Set() // Track selected food IDs
            };

            // Bind methods to instance
            this.init = this.init.bind(this);
            this.initializeEventListeners = this.initializeEventListeners.bind(this);
            this.switchSection = this.switchSection.bind(this);
            this.loadDashboardData = this.loadDashboardData.bind(this);
            this.updateDashboardStats = this.updateDashboardStats.bind(this);
            this.loadFoods = this.loadFoods.bind(this);
            this.renderFoods = this.renderFoods.bind(this);
            this.showError = this.showError.bind(this);
            this.handleAddFood = this.handleAddFood.bind(this);
            this.handleEditFood = this.handleEditFood.bind(this);
            this.handleDeleteFood = this.handleDeleteFood.bind(this);
            this.handleSelectAll = this.handleSelectAll.bind(this);
            this.handleSelectFood = this.handleSelectFood.bind(this);
            this.handleDeleteSelected = this.handleDeleteSelected.bind(this);
        }

        static getInstance() {
            if (!instance) {
                instance = new AdminClass();
            }
            return instance;
        }

        async init() {
            try {
                console.log('Initializing admin panel...');
                
                // Check admin access and token
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const token = localStorage.getItem('token');
                
                if (user.role !== 'admin' || !token) {
                    window.location.href = '/login.html';
                    return;
                }
                
                // Initialize event listeners
                this.initializeEventListeners();
                
                // Load initial data
                await this.loadDashboardData();
                await this.loadFoods();
                
                // Show initial section based on hash
                const currentHash = window.location.hash.substring(1) || 'dashboard';
                this.switchSection(currentHash);
                
                console.log('Admin panel initialized successfully');
            } catch (error) {
                console.error('Error initializing admin panel:', error);
                this.showError('Failed to initialize admin panel');
            }
        }

        initializeEventListeners() {
            console.log('Initializing admin event listeners...');
            
            // Handle hash changes
            window.addEventListener('hashchange', () => {
                const section = window.location.hash.substring(1) || 'dashboard';
                this.switchSection(section);
            });
            
            // Add food form
            const addFoodForm = document.getElementById('addFoodForm');
            if (addFoodForm) {
                addFoodForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAddFood();
                });
            }

            // Edit food form
            const editFoodForm = document.getElementById('editFoodForm');
            if (editFoodForm) {
                editFoodForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    try {
                        const foodId = document.getElementById('editFoodId').value;
                        const formData = {
                            name: document.getElementById('editName').value,
                            cuisine: document.getElementById('editCuisine').value,
                            description: document.getElementById('editDescription').value,
                            price: parseFloat(document.getElementById('editPrice').value),
                            image: document.getElementById('editImage').value
                        };

                        const result = await window.api.admin.updateFood(foodId, formData);
                        if (result.success) {
                            // Update the food in the state
                            this.state.data.foods = this.state.data.foods.map(f => 
                                f._id === foodId ? { ...f, ...formData } : f
                            );
                            
                            // Update the UI
                            this.renderFoods();
                            
                            // Hide the modal
                            const editModal = bootstrap.Modal.getInstance(document.getElementById('editFoodModal'));
                            editModal.hide();
                            
                            // Show success message
                            this.showSuccess('Food updated successfully');
                        } else {
                            throw new Error(result.message);
                        }
                    } catch (error) {
                        console.error('Error updating food:', error);
                        this.showError('Failed to update food');
                    }
                });
            }

            // Save food button
            const saveFoodBtn = document.getElementById('saveFoodBtn');
            if (saveFoodBtn) {
                saveFoodBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Save Food button clicked');
                    this.handleAddFood();
                });
            }

            // Select all checkbox
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    this.handleSelectAll(e.target.checked);
                });
            }

            // Delete selected button
            const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
            if (deleteSelectedBtn) {
                deleteSelectedBtn.addEventListener('click', () => {
                    this.handleDeleteSelected();
                });
            }
            
            // Search input
            const searchInput = document.getElementById('foodSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.handleSearch(e.target.value);
                });
            }

            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                });
            }

            // Edit and Delete buttons (using event delegation)
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('edit-food-btn')) {
                    const foodId = target.dataset.foodId;
                    if (foodId) {
                        this.handleEditFood(foodId);
                    }
                } else if (target.classList.contains('delete-food-btn')) {
                    const foodId = target.dataset.foodId;
                    if (foodId) {
                        this.handleDeleteFood(foodId);
                    }
                }
            });
            
            console.log('Admin event listeners initialized');
        }
        
        switchSection(sectionId) {
            console.log(`Switching to section: ${sectionId}`);
            
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Show the selected section
            const target = document.getElementById(sectionId);
            if (target) {
                target.classList.add('active');
                target.style.display = 'block';
            }
            
            // Update active link
            document.querySelectorAll('.sidebar .nav-link').forEach(link => {
                const linkHash = link.getAttribute('href');
                link.classList.toggle('active', linkHash === `#${sectionId}`);
            });
            
            // Load section data if needed
            switch (sectionId) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'foods':
                    this.loadFoods();
                    break;
                case 'reviews':
                    this.loadReviews();
                    break;
            }
        }
        
        async loadDashboardData() {
            try {
                console.log('Loading dashboard data...');
                this.state.loading.dashboard = true;
                
                const data = await window.api.admin.getStats();
                console.log('Dashboard stats:', data);
                
                this.state.data.dashboard = data.stats;
                this.updateDashboardStats();
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                this.showError('Failed to load dashboard statistics');
            } finally {
                this.state.loading.dashboard = false;
            }
        }
        
        updateDashboardStats() {
            console.log('Updating dashboard stats...');
            const stats = this.state.data.dashboard;
            
            const totalFoodsElement = document.getElementById('totalFoods');
            const totalReviewsElement = document.getElementById('totalReviews');
            
            if (totalFoodsElement) {
                totalFoodsElement.textContent = stats.totalFoods ?? '0';
                console.log('Updated totalFoods:', stats.totalFoods);
            } else {
                console.warn('#totalFoods element not found');
            }
            
            if (totalReviewsElement) {
                totalReviewsElement.textContent = stats.totalReviews ?? '0';
                console.log('Updated totalReviews:', stats.totalReviews);
            } else {
                console.warn('#totalReviews element not found');
            }
        }
        
        async loadFoods() {
            try {
                console.log('Starting to load foods...');
                this.state.loading.foods = true;
                this.renderFoods(); // Show loading state immediately
                
                console.log('Making API call to get foods...');
                const foods = await window.api.admin.getFoods();
                console.log('API Response:', foods);
                
                if (!Array.isArray(foods)) {
                    console.error('Invalid response format:', foods);
                    throw new Error('Invalid response format from server');
                }
                
                console.log(`Received ${foods.length} foods`);
                this.state.data.foods = foods;
                
                console.log('Rendering foods...');
                this.renderFoods(); // Render actual data
                
                console.log('Initializing food filter...');
                this.initializeFoodFilter();
                
            } catch (error) {
                console.error('Error loading foods:', error);
                this.showError('Failed to load foods: ' + error.message);
                this.state.data.foods = [];
                this.renderFoods(); // Render empty state
            } finally {
                this.state.loading.foods = false;
                console.log('Food loading process completed');
            }
        }
        
        initializeFoodFilter() {
            const searchInput = document.getElementById('foodSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredFoods = this.state.data.foods.filter(food => 
                        food.name.toLowerCase().includes(searchTerm) ||
                        food.cuisine.toLowerCase().includes(searchTerm) ||
                        food.description.toLowerCase().includes(searchTerm)
                    );
                    this.renderFoods(filteredFoods);
                });
            }
        }
        
        renderFoods(foods = null) {
            const foodsToRender = foods || this.state.data.foods;
            const tbody = document.getElementById('foodsTableBody');
            if (!tbody) return;

            tbody.innerHTML = foodsToRender.length === 0 ? `
                <tr>
                    <td colspan="5" class="text-center">No foods found</td>
                </tr>
            ` : foodsToRender.map(food => `
                <tr>
                    <td>${food.name}</td>
                    <td>${food.cuisine}</td>
                    <td>$${food.price.toFixed(2)}</td>
                    <td>${food.rating ? food.rating.toFixed(1) : 'N/A'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary edit-food-btn" data-food-id="${food._id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-food-btn" data-food-id="${food._id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            this.updateDeleteSelectedButton();
        }
        
        showError(message) {
            console.error('Error:', message);
            const errorModal = document.getElementById('errorModal');
            if (errorModal) {
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) {
                    errorMessage.textContent = message;
                }
                const modal = new bootstrap.Modal(errorModal);
                modal.show();
            } else {
                alert(message);
            }
        }

        async handleAddFood() {
            try {
                console.log('Starting to handle Add Food...');

                // Check if modal exists
                const modal = document.getElementById('addFoodModal');
                if (!modal) {
                    console.error('Add Food Modal not found in the DOM');
                    this.showError('Add Food Modal is not available');
                    return;
                }

                // Ensure modal is visible
                if (!modal.classList.contains('show')) {
                    console.warn('Add Food Modal is not visible');
                    this.showError('Please open the Add Food Modal before saving');
                    return;
                }

                // Check form elements
                const foodName = document.querySelector('#foodName');
                const foodCuisine = document.querySelector('#foodCuisine');
                const foodDescription = document.querySelector('#foodDescription');
                const foodPrice = document.querySelector('#foodPrice');
                const foodImage = document.querySelector('#foodImage');

                console.log('foodName:', foodName);
                console.log('foodCuisine:', foodCuisine);
                console.log('foodDescription:', foodDescription);
                console.log('foodPrice:', foodPrice);
                console.log('foodImage:', foodImage);

                // Ensure all elements exist
                if (!foodName || !foodCuisine || !foodDescription || !foodPrice || !foodImage) {
                    console.error('One or more form elements are missing');
                    this.showError('Form elements are not properly loaded');
                    return;
                }

                // Get form values
                const name = foodName.value;
                const cuisine = foodCuisine.value;
                const description = foodDescription.value;
                const price = parseFloat(foodPrice.value);
                const image = foodImage.value;

                console.log('Form values:', { name, cuisine, description, price, image });

                // Validate required fields
                if (!name || !cuisine || !description || !price || !image) {
                    this.showError('Please fill in all required fields');
                    return;
                }

                // Validate image URL
                if (!image.startsWith('http://') && !image.startsWith('https://')) {
                    this.showError('Please enter a valid image URL');
                    return;
                }

                console.log('Submitting food data to API...');

                // Make API call to create food
                const response = await fetch('http://localhost:5000/api/v1/admin/foods', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include admin token
                    },
                    body: JSON.stringify({ name, cuisine, description, price, image }),
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('Food added successfully:', result);

                    // Clear form
                    document.getElementById('addFoodForm').reset();

                    // Hide the modal using Bootstrap's modal method
                    const modalElement = document.getElementById('addFoodModal');
                    if (modalElement) {
                        // Remove the 'show' class and set display to none
                        modalElement.classList.remove('show');
                        modalElement.style.display = 'none';
                        // Remove the modal backdrop
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.remove();
                        }
                        // Remove the modal-open class from body
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                    }

                    // Show success message
                    this.showSuccess('Food added successfully');

                    // Reload foods
                    await this.loadFoods();

                    // Switch to foods section
                    this.switchSection('foods');
                } else {
                    console.error('API Error:', result.error);
                    throw new Error(result.error || 'Failed to add food');
                }
            } catch (error) {
                console.error('Failed to add food:', error);
                this.showError(error.message || 'Failed to add food');
            }
        }

        async handleEditFood(foodId) {
            try {
                console.log('Editing food with ID:', foodId);
                console.log('Current foods:', this.state.data.foods);
                
                // Find the food item
                const food = this.state.data.foods.find(f => f._id === foodId);
                if (!food) {
                    this.showError('Food not found');
                    return;
                }

                // Get form elements
                const editFoodId = document.getElementById('editFoodId');
                const editName = document.getElementById('editName');
                const editCuisine = document.getElementById('editCuisine');
                const editDescription = document.getElementById('editDescription');
                const editPrice = document.getElementById('editPrice');
                const editImage = document.getElementById('editImage');

                // Check if all form elements exist
                if (!editFoodId || !editName || !editCuisine || !editDescription || !editPrice || !editImage) {
                    console.error('Missing form elements:', {
                        editFoodId: !!editFoodId,
                        editName: !!editName,
                        editCuisine: !!editCuisine,
                        editDescription: !!editDescription,
                        editPrice: !!editPrice,
                        editImage: !!editImage
                    });
                    this.showError('Form elements not found');
                    return;
                }

                // Populate form with food data
                editFoodId.value = food._id;
                editName.value = food.name;
                editCuisine.value = food.cuisine;
                editDescription.value = food.description;
                editPrice.value = food.price;
                editImage.value = food.image || '';

                // Show edit modal
                const editModal = new bootstrap.Modal(document.getElementById('editFoodModal'));
                editModal.show();
            } catch (error) {
                console.error('Error in handleEditFood:', error);
                this.showError('Error loading food details');
            }
        }

        async handleDeleteFood(foodId) {
            try {
                console.log('Deleting food with ID:', foodId);
                
                // Confirm deletion
                if (!confirm('Are you sure you want to delete this food item?')) {
                    return;
                }
                
                // Call the API to delete the food
                const result = await window.api.admin.deleteFood(foodId);
                
                if (result.success) {
                    // Remove the food from the state
                    this.state.data.foods = this.state.data.foods.filter(f => f._id !== foodId);
                    
                    // Update the UI
                    this.renderFoods();
                    
                    // Show success message
                    this.showSuccess('Food deleted successfully');
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error deleting food:', error);
                this.showError('Failed to delete food');
            }
        }

        showSuccess(message) {
            const toast = document.getElementById('successToast');
            if (toast) {
                const toastBody = toast.querySelector('.toast-body');
                if (toastBody) {
                    toastBody.textContent = message;
                }
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            } else {
                alert(message);
            }
        }

        handleSelectAll(checked) {
            const checkboxes = document.querySelectorAll('.food-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = checked;
                const foodId = checkbox.dataset.foodId;
                if (checked) {
                    this.state.selectedFoods.add(foodId);
                } else {
                    this.state.selectedFoods.delete(foodId);
                }
            });
            this.updateDeleteSelectedButton();
        }

        handleSelectFood(foodId, checked) {
            if (checked) {
                this.state.selectedFoods.add(foodId);
            } else {
                this.state.selectedFoods.delete(foodId);
            }
            this.updateDeleteSelectedButton();
        }

        updateDeleteSelectedButton() {
            const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
            if (deleteSelectedBtn) {
                deleteSelectedBtn.style.display = this.state.selectedFoods.size > 0 ? 'inline-block' : 'none';
            }
        }

        async handleDeleteSelected() {
            if (this.state.selectedFoods.size === 0) return;

            if (!confirm(`Are you sure you want to delete ${this.state.selectedFoods.size} selected food(s)?`)) {
                return;
            }

            try {
                const deletePromises = Array.from(this.state.selectedFoods).map(foodId => 
                    window.api.admin.deleteFood(foodId)
                );

                await Promise.all(deletePromises);
                
                // Clear selected foods
                this.state.selectedFoods.clear();
                
                // Update UI
                this.updateDeleteSelectedButton();
                document.getElementById('selectAllCheckbox').checked = false;
                
                // Reload foods
                await this.loadFoods();
                
                this.showSuccess(`${this.state.selectedFoods.size} food(s) deleted successfully`);
            } catch (error) {
                console.error('Error deleting selected foods:', error);
                this.showError('Failed to delete selected foods');
            }
        }
    }

    // Return the AdminClass constructor
    return AdminClass;
})();

// Expose Admin to window
window.Admin = Admin;