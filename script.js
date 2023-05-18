$(document).on("load" , function(){
    console.log("Hello")
});     

$("#prova").on("click" , function (e) { 
    e.preventDefault();
    console.log("CIAO")
});