import {debounce, Plugin, TAbstractFile, TFile, TFolder} from 'obsidian';
import {Source} from "./Source";
import {XournalppSettingTab} from "./ui/XournalppSettingTab";
import {XournalppPluginSettings} from "./XournalppPluginSettings";
import {Thumbnail} from "./ui/Thumbnail";
import {XournalppConverter} from "./XournalppConverter";

export const IGNORE_HEIGHT = 0;
export const IGNORE_WIDTH = 0;
const DEFAULT_SETTINGS: XournalppPluginSettings = {
	defaultHeight: IGNORE_HEIGHT,
	defaultWidth: IGNORE_WIDTH
}

export default class XournalppPlugin extends Plugin {
	settings: XournalppPluginSettings;
	private converter = new XournalppConverter(this.app)

	async onload() {
		console.debug("Loading XournalppPlugin")
		let processDebouncer = debounce(async (sourceText: string, el: HTMLElement) => this.process(sourceText, el), 50);

		await this.loadSettings();
		this.addSettingTab(new XournalppSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor('xournalpp', async (sourceText, el) => processDebouncer(sourceText, el));
	}

	async process(sourceText: string, el: HTMLElement) {
		const source = Source.parseInput(sourceText, this.settings)

		const sourceFile = this.app.vault.getAbstractFileByPath(source.file)
		if (sourceFile == null) {
			this.showError(el, `Source '${source.file}' is not found`)
		} else if (sourceFile instanceof TFile) {
			if (sourceFile.extension !== 'xopp')
				this.showError(el, `Source '${sourceFile.path}' is not a .xopp`)
			else
				await this.converter.generatePNG(sourceFile, source)
					.then(thumbnailFile => {
						this.createThumbnail(el, thumbnailFile, sourceFile)
					}).catch(err => {
						this.showError(el, `Convert failed with error code  ${err}`)
					})
		} else if (sourceFile instanceof TFolder) {
			this.showError(el, `Source '${sourceFile.path}' is a folder. Should be .xopp`)
		}
	}

	createThumbnail(el: HTMLElement, thumbnailFile: TFile, sourceFile: TFile) {
		new Thumbnail(el, thumbnailFile, sourceFile).display()
	}

	showError(el: HTMLElement, error: string) {
		const span = el.createEl('span');
		span.innerText = error;
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
