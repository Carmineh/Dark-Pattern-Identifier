//Script che viene eseguito nel momento in cui viene aperta l'estensione
console.log("Esecuzione Popup Script");
/*
	TODO Implementare funzionalità frecce nella lista (<)  (>)
	TODO Implementare Aggiornamento numero DP nella lista (#)
*/
//Update switch with former status (Status before closing extension)
chrome.runtime.sendMessage({
	message: "retrieve",
	payload: "switchValue",
});

//Updating Database when switch chagne status	
$("#switch__status").on("change", () => {
	console.log($("#switch__status").is(":checked"));
	chrome.runtime.sendMessage({
		message: "update",
		payload: {
			name: "switchValue",
			value: $("#switch__status").is(":checked"),
		},
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "delete_success") {
		//Delete Query
	} else if (request.message === "update_success") {
		//Update Query
	}
	if (request.message.includes("retrieve_success")) {
		//Retrieve Query
		console.log("SONO QUI");
		if (request.message.includes("switchValue")) {
			console.log("[DEBUG] " + request.payload.value);
			$("#switch__status").prop("checked", request.payload.value);
		}
	}
});

//Update Current Site Switch
chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
	let url = tabs[0].url;
	var page = url.substring(0, url.indexOf("/", 9) + 1);
	console.log(url);
	console.log(page);
	$("#CUR__Website").text(page);
});
