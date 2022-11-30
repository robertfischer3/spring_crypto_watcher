let socket = undefined;
let data = [0];
let chart = undefined;
let rollingAvg = [0];

document.addEventListener('DOMContentLoaded', function () {

    chart = new ApexCharts(document.querySelector("#chart"), initializeChart());
    chart.render();

    document.querySelector('#btn_start_charting_01').addEventListener('click', function () {
        socket = new WebSocket("wss://ws-feed.exchange.coinbase.com");
        socket.onopen = openWebSocket;
    });

    document.querySelector('#btn_stop_charting_01').addEventListener('click', function () {
        socket.close();
    });

});

function rowHandler(event){
    console.log(`rowHandler event ${event.data}`);
    const eventData = JSON.parse(event.data);
     if (eventData.type && eventData.type === "l2update") {
         if (eventData.changes[0][0]) {
             //Add a new row to the table
             addNewRow(eventData);
             //Delete any rows greater than 50
             deleteRow();

         }
     }
}
function openWebSocket() {

    socket.addEventListener('message', (event)=>{rowHandler(event); } );

    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
        if (data.length > 50) {
            data.shift();
        }
        if (rollingAvg.length > 100) {
            rollingAvg.shift();
        }
        const eventData = JSON.parse(event.data);
        if (eventData.type && eventData.type === "l2update") {
            if (eventData.product_id && eventData.product_id === "ETH-USD") {
                if (eventData.changes && eventData.changes.length === 1) {

                        if (eventData.changes[0][0] === 'buy') {

                            data.push(eventData.changes[0][1]);
                            rollingAvg.push(Number(eventData.changes[0][1]));

                            document.querySelector("#div_buy_price_01").innerHTML = eventData.changes[0][1];
                            const avg = rollingAvg.reduce((a, b) => a + b) / rollingAvg.length

                            document.querySelector("#div_rolling_avg_01").innerHTML = avg.toFixed((2));

                            chart.updateOptions({
                                yaxis: {
                                    min: (avg - 5),
                                    max: (avg + 5)
                                }
                            });

                        }

                }

            }

        }

        chart.updateSeries([{
            data: data
        }])
    });
    const jsonText = `{
            "type": "subscribe",
            "product_ids": [
                "ETH-USD",
                "ETH-EUR"
            ],
            "channels": [
                "level2",
                "heartbeat",
                {
                    "name": "ticker",
                    "product_ids": [
                        "ETH-BTC",
                        "ETH-USD"
                    ]
                }
            ]
        }`;
    socket.send(jsonText);
}

function initializeChart() {
    const options = {
        series: [{
            data: data.slice()
        }],
        chart: {
            id: 'realtime',
            height: 350,
            type: 'line',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        title: {
            text: 'Market Updating Chart',
            align: 'center'
        },
        markers: {
            size: 0
        },
        yaxis: {
            max: 2000
        },
        legend: {
            show: false
        },
    };

    return options;
}

/* This method will delete a row */
function deleteRow(rowElement) {
    const table = document.querySelector('#incoming_action_table_01');
    const rowCount = table.rows.length;
    if (rowCount <= 1) {
        return;
    }
    if (rowCount >= 50) {

        if (rowElement) {
            //delete specific row
            rowElement.parentNode.parentNode.remove();
        } else {
            //delete last row
            table.deleteRow(rowCount - 1);
        }
    }
}

/* This method will add a new row */
function addNewRow(eventData) {

    const table = document.querySelector("#incoming_action_table_01");
    const rowCount = table.rows.length;
    const cellCount = table.rows[0].cells.length;

    if (eventData.type && eventData.type === "l2update") {
        if (eventData.product_id) {
            if (eventData.changes && eventData.changes.length === 1) {
                if (eventData.changes[0][0]) {
                    // Add new rows to the top of the table
                    const row = table.insertRow(0);
                    if (cellCount) {
                        const cellChange = row.insertCell(0);
                        cellChange.innerHTML = eventData.changes[0][0];

                        const cellPrice = row.insertCell(1);
                        cellPrice.innerHTML = eventData.changes[0][1];
                        const cellVolume = row.insertCell(2);
                        cellVolume.innerHTML = eventData.changes[0][2];
                        const cellTime = row.insertCell(3);
                        const date = new Date(eventData.time);
                        cellTime.innerHTML = date.toString()

                         if (cellChange.innerHTML === 'buy')
                        {
                            cellChange.className = "text-primary";
                        }
                        else if (cellChange.innerHTML === 'sell'){

                            cellChange.className = "text-success";
                        }

                    }
                }
            }
        }
    } else {
        return false;
    }


}

