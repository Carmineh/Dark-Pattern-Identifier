//Script che viene eseguito nel momento in cui viene caricata una nuova pagina
/*
    !TODO: Inviare una richiesta al database quando viene individuato un DP [Verificato mediante algoritmo]
    !TODO: Disabilitare 'Highlight' di link/bottoni se stato Switch = False
	!TODO: ALGORITMO
*/
var textComparisonList = [];
var switchValue;
var verifiedElements = [];
$(window).on("load", () => {
	console.log("Esecuzione Content Script");

	chrome.runtime.sendMessage({
		message: "content__retrieve",
		payload: "textComparison",
	});

	chrome.runtime.sendMessage({
		message: "content__retrieve",
		payload: "switchValue",
	});

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.message === "delete_success") {
			//Delete Query
		} else if (request.message === "update_success") {
			//Update Query
			console.log("PAYLOAD: " + request.payload);
		}
		if (request.message.includes("retrieve_success")) {
			//Retrieve Query
			if (request.message.includes("switchValue")) {
				switchValue = request.payload.value;
				console.log("[DEBUG] " + switchValue);
				findDarkPattern();
			} else if (request.message.includes("textComparison")) {
				textComparisonList = request.payload.value;
				findDarkPattern();
			}
		}
		if (request.message.includes("scrollTo")) {
			pos = request.payload;
			console.log(verifiedElements[pos]);
			verifiedElements[pos].scrollIntoView();
		}
	});

	// findDarkPattern();
	//updateElementList(45, null); => Test Call badge update
});

function updateElementList(numElements, elements) {
	if (switchValue) {
		chrome.runtime.sendMessage({
			message: "update",
			payload: {
				name: "numDarkPatternIdentified",
				value: numElements,
			},
		});

		//Send a request to DB to update the value of the elements containing the DP
		chrome.runtime.sendMessage({
			message: "update",
			payload: {
				name: "darkPatternIdentified",
				value: elements,
			},
		});
		//Send a request to DB to update the value of the numOfDP
		updateBadge(numElements);
	} else {
		updateBadge("X");
	}
}

function updateBadge(newValue) {
	chrome.runtime.sendMessage({
		message: "update__badge",
		payload: {
			name: "newValue",
			value: newValue,
		},
	});
}

/*
	Find Dark pattern in the website.
		Return: an object containing [numDarkpatternIdentified (INT) , darkpatternIdentified (LIST)]
*/
function findDarkPattern() {
	const elements = verifyElements();

	if (switchValue) {
		elements.forEach((elem) => {
			elem.style.border = "2px solid red";
		});
		updateElementList(elements.length, elements);
	} else {
		elements.forEach((elem) => {
			elem.style.border = "none";
		});
		updateElementList(0, elements);
	}
}

function verifyElements() {
	const buttons = document.querySelectorAll("button");
	const links = document.querySelectorAll("a");

	// console.log("TEXT FD " + textComparisonList);
	// console.log("Switch FD " + switchValue);

	verifiedElements = [];

	buttons.forEach((elem) => {
		if (textComparisonList.includes(elem.text)) {
			verifiedElements.push(elem);
		}
	});

	links.forEach((elem) => {
		if (textComparisonList.includes(elem.text)) {
			verifiedElements.push(elem);
		}
	});

	return verifiedElements;
}
