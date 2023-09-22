//Script che viene eseguito nel momento in cui viene aperta l'estensione
console.log("Esecuzione Popup Script");
/*
	!TODO Implementare funzionalità frecce nella lista (<)  (>)
	!TODO Implementare cambiamento focus allo scorrimento della lista
	!TODO Implementare Aggiornamento numero DP nella lista (#)	
*/

const listContent = $(".list__index");
const listDecrement = $("#list__dec");
const listIncrement = $("#list__inc");
const switchStatus = $("#switch__status");
const darkPattern_Type = $("#DP_Type");
const currentWebsite = $("#CUR__Website");

let currentIndex = 1;
let maxIndex = 1;

var msgList;

//Retrieving all the elements of DB at the start
retrieveAllDatabase();
updateURL();
updateTextList();

//Updating Database when switch change status
switchStatus.on("change", () => {
	chrome.runtime.sendMessage({
		message: "update",
		payload: {
			name: "switchValue",
			value: switchStatus.is(":checked"),
		},
	});
	chrome.runtime.sendMessage({
		message: "content__retrieve",
		payload: "switchValue",
	});
	updateURL();
});

listIncrement.on("click", (e) => {
	e.preventDefault();
	nextItemList();
});

listDecrement.on("click", (e) => {
	e.preventDefault();
	previousItemList();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "delete_success") {
		//Delete Query
	} else if (request.message === "update_success") {
		//Update Query
		retrieveAllDatabase();
	}
	if (request.message.includes("retrieve_success")) {
		//Retrieve Query
		if (request.message.includes("switchValue")) {
			$("#switch__status").prop("checked", request.payload.value);
		}

		if (request.message.includes("numDarkPatternIdentified")) {
			updateCounterList(request.payload.value);
		}

		if (request.message.includes("msgList")) {
			console.log("MSGLIST ", msgList);
			msgList = request.payload.value;
		}
	}
});

// Functions for the list management
function updateCounterList(numDarkPatternIdentified) {
	if (numDarkPatternIdentified >= 0) {
		maxIndex = numDarkPatternIdentified;
		currentIndex = 0;
		updateTextList();
	}
}

//Functions for the scrolling of the list
function nextItemList() {
	//Click (>): Change Focus on the object
	//Send a message to content to change focus
	if (switchStatus.is(":checked")) {
		if (currentIndex + 1 > maxIndex) {
			currentIndex = 0;
		} else {
			currentIndex = currentIndex + 1;
		}
		//Send Message to Content with new value [currentIndex]
		scrollToElement(currentIndex);

		updateTextList();
	}
}

function previousItemList() {
	//Click (<): Change Focus on the object
	//Send a message to content to change focus
	if (switchStatus.is(":checked")) {
		if (currentIndex - 1 < 0) {
			currentIndex = maxIndex;
		} else {
			currentIndex = currentIndex - 1;
		}
		//Send Message to Content with new value [currentIndex]
		scrollToElement(currentIndex);

		updateTextList();
	}
}

function updateTextList() {
	if (switchStatus.is(":checked")) {
		updateURL();
		let newString = currentIndex + " out of " + maxIndex;
		listContent.text(newString);
		console.log("INDEX ", currentIndex);
		if (currentIndex > 0) {
			darkPattern_Type.text(msgList[currentIndex - 1]);
		} else {
			darkPattern_Type.text("...");
		}
	} else {
		listContent.text("Activate Switch to track DP");
		darkPattern_Type.text(" ");
	}
}

function updateURL() {
	if (switchStatus.is(":checked")) {
		//Update Current Site URL
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
			let url = tabs[0].url;
			var page = url.substring(0, url.indexOf("/", 9) + 1);
			currentWebsite.text(page);
			console.log("URL ", page);
		});
	} else {
		currentWebsite.text(" ");
	}
}

function sendMessageContent() {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		var activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, {
			message: "retrieve_success " + request.payload,
			payload: res,
		});
	});
}

function retrieveAllDatabase() {
	chrome.runtime.sendMessage({
		message: "retrieve",
		payload: "switchValue",
	});

	chrome.runtime.sendMessage({
		message: "retrieve",
		payload: "numDarkPatternIdentified",
	});

	chrome.runtime.sendMessage({
		message: "retrieve",
		payload: "darkPatternIdentified",
	});

	chrome.runtime.sendMessage({
		message: "retrieve",
		payload: "msgList",
	});
}

function scrollToElement(element) {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		var activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, {
			message: "scrollTo " + element,
			payload: element,
		});
	});
}
