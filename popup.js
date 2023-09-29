const listContent = $(".list__index");
const listDecrement = $("#list__dec");
const listIncrement = $("#list__inc");
const switchStatus = $("#switch__status");
const darkPattern_Type = $("#DP_msg");
const currentWebsite = $("#CUR__Website");

var darkPatternList;
let currentIndex = 1;
let maxIndex = 1;

//Retrieving all the elements of DB at the start
retrieveAllDatabase();
updateText("Start");

//Updating Database when switch change status
switchStatus.on("change", () => {
	console.log("Stato Switch " + switchStatus.is(":checked"));
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
			// console.log("[DEBUG] " + request.payload.value);
			$("#switch__status").prop("checked", request.payload.value);
		}

		if (request.message.includes("numDarkPatternIdentified")) {
			updateCounterList(request.payload.value);
		}
		if (request.message.includes("darkPatternList")) {
			darkPatternList = request.payload.value;
		}
	}
});

// Functions for the list management
function updateCounterList(numDarkPatternIdentified) {
	if (numDarkPatternIdentified >= 0) {
		maxIndex = numDarkPatternIdentified;
		currentIndex = 0;
		updateText("DP_List");
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
		//Update Operations
		updateText("DP_List");
		updateText("Message");
	}

	//Send Message to Content with new value [currentIndex]
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
	if (switchStatus.is(":checked")) {
		switch (operation) {
			default:
				console.log("Default Case");
				break;

			case "Start":
				updateText("URL");
				updateText("Message");
				updateCounterList("DP_List");
				break;

			case "URL":
				chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
					let url = tabs[0].url;
					var page = url.substring(0, url.indexOf("/", 9) + 1);
					currentWebsite.text(page);
					console.log("URL ", page);
				});
				break;

			case "Message":
				if (currentIndex - 1 >= 0)
					// darkPattern_Type.text(msgList[currentIndex - 1]);
					darkPattern_Type.text("PROVA");
				else darkPattern_Type.text(" ");

			case "DP_List":
				let newString = currentIndex + " out of " + maxIndex;
				listContent.text(newString);
				scrollToElement(currentIndex);
				break;
		}
	} else {
		listContent.text("Activate Switch to track DP");
		darkPattern_Type.text(" ");
	}
}

// function updateTextList() {
// 	if (switchStatus.is(":checked")) {
// 		let newString = currentIndex + " out of " + maxIndex;
// 		listContent.text(newString);

// 		//Update Current Site URL
// 		chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
// 			let url = tabs[0].url;
// 			var page = url.substring(0, url.indexOf("/", 9) + 1);
// 			console.log(url);
// 			console.log(page);
// 			currentWebsite.text(page);
// 		});

// 		if (currentIndex > 0) {
// 			darkPattern_Type.text(darkPatternList[currentIndex - 1].link);
// 		} else {
// 			darkPattern_Type.text("...");
// 		}

// 		console.log(darkPatternList);
// 	} else {
// 		listContent.text("Activate Switch to track DP");
// 		darkPattern_Type.text(" ");
// 		currentWebsite.text("...");
// 	}
// }

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
