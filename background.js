//Script che viene eseguito nel momento in cui viene caricata la pagina
console.log("Esecuzione Background Script");

/*
    TODO: Implementare Database: indexedDB
    TODO: Inviare una richiesta al 'Popup' per aggiornare Badge [Numero di DP Individuati]
    TODO: Implementare metodi: Inserimento, Cancellazione, Modifica, Retrieve Dati
    TODO: Implementare Sistema Messagistica: Content <=> Background , Popup <=> Background
*/

// ! Database Implementation
/*
    * Utils: Name[] , Value[];
    *   - Name[switchValue] , Value[true/false];
    *   - Name[darkPatternIdentified] , Value[#]; => # = Numero DP Identificati
*/

let defaultValues = [{
    'name' : 'switchValue',
    'value': false
},{
    'name' : 'darkPatternIdentified',
    'value': 0
}]

let db = null;

function createDB(){
    const request = self.indexedDB.open('UtilsDB', 1);

    request.onerror = function(event){
        console.log("[ERROR] Apertura Database non riuscita");
    }

    request.onupgradeneeded = function(event){
        
        db = event.target.result;

        let objectStore = db.createObjectStore('utils', {
            keyPath: 'name'
        });

        objectStore.transaction.oncomplete = function(event) {
            console.log("[COMPLETE] ObjectStore creato");
        }
    }

    request.onsuccess = function(event){
        db = event.target.result;
        console.log("[SUCCESS] Apertura Database riuscita");

        defaultValueInsert(defaultValues);

        db.onerror = function(event){
            console.log("[ERROR] Apertura Database non riuscita");
        }
    }

    
}

function defaultValueInsert(objects){
    if(db){
        const insert_transaction = db.transaction('utils', 'readwrite');
        const objectStore = insert_transaction.objectStore('utils');

        insert_transaction.oncomplete = function(){
            console.log("[COMPLETE] Transazioni di inserimento completate");
        }

        insert_transaction.onerror = function(){
            console.log("[ERROR] Problema nell'inserimento");
        }

        defaultValues.forEach(util => {
            let request = objectStore.put(util);

            request.onsuccess = function(){
                console.log("[SUCCESS] Aggiunto " + util.name + " " +util.value);
            }
        });
    }
}


createDB();



