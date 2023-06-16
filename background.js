//Script che viene eseguito nel momento in cui viene caricata la pagina
console.log("Esecuzione Background Script");

/*
*     AGGIORNAMENTO BADGE = Messaggio allo storage => onUpdate(): Aggiorno Badge
TODO  Aggiornamento Badge quando viene individuato un dark Pattern
*/
chrome.storage.onChanged.addListener((changes , namespace) => {

    let darkPatternIdentified = changes.darkPatternIdentified.newValue.toString();
    console.log("[DEBUG] darkPatternIdentified: " + darkPatternIdentified);

    //Setto colore del badge a rosso (Default)
    chrome.action.setBadgeBackgroundColor({ color: '#892121' })

    //Cambio testo presente nel badge
    chrome.action.setBadgeText({text : darkPatternIdentified});
        
});