//Script che viene eseguito nel momento in cui viene caricata una nuova pagina
console.log("Esecuzione Content Script");

if(document != null){
    const input = document.querySelector('#hex');

    input.addEventListener('input', function() {
    console.log(input.value);

});
}