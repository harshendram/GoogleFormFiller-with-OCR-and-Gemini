(function () {
  let form = document.querySelector("form");

  // Extract form title
  let formTitleElement = document.querySelector(
    "input[aria-label='Form title'], div[role='heading']"
  );
  let formTitle = formTitleElement
    ? formTitleElement.textContent.trim() || formTitleElement.value.trim()
    : "Untitled Form";

  let formDescriptionElement = document.querySelector(
    "div[aria-label='Form description'], input[aria-label='Form description']"
  );
  let formDescription = formDescriptionElement
    ? formDescriptionElement.textContent.trim() ||
      formDescriptionElement.value.trim()
    : "No description provided";

  function decodeHtmlEntities(str) {
    const element = document.createElement("div");
    element.innerHTML = str;
    return element.textContent;
  }

  function parseFormData(questions) {
    return questions.map((question) => {
      try {
        const formData = {
          text: "",
          description: "",
          options: [],
          imgUrl: question["img-url"],
          imgText: null,
        };

        question = decodeHtmlEntities(question["data-params"]);

        const textMatch = question.match(/^\%\.\@\.\[\d+,"([^"]+)"/);
        if (textMatch) {
          formData.text = textMatch[1];
        }

        const descriptionMatch = question.match(
          /^\%\.\@\.\[\d+,"[^"]+","([^"]+)"/
        );
        if (descriptionMatch) {
          formData.description = descriptionMatch[1];
        }

        const optionsSection = question.match(/\[\[\d+,\[(.*?)\]\]\]/);
        if (optionsSection) {
          const optionsMatches = optionsSection[1].split(/],\[/);

          formData.options = optionsMatches
            .map((option) => {
              const match = option.match(/"([^"]+)"/);
              return match ? match[1] : null;
            })
            .filter((opt) => opt !== null);
        }

        return formData;
      } catch (error) {
        console.error("Error parsing question:", error);
        return {
          text: "",
          description: "",
          options: [],
          imgUrl: null,
          imgText: null,
        };
      }
    });
  }

  const questions = [];
  const listItems = form.querySelectorAll('div[role="listitem"]');

  listItems.forEach((item) => {
    const data = {
      "data-params": "",
      "img-url": null,
    };
    const questionDiv = item.querySelector("div[data-params]");
    const imgDiv = item.querySelector("img");
    if (imgDiv) data["img-url"] = imgDiv.getAttribute("src");
    if (questionDiv)
      data["data-params"] = questionDiv.getAttribute("data-params");
    if (questionDiv || imgDiv) {
      questions.push(data);
    }
  });

  const parsedData = parseFormData(questions);

  //const url = "http://localhost:3100";
  const url = "https://chrome-ext-backend.onrender.com";

  fetch(url + "/api/gemini/content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      formTitle: formTitle,
      formDescription: formDescription,
      questions: parsedData,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);

      const formUrl = window.location.href;
      const storageData = {};
      storageData[formUrl] = data;
      chrome.storage.local.set(storageData);

      chrome.runtime.sendMessage({
        action: "apiResponse",
        data,
      });
    })
    .catch((error) => {
      console.error("Error making API call:", error);
      chrome.runtime.sendMessage({
        action: "apiResponseError",
        error: "Failed to fetch data. Please try again.",
      });
    });
})();
