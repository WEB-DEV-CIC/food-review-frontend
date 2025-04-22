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
            this.handleDeleteAll = this.handleDeleteAll.bind(this);
        }

        static getInstance() {
            if (!instance) {
                instance = new AdminClass();
            }
            return instance;
        }

        async init() {
            try {
                // Check authentication
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                if (!token || !user) {
                    console.log('No token or user found, redirecting to login');
                    window.location.href = '/login.html';
                    return;
                }

                if (user.role !== 'admin') {
                    console.log('User is not an admin, redirecting to home');
                    window.location.href = '/index.html';
                    return;
                }

                // Initialize event listeners
                this.initializeEventListeners();

                // Load initial data
                await this.loadDashboardData();
                await this.loadFoods();
                this.initializeFoodFilter(); // Initialize food search filter

                // Show initial section based on hash
                const currentHash = window.location.hash.substring(1) || 'dashboard';
                this.switchSection(currentHash);

            } catch (error) {
                console.error('Error initializing admin panel:', error);
                if (error.status === 401) {
                    // Clear invalid auth data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                } else {
                    this.showError('Failed to initialize admin panel');
                }
            }
        }

        initializeEventListeners() {
            console.log('Initializing admin event listeners...');
            
            // Handle hash changes
            window.addEventListener('hashchange', () => {
                const section = window.location.hash.substring(1) || 'dashboard';
                this.switchSection(section);
            });
            
            // Delete All button
            const deleteAllBtn = document.getElementById('deleteAllBtn');
            if (deleteAllBtn) {
                deleteAllBtn.addEventListener('click', () => {
                    this.handleDeleteAll();
                });
            }

            // Select all checkbox
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    this.handleSelectAll(e.target.checked);
                });
            }

            // Individual food checkboxes (using event delegation)
            document.addEventListener('change', (e) => {
                if (e.target.classList.contains('food-checkbox')) {
                    this.handleSelectFood(e.target.value);
                }
            });

            // Delete selected button
            const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
            if (deleteSelectedBtn) {
                deleteSelectedBtn.addEventListener('click', () => {
                    this.handleDeleteSelected();
                });
            }
            
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
                    const foodId = document.getElementById('editFoodId').value;
                    if (!foodId) {
                        this.showError('Food ID is required');
                        return;
                    }

                    const formData = {
                        name: document.getElementById('editName').value,
                        region_name: document.getElementById('editCuisine').value,
                        description: document.getElementById('editDescription').value,
                        price: parseFloat(document.getElementById('editPrice').value),
                        image_url: document.getElementById('editImage').value
                    };

                    try {
                        console.log('Updating food:', foodId, formData);
                        const response = await fetch(`${window.api.baseUrl}/admin/foods/${foodId}`, {
                            method: 'PUT',
                            headers: window.api.getHeaders(),
                            body: JSON.stringify(formData)
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to update food');
                        }

                        const data = await response.json();
                        console.log('Food updated successfully:', data);

                        // Update food in state
                        const index = this.state.data.foods.findIndex(f => f.id === parseInt(foodId));
                        if (index !== -1) {
                            this.state.data.foods[index] = { ...this.state.data.foods[index], ...formData };
                            this.renderFoods();
                        }

                        // Close modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('editFoodModal'));
                        modal.hide();
                        this.showSuccess('Food updated successfully');

                    } catch (error) {
                        console.error('Error updating food:', error);
                        this.showError(error.message || 'Failed to update food');
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
            
            // Search input
            const searchInput = document.getElementById('foodSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredFoods = this.state.data.foods.filter(food => 
                        food.name.toLowerCase().includes(searchTerm) ||
                        food.region_name.toLowerCase().includes(searchTerm) ||
                        food.description.toLowerCase().includes(searchTerm)
                    );
                    this.renderFoods(filteredFoods);
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

            // Handle edit and delete buttons (using event delegation)
            document.addEventListener('click', (e) => {
                console.log('Click event target:', e.target);
                console.log('Click event target classList:', e.target.classList);
                
                const editBtn = e.target.closest('.edit-food');
                const deleteBtn = e.target.closest('.delete-food');
                
                console.log('Edit button found:', editBtn);
                console.log('Delete button found:', deleteBtn);
                
                if (editBtn) {
                    const foodId = editBtn.getAttribute('data-id');
                    console.log('Edit button clicked, foodId:', foodId);
                    if (foodId) {
                        this.handleEditFood(foodId);
                    } else {
                        console.error('No food ID found on edit button');
                        this.showError('No food ID found on edit button');
                    }
                } else if (deleteBtn) {
                    const foodId = deleteBtn.getAttribute('data-id');
                    if (foodId) {
                        this.handleDeleteFood(foodId);
                    } else {
                        this.showError('No food ID found on delete button');
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
                
                const stats = await window.api.admin.getStats();
                console.log('Dashboard stats loaded:', stats);
                
                this.state.data.dashboard = stats;
                this.updateDashboardStats();
                
                this.state.loading.dashboard = false;
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                this.state.loading.dashboard = false;
                this.showError('Failed to load dashboard statistics');
            }
        }
        
        updateDashboardStats() {
            const stats = this.state.data.dashboard;
            if (!stats) return;

            // Update total counts
            document.getElementById('totalFoods').textContent = stats.totalFoods;
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('totalReviews').textContent = stats.totalReviews;
            document.getElementById('averageRating').textContent = stats.averageRating.toFixed(1);

            // Update recent activity
            const activityList = document.getElementById('recentActivity');
            if (activityList) {
                activityList.innerHTML = stats.recentActivity.map(activity => `
                    <div class="activity-item">
                        <span class="activity-type">${activity.type}</span>
                        <span class="activity-item">${activity.item}</span>
                        <span class="activity-user">${activity.user}</span>
                        <span class="activity-date">${new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                `).join('');
            }
        }
        
        async loadFoods() {
            try {
                console.log('Starting to load foods...');
                this.state.loading.foods = true;
                
                const foods = await window.api.admin.getFoods();
                console.log('Foods loaded:', foods);
                
                this.state.data.foods = foods;
                this.renderFoods();
                this.initializeFoodFilter(); // Initialize the search filter
                
                this.state.loading.foods = false;
            } catch (error) {
                console.error('Error loading foods:', error);
                this.state.loading.foods = false;
                this.showError('Failed to load foods');
            }
        }
        
        initializeFoodFilter() {
            const searchInput = document.getElementById('foodSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredFoods = this.state.data.foods.filter(food => 
                        food.name.toLowerCase().includes(searchTerm) ||
                        food.region_name.toLowerCase().includes(searchTerm) ||
                        food.description.toLowerCase().includes(searchTerm)
                    );
                    this.renderFoods(filteredFoods);
                });
            }
        }
        
        renderFoods(foods = null) {
            const foodsToRender = foods || this.state.data.foods;
            const tableBody = document.querySelector('#foodsTable tbody');
            if (!tableBody) {
                console.error('Foods table body not found');
                return;
            }

            console.log('Rendering foods:', foodsToRender);

            tableBody.innerHTML = foodsToRender.map(food => {
                const averageRating = food.average_rating ? parseFloat(food.average_rating).toFixed(1) : 'N/A';
                const price = food.price ? parseFloat(food.price).toFixed(2) : 'N/A';
                
                console.log('Rendering food:', food);
                
                return `
                    <tr>
                        <td>
                            <input type="checkbox" class="food-checkbox" value="${food.id}">
                        </td>
                        <td>${food.name}</td>
                        <td>${food.region_name}</td>
                        <td>$${price}</td>
                        <td>${averageRating}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-food" data-id="${food.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-food" data-id="${food.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            this.updateDeleteSelectedButton();
        }

        updateDeleteSelectedButton() {
            const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
            if (!deleteSelectedBtn) return;

            const selectedCount = document.querySelectorAll('.food-checkbox:checked').length;
            deleteSelectedBtn.disabled = selectedCount === 0;
            deleteSelectedBtn.textContent = `Delete Selected (${selectedCount})`;
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

                // Make API call to create food
                const response = await fetch(`${window.api.baseUrl}/admin/foods`, {
                    method: 'POST',
                    headers: window.api.getHeaders(),
                    body: JSON.stringify({
                        name,
                        cuisine,
                        description,
                        price,
                        image
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add food');
                }

                const data = await response.json();
                console.log('Food added successfully:', data);

                // Close modal and refresh food list
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                await this.loadFoods();

            } catch (error) {
                console.error('Error adding food:', error);
                this.showError(error.message || 'Failed to add food');
            }
        }

        async handleEditFood(foodId) {
            try {
                console.log('handleEditFood called with foodId:', foodId);
                console.log('Current foods in state:', this.state.data.foods);
                
                if (!foodId) {
                    console.error('No food ID provided');
                    this.showError('No food ID provided');
                    return;
                }

                // Get food data
                const food = this.state.data.foods.find(f => f.id === parseInt(foodId));
                console.log('Found food:', food);
                
                if (!food) {
                    console.error('Food not found for ID:', foodId);
                    this.showError('Food not found');
                    return;
                }

                // Populate edit form
                const editFoodId = document.getElementById('editFoodId');
                const editName = document.getElementById('editName');
                const editCuisine = document.getElementById('editCuisine');
                const editDescription = document.getElementById('editDescription');
                const editPrice = document.getElementById('editPrice');
                const editImage = document.getElementById('editImage');

                if (!editFoodId || !editName || !editCuisine || !editDescription || !editPrice || !editImage) {
                    console.error('One or more edit form elements not found');
                    this.showError('Edit form elements not found');
                    return;
                }

                editFoodId.value = food.id;
                editName.value = food.name;
                editCuisine.value = food.region_name;
                editDescription.value = food.description;
                editPrice.value = food.price;
                editImage.value = food.image_url;

                // Show edit modal
                const editModal = new bootstrap.Modal(document.getElementById('editFoodModal'));
                editModal.show();

            } catch (error) {
                console.error('Error preparing edit food:', error);
                this.showError('Failed to prepare food edit');
            }
        }

        async handleDeleteFood(foodId) {
            try {
                if (!foodId) {
                    this.showError('Food ID is required');
                    return;
                }

                if (!confirm('Are you sure you want to delete this food?')) {
                    return;
                }

                const response = await fetch(`${window.api.baseUrl}/admin/foods/${foodId}`, {
                    method: 'DELETE',
                    headers: window.api.getHeaders()
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete food');
                }

                // Remove food from state and update UI
                this.state.data.foods = this.state.data.foods.filter(f => f.id !== parseInt(foodId));
                this.renderFoods();
                this.showSuccess('Food deleted successfully');

            } catch (error) {
                console.error('Error deleting food:', error);
                this.showError(error.message || 'Failed to delete food');
            }
        }

        showSuccess(message) {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.textContent = message;
                }
                const modal = new bootstrap.Modal(successModal);
                modal.show();
            } else {
                alert(message);
            }
        }

        handleSelectAll(checked) {
            const checkboxes = document.querySelectorAll('.food-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = checked;
                const foodId = checkbox.value;
                if (checked) {
                    this.state.selectedFoods.add(foodId);
                } else {
                    this.state.selectedFoods.delete(foodId);
                }
            });
            this.updateDeleteSelectedButton();
        }

        handleSelectFood(foodId) {
            const checkbox = document.querySelector(`.food-checkbox[value="${foodId}"]`);
            if (checkbox) {
                if (checkbox.checked) {
                    this.state.selectedFoods.add(foodId);
                } else {
                    this.state.selectedFoods.delete(foodId);
                }
                this.updateDeleteSelectedButton();
            }
        }

        async handleDeleteSelected() {
            if (this.state.selectedFoods.size === 0) {
                this.showError('Please select at least one food to delete');
                return;
            }

            if (!confirm(`Are you sure you want to delete ${this.state.selectedFoods.size} selected food(s)?`)) {
                return;
            }

            try {
                const deletePromises = Array.from(this.state.selectedFoods).map(foodId => 
                    window.api.admin.deleteFood(foodId)
                );

                await Promise.all(deletePromises);
                
                // Remove deleted foods from state
                this.state.data.foods = this.state.data.foods.filter(food => 
                    !this.state.selectedFoods.has(food.id.toString())
                );
                
                // Clear selection
                this.state.selectedFoods.clear();
                
                // Update UI
                this.renderFoods();
                this.showSuccess(`${this.state.selectedFoods.size} food(s) deleted successfully`);
                
            } catch (error) {
                console.error('Error deleting selected foods:', error);
                this.showError('Failed to delete selected foods');
            }
        }

        async handleDeleteAll() {
            if (!confirm('Are you sure you want to delete ALL foods? This action cannot be undone.')) {
                return;
            }

            try {
                // Get all food IDs
                const foodIds = this.state.data.foods.map(food => food.id);
                
                // Delete all foods in parallel
                const deletePromises = foodIds.map(foodId => 
                    window.api.admin.deleteFood(foodId)
                );

                await Promise.all(deletePromises);
                
                // Clear the foods array
                this.state.data.foods = [];
                
                // Update UI
                this.renderFoods();
                this.showSuccess('All foods deleted successfully');
                
            } catch (error) {
                console.error('Error deleting all foods:', error);
                this.showError('Failed to delete all foods');
            }
        }
    }

    return AdminClass;
})();