export function loadSelect(selectObj) {
    // This function loads the select control with product data
    // received from a call to the Django backend
    fetch(`products`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(products => {
            //add products to drop down
            console.log(products);
            //reset the drop list given we have a server response
            selectObj.innerHTML = "";

            // Populate the option values for the drop-down
            for (let key in products) {
                let option = document.createElement('option');
                option.setAttribute('value', products[key]);
                option.innerHTML = key;
                selectObj.append(option);
            }

        });
}