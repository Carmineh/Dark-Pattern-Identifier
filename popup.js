//Script che viene eseguito nel momento in cui viene aperta l'estensione
console.log("Esecuzione Popup Script"); 
let dp_counter = 0;

$(".testBottone").on("click" , () => {
    
    chrome.storage.local.set({darkPatternIdentified : dp_counter}).then(() => {
    console.log("Dati aggiornati!");
    });
});




