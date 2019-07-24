$(document).ready(function () {
    $('#assetOfficer').on('submit', function (e) {
        e.preventDefault();

        var id = $('#id').val();
        var username = $('#username').val();

        $.ajax({
            url: '/configuration',
            type: 'POST',
            data: {
                id: id,
                username: username
            },
            success: function () {
                console.log(username);
            }
        });
    });
});