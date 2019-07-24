/* Maintainances Chart (Bar Graph) */
window.addEventListener('load', setup);

async function setup() {
    const result = await getData();
    const result2 = await getIndensTbl();

    new Chartist.Bar('.ct-chart', {
        labels: result.plateNumber,
        series: result.sumMtnc
    },
        {
            distributeSeries: true,
            axisY: {
                offset: 80,
                labelInterpolationFnc: function (value) {
                    return 'RM ' + value
                },
                scaleMinSpace: 15
            }
        });

    /*
    new Chartist.Bar('.ct-chart', {
        labels: result.plateNumber,
        series: [
            result.sumMtnc,
            result2.rm
        ]
    }, {
            seriesBarDistance: 10,
            axisX: {
                offset: 60
            },
            axisY: {
                offset: 80,
                labelInterpolationFnc: function (value) {
                    return 'RM ' + value 
                },
                scaleMinSpace: 15
            }
        });
    */
}
// getData();
async function getData() {
    const data = await <%- JSON.stringify(maintainancesStat) %>

    const plateNumber = []
    const sumMtnc = []

    data.forEach(row => {
        // console.log(row);
        plateNumber.push(row._id)
        sumMtnc.push(row.number)
    });
    return { plateNumber, sumMtnc };
}

getIndensTbl();
async function getIndensTbl() {
    const data = await <%- JSON.stringify(indensTable) %>

    const liter = []
    const rm = []

    data.forEach(row => {
        liter.push(row.sumLiter)
        rm.push(row.sumRM)
    });
    return { liter, rm };
}

/* Maintainances Graph (Doughnut Chart) */
/*  
            sum_ori_acq,
            sum_immovable_aset,
            sum_movable_assets,
            sum_mtnc,
        */
window.addEventListener('load', allSumGraph);

async function allSumGraph() {
    const result2 = await getAllSums2();
    const result3 = await getAllSums3();

    var data = {
        labels: ['Bananas', 'Apples', 'Grapes'],
        series: [result1.total1, result2.total2, result3.total3]
    };

    var options = {
        labelInterpolationFnc: function (value) {
            return value[0]
        }
    };

    var responsiveOptions = [
        ['screen and (min-width: 640px)', {
            chartPadding: 30,
            labelOffset: 100,
            labelDirection: 'explode',
            labelInterpolationFnc: function (value) {
                return value;
            }
        }],
        ['screen and (min-width: 1024px)', {
            labelOffset: 80,
            chartPadding: 20
        }]
    ];

    new Chartist.Pie('.allSumGraph', data, options, responsiveOptions);
}

async function getAllSums2() {
    const data2 = await <%- JSON.stringify(sum_movable_assets) %>;
    const id2 = [];
    const total2 = [];

    data2.forEach(row => {
        total2.push(row.total);
    });
    return { id2, total2 };
}

async function getAllSums3() {
    const data3 = await <%- JSON.stringify(sum_mtnc) %>;
    const id3 = [];
    const total3 = [];

    data3.forEach(row => {
        total3.push(row.total);
    });
    return { id3, total3 };
}