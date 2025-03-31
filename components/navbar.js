const navbar= fetch('navbar.html')
               .then(response => {if(!response.ok){
                throw new Error('Failed to fetch navbar: ' + response.statusText)
               }
            return response.text();
        })
        .then(data =>{
            document.getElementById('navbar-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error.message));