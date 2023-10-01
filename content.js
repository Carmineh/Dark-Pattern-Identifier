var textComparisonList = [];
var switchValue;
var verifiedElements = [];
$(window).on("load", () => {
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
				findDarkPattern();
			} else if (request.message.includes("textComparison")) {
				textComparisonList = request.payload.value;
				findDarkPattern();
			}
		}
		if (request.message.includes("scrollTo")) {
			pos = request.payload;
			if (pos - 1 >= 0) {
				verifiedElements[pos - 1].element.scrollIntoView();
				verifiedElements[pos - 1].element.style.border = "2px solid red";
			} else {
				window.scrollTo(0, 0);
			}
		}
	});
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
		updateBadge("");
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
	const checkedElements = verifyElements();

	console.log("[findDarkPattern] ", checkedElements);

	if (switchValue) {
		updateElementList(checkedElements.length, checkedElements);
	} else {
		updateElementList(0, checkedElements);
	}
}

function verifyElements() {
	const buttons = document.querySelectorAll("button");
	const links = document.querySelectorAll("a");

	verifiedElements = [];

	buttons.forEach((elem) => {
		let computedStyle = window.getComputedStyle(elem);

		let rgbaValue = computedStyle.backgroundColor;
		const alpha = parseFloat(rgbaValue.split(",")[3]);
		const threshold = 0.5;

		if (alpha < threshold && alpha != 0) {
			verifiedElements.push({ element: elem, message: "Disguised Button" });
		} else {
			if (textComparisonList.includes(elem.text)) {
				verifiedElements.push({ element: elem, message: elem.text });
			}
		}
	});

	links.forEach((elem) => {
		textComparisonList.forEach((obj) => {
			if (obj.name === elem.text) {
				verifiedElements.push({ element: elem, message: obj.msg });
			}
		});
	});
	return verifiedElements;
}
