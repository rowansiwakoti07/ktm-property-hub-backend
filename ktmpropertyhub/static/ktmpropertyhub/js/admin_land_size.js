(function () {
    function init() {
        // --- 1. ELEMENT SELECTION ---
        const hillyInputs = document.querySelectorAll('.hilly-area-input');
        const teraiInputs = document.querySelectorAll('.terai-area-input');
        const totalSqftOutput = document.querySelector('#id_total_land_area_sqft');

        // allow either group to exist; just require the output
        if ((!hillyInputs.length && !teraiInputs.length) || !totalSqftOutput) return;

        // --- 2. CALC ---
        const CONVERSION = {
            ROPANI_SQFT: 5476, AANA_SQFT: 342.25, PAISA_SQFT: 85.56, DAM_SQFT: 21.39,
            BIGHA_SQFT: 72900, KATHA_SQFT: 3645, DHUR_SQFT: 182.25
        };

        const calculateAndUpdateTotal = () => {
            const val = id => (document.querySelector(id)?.value || 0);
            const ropani = val('#id_size_ropani');
            const aana = val('#id_size_aana');
            const paisa = val('#id_size_paisa');
            const dam = val('#id_size_dam');
            const bigha = val('#id_size_bigha');
            const katha = val('#id_size_katha');
            const dhur = val('#id_size_dhur');

            const anyHilly = Array.from(hillyInputs).some(i => i.value.trim() !== '');
            let total = 0;

            if (anyHilly) {
                total =
                    parseInt(ropani) * CONVERSION.ROPANI_SQFT +
                    parseInt(aana) * CONVERSION.AANA_SQFT +
                    parseInt(paisa) * CONVERSION.PAISA_SQFT +
                    parseInt(dam) * CONVERSION.DAM_SQFT;
            } else {
                total =
                    parseInt(bigha) * CONVERSION.BIGHA_SQFT +
                    parseInt(katha) * CONVERSION.KATHA_SQFT +
                    parseInt(dhur) * CONVERSION.DHUR_SQFT;
            }

            totalSqftOutput.value = Number.isFinite(total) ? total.toFixed(2) : '';
        };

        const clearInputs = inputs => inputs.forEach(i => (i.value = ''));

        hillyInputs.forEach(input => {
            input.addEventListener('input', () => {
                if (Array.from(hillyInputs).some(i => i.value.trim() !== '')) {
                    clearInputs(teraiInputs);
                }
                calculateAndUpdateTotal();
            });
        });

        teraiInputs.forEach(input => {
            input.addEventListener('input', () => {
                if (Array.from(teraiInputs).some(i => i.value.trim() !== '')) {
                    clearInputs(hillyInputs);
                }
                calculateAndUpdateTotal();
            });
        });

        calculateAndUpdateTotal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
