document.addEventListener('DOMContentLoaded', function () {

processData('9500a31a-0c68-4449-9508-d4059847d8f1')

});
function processData(batch){
let candle_records = undefined;

    fetch(`patterns/${batch}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject(response);
        })
        .then(entry => {
            alert('test');
            patterns = entry.patterns;


        });
}
function createTable(){
    const tableDiv = document.createElement('div');

    tableDiv.classList.add('container', 'p-3', 'my-3', 'border');

    // Create a div container for the sender
    const senderDivRow = document.createElement('div');
    senderDivRow.setAttribute('class', 'row');

}
