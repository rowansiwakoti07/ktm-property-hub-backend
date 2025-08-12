// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // 1. IDENTIFY OUR ELEMENTS
    // The "controller" dropdown that determines visibility
    const purposeSelect = document.querySelector('#id_listing_purpose');

    // The "target" field rows. We use the class Django automatically assigns.
    // These are all the fields that should ONLY be visible for 'BUY' listings.
    const buyOnlyFields = [
        '.field-price_min',
        '.field-road_size_min_ft',
        '.field-floors_min',
        '.field-master_bedrooms_min',
        '.field-common_bedrooms_min',
        '.field-common_bathrooms_min',
        '.field-living_rooms_min',
        '.field-kitchens_min',
        '.field-parking_car_min',
        '.field-parking_bike_min'
    ];

    if (!purposeSelect) {
        return; // Exit if the controller dropdown isn't on the page
    }

    // 2. THE CORE LOGIC FUNCTION
    const toggleFieldVisibility = () => {
        const selectedPurpose = purposeSelect.value;

        // Check if the selected purpose is 'BUY'
        const showBuyFields = (selectedPurpose === 'BUY');

        // Loop through all the buy-only fields and set their visibility
        buyOnlyFields.forEach(selector => {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) {
                // If 'BUY' is selected, show the field; otherwise, hide it.
                fieldRow.style.display = showBuyFields ? 'block' : 'none';
            }
        });
    };

    // 3. ATTACH EVENT LISTENERS
    // Listen for any change on the 'Listing purpose' dropdown
    purposeSelect.addEventListener('change', toggleFieldVisibility);

    // Run the function once when the page first loads to set the correct initial state.
    // This is crucial for "edit" pages where a purpose is already selected.
    toggleFieldVisibility();
});