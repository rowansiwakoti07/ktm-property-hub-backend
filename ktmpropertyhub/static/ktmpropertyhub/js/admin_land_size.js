// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. ELEMENT SELECTION (Using your proven class-based selectors) ---
    const hillyInputs = document.querySelectorAll('.hilly-area-input');
    const teraiInputs = document.querySelectorAll('.terai-area-input');

    // We add the selector for the output field
    const totalSqftOutput = document.querySelector('#id_total_land_area_sqft');

    if (hillyInputs.length === 0 || teraiInputs.length === 0 || !totalSqftOutput) {
        return; // Exit safely if any required elements are missing
    }

    // --- 2. THE REAL-TIME CALCULATION LOGIC ---
    const CONVERSION = {
        ROPANI_SQFT: 5476, AANA_SQFT: 342.25, PAISA_SQFT: 85.56, DAM_SQFT: 21.39,
        BIGHA_SQFT: 72900, KATHA_SQFT: 3645, DHUR_SQFT: 182.25
    };

    const calculateAndUpdateTotal = () => {
        let total = 0;

        // We need the specific inputs for calculation, we can get them by their ID
        const ropani = document.querySelector('#id_size_ropani').value || 0;
        const aana = document.querySelector('#id_size_aana').value || 0;
        const paisa = document.querySelector('#id_size_paisa').value || 0;
        const dam = document.querySelector('#id_size_dam').value || 0;

        const bigha = document.querySelector('#id_size_bigha').value || 0;
        const katha = document.querySelector('#id_size_katha').value || 0;
        const dhur = document.querySelector('#id_size_dhur').value || 0;

        const isHillyActive = Array.from(hillyInputs).some(input => input.value.trim() !== '');

        if (isHillyActive) {
            total = (parseInt(ropani) * CONVERSION.ROPANI_SQFT) +
                (parseInt(aana) * CONVERSION.AANA_SQFT) +
                (parseInt(paisa) * CONVERSION.PAISA_SQFT) +
                (parseInt(dam) * CONVERSION.DAM_SQFT);
        } else {
            total = (parseInt(bigha) * CONVERSION.BIGHA_SQFT) +
                (parseInt(katha) * CONVERSION.KATHA_SQFT) +
                (parseInt(dhur) * CONVERSION.DHUR_SQFT);
        }

        totalSqftOutput.value = total.toFixed(2);
    };

    // --- 3. YOUR PROVEN FIELD CLEARING LOGIC (with calculation added) ---
    const clearInputs = (inputs) => {
        inputs.forEach(input => {
            input.value = '';
        });
    };

    hillyInputs.forEach(input => {
        input.addEventListener('input', () => {
            const anyHillyValue = Array.from(hillyInputs).some(i => i.value.trim() !== '');
            if (anyHillyValue) {
                clearInputs(teraiInputs);
            }
            // Add the calculation call here
            calculateAndUpdateTotal();
        });
    });