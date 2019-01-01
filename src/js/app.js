import $ from 'jquery';
import {parseCode} from './code-analyzer';
const vis = require('vis');

$(document).ready(function () {
    $('#Sbtn').click(() => {
        let code = $('#txt1').val();
        let args = $('#txt2').val();
        showGraph(code, args);
    });
});

function showGraph(code, args) {
    let DOTstring = 'dinetwork {' + parseCode(code, args) + '}';
    let parsedData = vis.network.convertDot(DOTstring);

    let data = {
        nodes: parsedData.nodes,
        edges: parsedData.edges
    };

    let options = parsedData.options;

    options.nodes = {
        color: 'red'
    };

    new vis.Network(document.getElementById('txt3'), data, options);
}
