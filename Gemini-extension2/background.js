chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"],
    },
    () => {
      console.log("content.js executed on icon click");
    }
  );
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules(
      [
        {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {
                hostContains: "docs.google.com",
                pathContains: "forms",
              },
            }),
          ],
          actions: [new chrome.declarativeContent.ShowPageAction()],
        },
      ],
      () => {
        console.log("Declarative rules set for Google Forms");
      }
    );
  });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      console.error("No active tab found");
      return;
    }
    const tab = tabs[0];

    if (command === "trigger-fetch") {
      chrome.storage.local.remove([tab.url], () => {
        chrome.runtime.sendMessage({ action: "showLoader" });

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      });
    } else if (command === "trigger-autofill") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["autofill.js"],
      });
    }
  });
});
