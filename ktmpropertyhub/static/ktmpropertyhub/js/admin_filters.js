document.addEventListener('DOMContentLoaded', function () {
    // We are in the Django admin, so the IDs are predictable
    const stateSelect = document.querySelector('#id_state');
    const districtSelect = document.querySelector('#id_district');

    if (!stateSelect || !districtSelect) {
        // If the elements don't exist, do nothing.
        // This makes the script safe to include on other pages.
        return;
    }

    // This function will be called when the state dropdown changes
    const updateDistricts = () => {
        const stateId = stateSelect.value;
        const currentDistrictId = districtSelect.value; // Store the currently selected district

        if (!stateId) {
            // If no state is selected, clear the district dropdown
            districtSelect.innerHTML = '<option value="">---------</option>';
            return;
        }

        // Fetch the districts from our API endpoint
        // NOTE: Adjust the '/api/districts/' path if your URL is different
        fetch(`/api/districts/?state=${stateId}`)
            .then(response => response.json())
            .then(districts => {
                // Clear existing options
                districtSelect.innerHTML = '';

                // Add the default empty option first
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '---------';
                districtSelect.appendChild(defaultOption);

                // Populate the dropdown with new districts
                districts.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.id;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });

                // Try to re-select the previous district if it exists in the new list
                if (currentDistrictId) {
                    districtSelect.value = currentDistrictId;
                }
            })
            .catch(error => {
                console.error('Error fetching districts:', error);
            });
    };

    // Attach the event listener to the state dropdown
    stateSelect.addEventListener('change', updateDistricts);

    // Run it once on page load in case a state is already selected (e.g., on an edit page)
    if (stateSelect.value) {
        updateDistricts();
    }
});