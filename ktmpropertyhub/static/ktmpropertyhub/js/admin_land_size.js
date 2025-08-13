// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURATION AND ELEMENT SELECTION ---
    const allHillyInputs = document.querySelectorAll('.hilly-area-input');
    const allTeraiInputs = document.querySelectorAll('.terai-area-input');

    // Get specific inputs by ID for calculation
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
    const totalSqftOutput = document.querySelector('#id_total_land_area_sqft');

    if (allHillyInputs.length === 0 || allTeraiInputs.length === 0 || !totalSqftOutput) {
        return;
    }

    // --- 2. THE REAL-TIME CALCULATION LOGIC ---
    const CONVERSION = {
        ROPANI_SQFT: 5476, AANA_SQFT: 342.25, PAISA_SQFT: 85.56, DAM_SQFT: 21.39,
        BIGHA_SQFT: 72900, KATHA_SQFT: 3645, DHUR_SQFT: 182.25
    };

    const calculateAndUpdateTotal = () => {
        let total = 0;
        const isHillyActive = Array.from(allHillyInputs).some(input => input.value.trim() !== '');

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
        totalSqftOutput.value = total.toFixed(2);
    };

    // --- 3. THE FIELD CLEARING LOGIC (COMBINED WITH CALCULATION) ---
    const clearInputs = (inputs) => {
        inputs.forEach(input => { input.value = ''; });
    };

    allHillyInputs.forEach(input => {
        input.addEventListener('input', () => {
            const anyHillyValue = Array.from(allHillyInputs).some(i => i.value.trim() !== '');
            if (anyHillyValue) {
                clearInputs(allTeraiInputs);
            }
            calculateAndUpdateTotal(); // Recalculate on every input
        });
    });

    allTeraiInputs.forEach(input => {
        input.addEventListener('input', () => {
            const anyTeraiValue = Array.from(allTeraiInputs).some(i => i.value.trim() !== '');
            if (anyTeraiValue) {
                clearInputs(allHillyInputs);
            }
            calculateAndUpdateTotal(); // Recalculate on every input
        });
    });

    // Run once on load to calculate initial value if form is pre-filled (edit page)
    calculateAndUpdateTotal();
});