// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // We can use a shared class to identify our inputs
    const hillyInputs = document.querySelectorAll('.hilly-area-input input');
    const teraiInputs = document.querySelectorAll('.terai-area-input input');

    if (hillyInputs.length === 0 || teraiInputs.length === 0) {
        return; // Exit if the fields aren't on the page
    }

    const clearInputs = (inputs) => {
        inputs.forEach(input => {
            input.value = '';
        });
    };

    hillyInputs.forEach(input => {
        input.addEventListener('input', () => {
            // When a Hilly input is used, clear all Terai inputs
            clearInputs(teraiInputs);
        });
    });

    teraiInputs.forEach(input => {
        input.addEventListener('input', () => {
            // When a Terai input is used, clear all Hilly inputs
            clearInputs(hillyInputs);
        });
    });
});