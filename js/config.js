// Global API configuration
var API_BASE_URL = 'http://localhost:5000/api/v1';

// Using var for global scope accessibility in non-module scripts
var CONFIG = {
    API: {
        BASE_URL: API_BASE_URL,
        getUrl: function(endpoint) {
            return this.BASE_URL + endpoint;
        }
    }
};

CONFIG;
