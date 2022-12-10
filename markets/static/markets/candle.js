document.addEventListener('DOMContentLoaded', function () {

    processData('9500a31a-0c68-4449-9508-d4059847d8f1')

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

    dataSavedAnalysis = document.querySelector('#data_saved_analysis_01');

    if (dataSavedAnalysis === undefined) {
        alert("Error: document definition is corrupt");
    } else {

        dataSavedAnalysis.innerHTML = "";

        for (const obj of patterns) {
            console.log(obj.id, new Date(obj.created).toLocaleDateString('en-US'), new Date(obj.created).toLocaleTimeString('en-US'), obj.open, obj.high);

            var tr = document.createElement('tr');

            columns = [];
            for (let i = 0; i < 16; i++){
                columns.push(document.createElement('td'));
            }

            let idCol = document.createTextNode(obj.id);
            columns[0].appendChild(idCol);

            let exchangeCol = document.createTextNode(obj.product__exchange_id);
            columns[1].appendChild(exchangeCol);

            let openCol = document.createTextNode(obj.open);
            columns[2].appendChild(openCol);

            let createdCol = document.createTextNode(new Date(obj.created).toLocaleTimeString('en-US'));
            columns[3].appendChild(createdCol);

            let highCol = document.createTextNode(obj.high);
            columns[4].appendChild(highCol);

            let lowCol = document.createTextNode(obj.low);
             columns[5].appendChild(lowCol);

            let closeCol = document.createTextNode(obj.close);
            columns[6].appendChild(closeCol);

            let volumeCol = document.createTextNode(obj.volume);
            columns[7].appendChild(volumeCol);

            let bullishswingCol = document.createTextNode(((obj.bullishswing) ? 'X': ''));
            columns[8].appendChild(bullishswingCol);

            let bearishswingCol = document.createTextNode(((obj.bearishswing) ? 'X': ''));
             columns[9].appendChild(bearishswingCol);

            let bullishpinbarCol = document.createTextNode(((obj.bullishpinbar) ? 'X': ''));
            columns[10].appendChild(bullishpinbarCol);

            let bearishpinbarCol = document.createTextNode(((obj.bearishpinbar) ? 'X': ''));
            columns[11].appendChild(bearishpinbarCol);

            let insidebarCol = document.createTextNode(((obj.insidebar) ? 'X': ''));
            columns[12].appendChild(insidebarCol);

            let outsidebarCol = document.createTextNode(((obj.outsidebar) ? 'X': ''));
             columns[13].appendChild(outsidebarCol);

            let bullishengulfingCol = document.createTextNode(((obj.bullishengulfing) ? 'X': ''));
            columns[14].appendChild(bullishengulfingCol);

            let bearishengulfingCol = document.createTextNode(((obj.bearishengulfing) ? 'X': ''));
            columns[15].appendChild(bearishengulfingCol);

            for (let i = 0; i < 16; i++){
                tr.appendChild(columns[i]);
            }

            dataSavedAnalysis.appendChild(tr);
        }
    }


}
