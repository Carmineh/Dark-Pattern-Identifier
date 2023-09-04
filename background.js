console.log("Esecuzione Background Script");
/*
    !TODO: Implementare Database: indexedDB
    !TODO:  Inviare una richiesta al 'Popup' per aggiornare Badge [Numero di DP Individuati]
    !TODO: Implementare metodi: Inserimento, Cancellazione, Modifica, Retrieve Dati 
    !TODO:  Implementare Sistema Messagistica: Content <=> Background , Popup <=> Background
    !TODO:  Implementare Promise nei metodi del Database
	!TODO:  Implementare per ogni richiesta al DB il send per il content script
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "delete") {
		let delete_request = deleteValue(request.payload);

		delete_request.then((res) => {
			chrome.runtime.sendMessage({
				message: "delete_success",
				payload: res,
			});
		});
	} else if (request.message === "update") {
		let update_request = updateValue(request.payload);
		update_request.then((res) => {
			chrome.runtime.sendMessage({
				message: "update_success",
				payload: res,
			});
		});
	} else if (request.message === "retrieve") {
		let retrieve_request = retrieveValue(request.payload);

		retrieve_request.then((res) => {
			chrome.runtime.sendMessage({
				message: "retrieve_success " + request.payload,
				payload: res,
			});
		});
	} else if (request.message === "content__delete") {
		let delete_request = deleteValue(request.payload);
	} else if (request.message === "content__update") {
		let update_request = updateValue(request.payload);
	} else if (request.message === "content__retrieve") {
		console.log("Content Retreve");
		let retrieve_request = retrieveValue(request.payload);

		retrieve_request.then((res) => {
			console.log("AAA " + res);
			chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
				var activeTab = tabs[0];
				chrome.tabs.sendMessage(activeTab.id, {
					message: "retrieve_success " + request.payload,
					payload: res,
				});
			});
		});
	} else if (request.message === "update__badge") {
		let newValue = request.payload.value;
		chrome.action.setBadgeText({ text: "" + newValue });
		chrome.action.setBadgeBackgroundColor({ color: "#A30000" });
	}
});
/*
      Database Implementation
      Utils: Name[] , Value[];
        - Name[switchValue] , Value[true/false];
        - Name[numDarkPatternIdentified] , Value[#]; => # = Numero DP Identificati
		- Name[darkPatternIdentified] , Value[List]; => List = Dark Pattern Identificati
*/
let defaultValues = [
	{
		name: "switchValue",
		value: true,
	},
	{
		name: "numDarkPatternIdentified",
		value: 0,
	},
	{
		name: "darkPatternIdentified",
		value: null,
	},
	{
		name: "textComparison",
		value: null,
	},
];

let textComparisonArray = fetch("common.json")
	.then((response) => {
		if (!response.ok) {
			throw new Error("Errore nella richiesta del file JSON");
		}
		return response.json();
	})
	.then((jsonObject) => {
		console.log(jsonObject.TextComparison);
		const setText = defaultValues.map((obj) => {
			if (obj.name === "textComparison") {
				obj.value = jsonObject.TextComparison;
			}
		});
	})
	.catch((error) => {
		console.log("Errore: " + error);
	});

// console.log(textComparisonArray);

let db = null;

function createDB() {
	const request = self.indexedDB.open("UtilsDB", 1);

	request.onerror = function (event) {
		console.log("[ERROR] Apertura Database non riuscita");
	};

	request.onupgradeneeded = function (event) {
		db = event.target.result;

		let objectStore = db.createObjectStore("utils", {
			keyPath: "name",
		});

		objectStore.transaction.oncomplete = function (event) {
			console.log("[COMPLETE] ObjectStore creato");
		};
	};

	request.onsuccess = function (event) {
		db = event.target.result;
		console.log("[SUCCESS] Apertura Database riuscita");

		insertValue(defaultValues); //Inserimento valori di default (Creazione DB)

		db.onerror = function (event) {
			console.log("[ERROR] Apertura Database non riuscita");
		};
	};
}

function insertValue(values) {
	if (db) {
		const insertTransaction = db.transaction("utils", "readwrite");
		const objectStore = insertTransaction.objectStore("utils");

		return new Promise((resolve, reject) => {
			insertTransaction.oncomplete = function () {
				console.log("[COMPLETE] Transazioni di inserimento completate");
				resolve(true);
			};

			insertTransaction.onerror = function () {
				console.log("[ERROR] Valori di Default già presenti");
				resolve(false);
			};

			values.forEach((util) => {
				let request = objectStore.add(util);

				request.onsuccess = function () {
					console.log("[SUCCESS] Aggiunto " + util.name + " " + util.value);
				};
			});
		});
	}
}

function updateValue(object) {
	if (db) {
		const putTransaction = db.transaction("utils", "readwrite");
		const objectStore = putTransaction.objectStore("utils");

		return new Promise((resolve, reject) => {
			putTransaction.oncomplete = function () {
				console.log("[COMPLETE] Transazione di aggiornamento completata");
				resolve(true);
			};

			putTransaction.onerror = function () {
				console.log("[ERROR] Problema nell'aggiornamento");
				resolve(false);
			};

			objectStore.put(object);
		});
	}
}

function deleteValue(name) {
	if (db) {
		const deleteTransaction = db.transaction("utils", "readwrite");
		const objectStore = deleteTransaction.objectStore("utils");

		return new Promise((resolve, reject) => {
			deleteTransaction.oncomplete = function () {
				console.log("[COMPLETE] Transazione di rimozione completata");
				resolve(true);
			};

			deleteTransaction.onerror = function () {
				console.log("[ERROR] Problema nella rimozione");
				resolve(false);
			};

			objectStore.delete(name);
		});
	}
}

function retrieveValue(name) {
	const retrieveTransaction = db.transaction("utils", "readonly");
	const objectStore = retrieveTransaction.objectStore("utils");

	return new Promise((resolve, reject) => {
		retrieveTransaction.oncomplete = function () {
			console.log("[COMPLETE] Transazione di recupero completata");
		};

		retrieveTransaction.onerror = function () {
			console.log("[ERROR] Problema nel recupero");
		};

		let request = objectStore.get(name);

		request.onsuccess = function (event) {
			resolve(event.target.result);
		};
	});
}

createDB();
