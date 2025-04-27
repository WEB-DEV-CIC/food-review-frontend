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
                }
            };

            // Bind methods to instance
            this.init = this.init.bind(this);
            this.initializeEventListeners = this.initializeEventListeners.bind(this);
            this.switchSection = this.switchSection.bind(this);
            this. EngineersloadDashboardData = this.loadDashboardData.bind(this);
            this.updateDashboardStats = this.updateDashboardStats.bind(this);
            this.loadFoods = this.loadFoods.bind(this);
            this.renderFoods = this.renderFoods.bind(this);
            this.showError = this.showError.bind(this);
            this.handleAddFood = this.handleAddFood.bind(this);
            this.handleEditFood = this.handleEditFood.bind(this);
            this.handleDeleteFood = this.handleDeleteFood.bind(this);
        }

        async init() {
            try {
                console.log('Initializing admin panel...');
                
                // Check admin access
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role !== 'admin') {
                    window.location.href = '/index.html';
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

            // Save food button
            const saveFoodBtn = document.getElementById('saveFoodBtn');
            if (saveFoodBtn) {
                saveFoodBtn.addEventListener('click', () => {
                    this.handleAddFood();
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
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-utensils fa-2x text-muted mb-3"></i>
                        <p class="text-muted">No foods found</p>
                    </td>
                </tr>
            ` : foodsToRender.map(food => `
                <tr>
                    <td>${food.id}</td>
                    <td>${food.name}</td>
                    <td>${food.rating || 'N/A'}</td>
                    <td>${food.reviewCount || 0}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="window.Admin.handleEditFood('${food._id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="window.Admin.handleDeleteFood('${food._id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
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
                // 获取表单值
                const name = document.getElementById('foodName').value;
                const region = document.getElementById('foodRegion').value;
                const description = document.getElementById('foodDescription').value;
                const image = document.getElementById('foodImage').value;

                // 验证必填字段
                if (!name || !region || !description || !image) {
                    this.showError('Please fill in all required fields');
                    return;
                }

                // 验证图片URL
                if (!image.startsWith('http://') && !image.startsWith('https://')) {
                    this.showError('Please enter a valid image URL');
                    return;
                }

                console.log('Submitting new food:', { name, region, description, image });

                // 使用正确的API调用创建食物
                // 修改：使用 window.api.admin.addFood 而不是 window.api.food.create
                const response = await window.api.admin.addFood({
                    name,
                    description,
                    region_id: parseInt(region), // 确保region_id是数字
                    image_url: image,
                    ingredients: [],  // 添加空数组，因为后端需要这些字段
                    taste_profiles: [] // 添加空数组，因为后端需要这些字段
                });

                console.log('API Response:', response);

                if (response && response.success) {
                    // 关闭模态框
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addFoodModal'));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // 清除表单
                    document.getElementById('addFoodForm').reset();
                    
                    // 显示成功消息
                    this.showSuccess('Food added successfully');
                    
                    // 重新加载数据 (修改为使用正确的方法名)
                    await this.loadFoods();
                } else {
                    throw new Error(response?.message || 'Failed to add food');
                }
            } catch (error) {
                console.error('Failed to add food:', error);
                this.showError(error.message || 'Failed to add food');
            }
        }

        async handleEditFood(foodId) {
            try {
                const food = this.state.data.foods.find(f => f._id === foodId);
                if (!food) {
                    this.showError('Food not found');
                    return;
                }

                // Show edit modal
                const editModal = document.getElementById('editFoodModal');
                if (editModal) {
                    // Populate form fields
                    document.getElementById('editFoodId').value = food._id;
                    document.getElementById('editFoodName').value = food.name;
                    document.getElementById('editFoodDescription').value = food.description;
                    document.getElementById('editFoodPrice').value = food.price;
                    document.getElementById('editFoodCuisine').value = food.cuisine;

                    // Show modal
                    const modal = new bootstrap.Modal(editModal);
                    modal.show();

                    // Handle form submission
                    const editFoodForm = document.getElementById('editFoodForm');
                    if (editFoodForm) {
                        // Remove any existing event listeners
                        const newForm = editFoodForm.cloneNode(true);
                        editFoodForm.parentNode.replaceChild(newForm, editFoodForm);

                        // Add new event listener
                        newForm.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            try {
                                const formData = {
                                    name: document.getElementById('editFoodName').value,
                                    description: document.getElementById('editFoodDescription').value,
                                    price: parseFloat(document.getElementById('editFoodPrice').value),
                                    cuisine: document.getElementById('editFoodCuisine').value,
                                    image: food.image // Preserve the existing image
                                };

                                console.log('Updating food with data:', formData);
                                const response = await window.api.admin.updateFood(foodId, formData);
                                console.log('Update response:', response);

                                if (response && response.food) {
                                    // Update food in state with the response data
                                    this.state.data.foods = this.state.data.foods.map(f => 
                                        f._id === foodId ? response.food : f
                                    );
                                    this.renderFoods();
                                    modal.hide();
                                    this.showSuccess('Food updated successfully');
                                } else {
                                    this.showError(response.message || 'Failed to update food');
                                }
                            } catch (error) {
                                console.error('Error updating food:', error);
                                this.showError('Failed to update food');
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error preparing edit form:', error);
                this.showError('Failed to prepare edit form');
            }
        }

        async handleDeleteFood(foodId) {
            try {
                if (!confirm('Are you sure you want to delete this food item?')) {
                    return;
                }

                const response = await window.api.admin.deleteFood(foodId);
                if (response.success) {
                    // Remove food from state
                    this.state.data.foods = this.state.data.foods.filter(f => f._id !== foodId);
                    this.renderFoods();
                    this.showSuccess('Food deleted successfully');
                } else {
                    this.showError(response.message || 'Failed to delete food');
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
    }

    return new AdminClass();
})();

// Make Admin available globally
window.Admin = Admin;