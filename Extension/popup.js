document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('infoButton');
    
    button.addEventListener('click', () => {
        // Simple action: Alert a message
        alert('Hello, Chrome Extension World!'); 
        
        // This will close the popup automatically after the alert is dismissed
    });
});