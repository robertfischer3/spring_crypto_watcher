document.addEventListener('DOMContentLoaded', function () {

    const batchSelector = document.querySelector('#Batches_01')
    if (batchSelector) {
        if (batchSelector.childElementCount > 1){
            batchSelector.onchange = function () {
                const batchIdSelector = document.querySelector("#Batches_01");
                if(batchIdSelector && batchIdSelector.value !== 'None'){
                    // If a saved data batch has been selected, then it should be loaded
                    processData(batchIdSelector.value);
                }
                else{
                    //If no batch has been selected then, the table is cleared
                    dataSavedAnalysis = document.querySelector('#data_saved_analysis_01');
                    dataSavedAnalysis.innerHTML = "";
                }

            }
        }
    }

});

function processData(batch) {
//Pull back batch data from analysis
    fetch(`patterns/${batch}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject(response);
        })
        .then(entry => {
            patterns = JSON.parse(entry.patterns);
            createTable(patterns)
        });
}

function createTable(patterns) {

    const batchSelector = document.querySelector('#Batches_01');
    const dataSavedAnalysis = document.querySelector('#data_saved_analysis_01');

    if (batchSelector.childElementCount === 1)
    {
        dataSavedAnalysis.innerHTML = "";
        return false;
    }


    if (dataSavedAnalysis === undefined) {
        alert("Error: document definition is corrupt");
    } else {

        dataSavedAnalysis.innerHTML = "";

        for (const obj of patterns) {
            console.log(obj.id, new Date(obj.created).toLocaleDateString('en-US'), new Date(obj.created).toLocaleTimeString('en-US'), obj.open, obj.high);

            //Create table row
            let tr = document.createElement('tr');

            columns = [];
            for (let i = 0; i < 16; i++){
                // Layout columns
                columns.push(document.createElement('td'));
            }

            //Grab the database primary key
            let idCol = document.createTextNode(obj.id);
            columns[0].appendChild(idCol);

            // Set the currency exchange value
            let exchangeCol = document.createTextNode(obj.product__exchange_id);
            columns[1].appendChild(exchangeCol);

            // Set the open price
            let openCol = document.createTextNode(obj.open);
            columns[2].appendChild(openCol);

            // Set the record create date
            let createdCol = document.createTextNode(new Date(obj.created).toLocaleTimeString('en-US'));
            columns[3].appendChild(createdCol);
            columns[3].title = new Date(obj.created).toLocaleDateString('en-US');

            // Set the currency high price
            let highCol = document.createTextNode(obj.high);
            columns[4].appendChild(highCol);

            // Set the currency low price
            let lowCol = document.createTextNode(obj.low);
             columns[5].appendChild(lowCol);

             // Set the currency close price
            let closeCol = document.createTextNode(obj.close);
            columns[6].appendChild(closeCol);

            // Set the volume
            let volumeCol = document.createTextNode(obj.volume);
            columns[7].appendChild(volumeCol);

            // Mark X if bullish swing is found in data
            let bullishswingCol = document.createTextNode(((obj.bullishswing) ? 'X': ''));
            columns[8].appendChild(bullishswingCol);

            // Mark X if bearish swing is found in data
            let bearishswingCol = document.createTextNode(((obj.bearishswing) ? 'X': ''));
             columns[9].appendChild(bearishswingCol);

             // Mark X if bullish pinbar is found in data
            let bullishpinbarCol = document.createTextNode(((obj.bullishpinbar) ? 'X': ''));
            columns[10].appendChild(bullishpinbarCol);

            // Mark X if bearish pinbar is found in data
            let bearishpinbarCol = document.createTextNode(((obj.bearishpinbar) ? 'X': ''));
            columns[11].appendChild(bearishpinbarCol);

            // Mark X if inside bar is found in data
            let insidebarCol = document.createTextNode(((obj.insidebar) ? 'X': ''));
            columns[12].appendChild(insidebarCol);

            // Mark X if outside bar is found in data
            let outsidebarCol = document.createTextNode(((obj.outsidebar) ? 'X': ''));
             columns[13].appendChild(outsidebarCol);

             // Mark X if bullish engulfing is found in data
            let bullishengulfingCol = document.createTextNode(((obj.bullishengulfing) ? 'X': ''));
            columns[14].appendChild(bullishengulfingCol);

            // Mark X if bearish engulfing is found in data
            let bearishengulfingCol = document.createTextNode(((obj.bearishengulfing) ? 'X': ''));
            columns[15].appendChild(bearishengulfingCol);

            for (let i = 0; i < 16; i++){
                tr.appendChild(columns[i]);
            }

            dataSavedAnalysis.appendChild(tr);
        }
    }


}
