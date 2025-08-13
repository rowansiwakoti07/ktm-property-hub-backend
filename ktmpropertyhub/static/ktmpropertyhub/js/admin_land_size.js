// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // The selector is now simpler and more direct.
    const hillyInputs = document.querySelectorAll('.hilly-area-input');
    const teraiInputs = document.querySelectorAll('.terai-area-input');

    if (hillyInputs.length === 0 || teraiInputs.length === 0) {
        return; // Exit if the fields aren't on the page
    }

    const clearInputs = (inputs) => {
        inputs.forEach(input => {
            input.value = '';
        });
    };

    hillyInputs.forEach(input => {
        // 'input' event is better than 'change' for instant feedback
        input.addEventListener('input', () => {
            // Check if any hilly input has a value
            const anyHillyValue = Array.from(hillyInputs).some(i => i.value.trim() !== '');
            if (anyHillyValue) {
                // When a Hilly input is used, clear all Terai inputs
                clearInputs(teraiInputs);
            }
        });
    });

    teraiInputs.forEach(input => {
        input.addEventListener('input', () => {
            const anyTeraiValue = Array.from(teraiInputs).some(i => i.value.trim() !== '');
            if (anyTeraiValue) {
                // When a Terai input is used, clear all Hilly inputs
                clearInputs(hillyInputs);
            }
        });
    });
});