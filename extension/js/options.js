import * as Options from "./lib/OptionsUtil.js";

void Options.maximizeDocumentElementHeight();

// Load saved options.
void Options.restore();

// Listen to clicking the save button.
Options.Elements.Submit.addEventListener("click", () => Options.save());
