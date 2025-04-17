const food = [];
const foodGrid = document.getElementById('foodGrid');
const searchInput = document.getElementById('searchInput');
const API_BASE_URL = 'http://localhost:3002/api';

document.body.style.backgroundColor = '#f5f5f5'; // Light gray for the body background

// Create a modal element for displaying details
const modal = document.createElement('div');
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100%';
modal.style.height = '100%';
modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
modal.style.display = 'none';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';
modal.style.zIndex = '1000';

const modalContent = document.createElement('div');
modalContent.style.backgroundColor = '#fff';
modalContent.style.padding = '20px';
modalContent.style.borderRadius = '8px';
modalContent.style.width = '80%';
modalContent.style.maxHeight = '90%';
modalContent.style.overflowY = 'auto';
modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

const closeModal = document.createElement('button');
closeModal.textContent = 'Close';
closeModal.style.marginTop = '10px';
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalContent.innerHTML = ''; // Clear modal content
    modalContent.appendChild(closeModal);
});

modalContent.appendChild(closeModal);
modal.appendChild(modalContent);
document.body.appendChild(modal);

let allFoods = []; // Store all food data for filtering

const renderFoods = async () => {
    try {
        const response = await fetch('http://localhost:3002/api/foods');
        const foodData = await response.json();
        allFoods = foodData.foods; // Save all food data
        console.log(foodData.foods);

        // Clear existing foodGrid content
        foodGrid.innerHTML = '';

        // Loop over foodData.foods
        foodData.foods.forEach(foodItem => {
            const foodDiv = document.createElement('div');
            foodDiv.className = 'foodDiv';

            // Add a nice background color and padding for foodDiv
            foodDiv.style.background = '#ffffff'; // White for foodDiv background
            foodDiv.style.border = '1px solid #ddd'; // Light gray border
            foodDiv.style.borderRadius = '8px'; // Rounded corners
            foodDiv.classList.add('food-card');
            foodDiv.style.margin = '16px'; // Space between foodDivs
            foodDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; // Subtle shadow

            const foodName = document.createElement('h3');
            foodName.textContent = foodItem.name;

            const foodImg = document.createElement('img');
            foodImg.src = foodItem.image;
            foodImg.width = '350';
            foodImg.height = '300';

            const viewDetails = document.createElement('a');
            viewDetails.textContent = 'See more...';
            viewDetails.href = '#';
            viewDetails.style.display = 'block';
            viewDetails.style.marginTop = '10px';
            viewDetails.addEventListener('click', (e) => {
                e.preventDefault();
                modalContent.innerHTML = ''; // Clear previous content
                modalContent.appendChild(closeModal);

                const detailedImg = document.createElement('img');
                detailedImg.src = foodItem.image;
                detailedImg.style.width = '100%';
                detailedImg.style.borderRadius = '8px';

                const detailedName = document.createElement('h2');
                detailedName.textContent = foodItem.name;

                const detailedDescription = document.createElement('p');
                detailedDescription.textContent = foodItem.description || 'No description available.';

                modalContent.appendChild(detailedImg);
                modalContent.appendChild(detailedName);
                modalContent.appendChild(detailedDescription);
                modalContent.appendChild(closeModal);

                modal.style.display = 'flex';
            });

            foodDiv.appendChild(foodImg);
            foodDiv.appendChild(foodName);
            foodDiv.appendChild(viewDetails);
            foodGrid.appendChild(foodDiv);

            // Add a data attribute for filtering
            foodDiv.dataset.name = foodItem.name.toLowerCase();
            foodDiv.dataset.region = foodItem.region?.toLowerCase() || '';
            foodDiv.dataset.cuisine = foodItem.cuisine?.toLowerCase() || '';
        });
    } catch (error) {
        console.error(error.message || 'Could not load foods');
    }
};

// Add event listener to searchInput for filtering
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    const foodDivs = document.querySelectorAll('.foodDiv');

    foodDivs.forEach(foodDiv => {
        const name = foodDiv.dataset.name;
        const region = foodDiv.dataset.region;
        const cuisine = foodDiv.dataset.cuisine;

        if (name.includes(value) || region.includes(value) || cuisine.includes(value)) {
            foodDiv.style.display = 'block';
        } else {
            foodDiv.style.display = 'none';
        }
    });
});

// Call the renderFoods function
renderFoods();

const handleResponse= async()=>{
    try{
        const response= await fetch(API_BASE_URL)
        if(!response.ok){
            const error=await response.json()
            throw new Error(error.message || 'Something went wrong')
        }
        return response.json()

    }catch(error){
        error.message
    }

}
    
//  const foodApi={
// getFeaturedFoods: async() =>{
//     const response= await fetch(API_BASE_URL + '/foods/featured');
//     return handleResponse(response)
//     console.log(response)
// }

// const API_BASE_URL = 'http://localhost:3002/api';

// const handleResponse = async (response) => {
// if (!response.ok) {
// const error = await response.json();
// throw new Error(error.message || 'Something went wrong');
// }
// return response.json();
// };

//  const foodApi = {
// // Get featured foods
// getFeaturedFoods: async () => {
// const response = await fetch(`${API_BASE_URL}/foods/featured`);
// return handleResponse(response);
// console.log(response)
// },

// }
