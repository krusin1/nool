// Send to Nool: exports the selected layers as PNG and hands them to the UI,
// which uploads them to the Nool app running on this computer.

figma.showUI(__html__, { width: 320, height: 520, themeColors: true });

function describeSelection() {
	const nodes = figma.currentPage.selection;
	figma.ui.postMessage({ type: 'selection', count: nodes.length, names: nodes.slice(0, 5).map((n) => n.name) });
}

figma.on('selectionchange', describeSelection);

figma.ui.onmessage = async (msg) => {
	if (msg.type === 'load-settings') {
		const settings = (await figma.clientStorage.getAsync('nool')) || {};
		figma.ui.postMessage({ type: 'settings', settings });
		describeSelection();
	}

	if (msg.type === 'save-settings') {
		await figma.clientStorage.setAsync('nool', msg.settings);
	}

	if (msg.type === 'export') {
		const nodes = figma.currentPage.selection.filter((n) => 'exportAsync' in n);
		if (!nodes.length) {
			figma.ui.postMessage({ type: 'error', message: 'Select one or more frames or layers first.' });
			return;
		}
		const images = [];
		for (const node of nodes) {
			const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: msg.scale || 2 } });
			images.push({ name: node.name, bytes });
		}
		figma.ui.postMessage({ type: 'exported', images });
	}

	if (msg.type === 'notify') figma.notify(msg.message);
};
