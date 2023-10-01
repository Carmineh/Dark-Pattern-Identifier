const listContent = $(".list__index");
const listDecrement = $("#list__dec");
const listIncrement = $("#list__inc");
const switchStatus = $("#switch__status");
const darkPattern_Type = $("#DP_msg");
const currentWebsite = $("#CUR__Website");

let currentIndex = 1;
let maxIndex = 1;
let currentURL = " ";
let switchValue;
let darkPatternIdentified;

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
	updateText("Start");
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
			switchValue = request.payload.value;
			updateText("Start");
		}

		if (request.message.includes("numDarkPatternIdentified")) {
			updateCounterList(request.payload.value);
		}

		if (request.message.includes("darkPatternIdentified")) {
			darkPatternIdentified = request.payload.value;
			updateText("Start");
		}
	}
});

//Retrieving all the elements of DB at the start
retrieveAllDatabase();

// Functions for the list management
function updateCounterList(numDarkPatternIdentified) {
	if (numDarkPatternIdentified >= 0) {
		maxIndex = numDarkPatternIdentified;
		currentIndex = 0;
		updateText("DP_List");
	}
}
//Dark Pattern List Management
function nextItemList() {
	//Click (>): Change Focus on the object
	//Send a message to content to change focus
	if (switchStatus.is(":checked")) {
		if (currentIndex + 1 > maxIndex) {
			currentIndex = 0;
		} else {
			currentIndex = currentIndex + 1;
		}
		//Update Operations
		updateText("DP_List");
		updateText("Message");
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
		//Update Operations
		updateText("DP_List");
		updateText("Message");
	}
}

function updateText(operation) {
	if (switchValue) {
		switch (operation) {
			default:
				console.log("Default Case");
				break;

			case "Start":
				getURL().then((url) => {
					currentURL = url;
					updateText("URL");
				});
				updateText("Message");
				updateCounterList("DP_List");
				break;

			case "URL":
				currentWebsite.text(currentURL);
				break;

			case "Message":
				if (currentIndex - 1 >= 0 && darkPatternIdentified != null) {
					if (
						darkPatternIdentified[currentIndex - 1].message !=
						"Disguised Button"
					) {
						darkPattern_Type.text(
							darkPatternIdentified[currentIndex - 1].message
						);
					} else {
						darkPattern_Type.text(
							"Potential Hidden Button. Pay attention to what you are doing"
						);
					}
				} else {
					darkPattern_Type.text(" ");
				}

			case "DP_List":
				let newString = currentIndex + " out of " + maxIndex;
				listContent.text(newString);
				scrollToElement(currentIndex);
				break;
		}
	} else {
		listContent.text("Activate Switch to track DP");
		darkPattern_Type.text("");
		currentWebsite.text("");
	}
}

async function getURL() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let tabs = await chrome.tabs.query(queryOptions);
	let url = tabs[0].url;
	var url_cut = url.substring(0, url.indexOf("/", 9) + 1);
	return url_cut;
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
