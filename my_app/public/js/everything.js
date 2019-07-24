// Emoji area one
// $(document).ready(function() {
// 	$(".emojionearea1").emojioneArea({
//   	pickerPosition: "bottom",
//   	filtersPosition: "bottom",
//     tonesStyle: "checkbox"
//   });
// });

// disable submit button
$(document).ready(function () {
    $('.submit').prop('disabled', true);
    $('.inputSend').keyup(function () {
        $('.submit').prop('disabled', this.value !== "" ? false : true);
    });
});

// CK Editor
ClassicEditor
    .create(document.querySelector('#desc'))
    .catch(error => {
        console.error(error);
    });

// <input type="button" value="Convert" onclick="convert()"/>
// function convert() {
//     var input = document.getElementById('inputText').value;
//     var output = joypixels.toImage(input);
//     document.getElementById('outputText').innerHTML = output;
// }

// Checkbox
$(document).ready(function () {
    $('.ui.checkbox').checkbox();
});

// Modal
$(function () {
    $('#test').click(function () {
        $('.test').modal('show');
    });
    $('.test').modal({
        closable: true
    });
});