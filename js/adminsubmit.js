$('#upload-s3-form').submit(function (e) {
    e.preventDefault();
    alert("heelo")
    var form = this;
    sendFile(form);
})
var sendFile = function (form) {
    var field = $(form).find('input[name=s3-file]')
    var file = field[0].files[0];
    var s3file = file.name
    var Exten = s3file.split('.').pop()
    alert(Exten)
    alert("ander")

    $.ajax({
        url: 'https://d17q6ufckg.execute-api.ap-south-1.amazonaws.com/v1/users',
        method: 'POST',
        crossDomain: true,
        contentType: 'application/json',
        data: JSON.stringify({
            s3fileExten: Exten
        }),
        succes: function (data, status, xhr) { 
            console.log(data)
            console.log(status)
            console.log(xhr)
            alert("bhar"+data)
        },
        error: function(xhr,status,error){
            console.log("#################")
            alert("error")
        }
    })
}