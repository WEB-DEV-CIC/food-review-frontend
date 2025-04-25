// ...existing code...

async function submitReview(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to submit a review');
        return;
    }

    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;
    const foodId = new URLSearchParams(window.location.search).get('id');

    try {
        const response = await fetch(`http://localhost:3002/api/v1/foods/${foodId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit review');
        }

        // Clear form and refresh reviews
        document.getElementById('reviewForm').reset();
        await loadFoodDetails(foodId);
        alert('Review submitted successfully!');

    } catch (error) {
        console.error('Review submission error:', error);
        alert(error.message);
    }
}

// ...existing code...