import * as Options from './lib/OptionsUtil.js';

Options.maximizeDocumentElementHeight();

// Load saved options.
Options.restore();

// Listen to clicking the save button.
Options.Elements.Submit.addEventListener('click', () => Options.save());
