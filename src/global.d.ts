import * as events from './util/events'

declare global {
	const BlockbenchPluginTemplate: {
		events: typeof events
	}

	//-------------------------------
	// Blockbench Type modifications
	//-------------------------------

	interface ModelProject {
		lastExportPath?: string
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface _Animation {
		export: boolean
		enable_curve: boolean
		variable_name: string
	}
}
