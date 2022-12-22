import XournalppPlugin from "../main";
import {App, PluginSettingTab, Setting} from "obsidian";

export class XournalppSettingTab extends PluginSettingTab {
	plugin: XournalppPlugin;
	heightValidationElement: HTMLElement;
	widthValidationElement: HTMLElement;

	constructor(app: App, plugin: XournalppPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;
		containerEl.empty();

		const placeholder = "0";

		// Height
		new Setting(containerEl)
			.setName("Default height")
			.setDesc("Default height for PNG export. Set to 0 to ignore")
			.addText((text) =>
				text
					.setPlaceholder(placeholder)
					.setValue(this.plugin.settings.defaultHeight?.toString() ?? placeholder)
					.onChange(async (value) => {
						let result = 0;
						if (value !== null && value !== '') {
							result = parseInt(value);
							if (isNaN(result) || result < 0) {
								this.showValidationError(this.heightValidationElement, `Invalid value ${value}. Has to be a positive number or 0`)
								return
							}
						}

						this.plugin.settings.defaultHeight = result;
						await this.plugin.saveSettings();
						this.showValidationError(this.heightValidationElement);
					})
			);
		this.heightValidationElement = containerEl.createDiv("validation", el => {
			el.style.color = 'var(--text-error)';
		});

		// Width
		new Setting(containerEl)
			.setName("Default width")
			.setDesc("Default width for PNG export. Set to 0 to ignore")
			.addText((text) =>
				text
					.setPlaceholder(placeholder)
					.setValue(this.plugin.settings.defaultWidth?.toString() ?? placeholder)
					.onChange(async (value) => {
						let result = 0;
						if (value !== null && value !== '') {
							result = parseInt(value);
							if (isNaN(result) || result < 0) {
								this.showValidationError(this.widthValidationElement, `Invalid value ${value}. Has to be a positive number or 0`)
								return
							}
						}

						this.plugin.settings.defaultWidth = result;
						await this.plugin.saveSettings();
						this.showValidationError(this.widthValidationElement);
					})
			);
		this.heightValidationElement = containerEl.createDiv("validation", el => {
			el.style.color = 'var(--text-error)';
		});
	}

	showValidationError(el: HTMLElement, error: string | null = null) {
		if (error === null) {
			el.hidden = true;
		} else {
			el.setText(error);
			el.hidden = false;
		}
	};
}
