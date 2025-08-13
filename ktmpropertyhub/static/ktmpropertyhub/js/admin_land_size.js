// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURATION AND ELEMENT SELECTION ---
    const hillyInputs = {
        ropani: document.querySelector('#id_size_ropani'),
        aana: document.querySelector('#id_size_aana'),
        paisa: document.querySelector('#id_size_paisa'),
        dam: document.querySelector('#id_size_dam')
    };

    const teraiInputs = {
        bigha: document.querySelector('#id_size_bigha'),
        katha: document.querySelector('#id_size_katha'),
        dhur: document.querySelector('#id_size_dhur')
    };

    // The target field for our real-time calculation
    const totalSqftOutput = document.querySelector('#id_total_land_area_sqft');

    // Check if all required elements are on the page
    if (!hillyInputs.ropani || !teraiInputs.bigha || !totalSqftOutput) {
        return;
    }

    // --- 2. THE REAL-TIME CALCULATION LOGIC ---
    const CONVERSION = {
        ROPANI_SQFT: 5476,
        AANA_SQFT: 342.25,
        PAISA_SQFT: 85.56,
        DAM_SQFT: 21.39,
        BIGHA_SQFT: 72900,
        KATHA_SQFT: 3645,
        DHUR_SQFT: 182.25
    };

    const calculateAndUpdateTotal = () => {
        let total = 0;
        const allHillyInputs = Object.values(hillyInputs);
        const allTeraiInputs = Object.values(teraiInputs);

        const isHillyActive = allHillyInputs.some(input => input.value.trim() !== '');

        if (isHillyActive) {
            total = (parseInt(hillyInputs.ropani.value || 0) * CONVERSION.ROPANI_SQFT) +
                (parseInt(hillyInputs.aana.value || 0) * CONVERSION.AANA_SQFT) +
                (parseInt(hillyInputs.paisa.value || 0) * CONVERSION.PAISA_SQFT) +
                (parseInt(hillyInputs.dam.value || 0) * CONVERSION.DAM_SQFT);
        } else {
            total = (parseInt(teraiInputs.bigha.value || 0) * CONVERSION.BIGHA_SQFT) +
                (parseInt(teraiInputs.katha.value || 0) * CONVERSION.KATHA_SQFT) +
                (parseInt(teraiInputs.dhur.value || 0) * CONVERSION.DHUR_SQFT);
        }

        // Update the read-only total field with the calculated value, formatted to 2 decimal places.
        totalSqftOutput.value = total.toFixed(2);
    };

    // --- 3. THE FIELD CLEARING LOGIC (ENHANCED) ---
    const clearInputs = (inputs) => {
        Object.values(inputs).forEach(input => {
            input.value = '';
        });
    };

    Object.values(hillyInputs).forEach(input => {
        input.addEventListener('input', () => {
            clearInputs(teraiInputs);
            calculateAndUpdateTotal(); // Recalculate on every input
        });
    });

    Object.values(teraiInputs).forEach(input => {
        input.addEventListener('input', () => {
            clearInputs(hillyInputs);
            calculateAndUpdateTotal(); // Recalculate on every input
        });
    });
});