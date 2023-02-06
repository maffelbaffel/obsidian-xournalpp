import {Plugin, TFile, TFolder} from 'obsidian';
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

		await this.loadSettings();
		this.addSettingTab(new XournalppSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor('xournalpp', async (sourceText, el) => this.process(sourceText, el));
	}

	async process(sourceText: string, el: HTMLElement) {
		const parseResult = Source.parseInput(sourceText, this.settings)

		if (parseResult.err) {
			this.showError(el, parseResult.val)
			return;
		}

		let okResult = parseResult.val;
		const sourceFile = this.app.vault.getAbstractFileByPath(okResult.file)
		if (sourceFile == null) {
			this.showError(el, `Source '${okResult.file}' is not found`)
		} else if (sourceFile instanceof TFile) {
			if (sourceFile.extension !== 'xopp')
				this.showError(el, `Source '${sourceFile.path}' is not a .xopp`)
			else
				await this.generateAndView(sourceFile, okResult, el);
		} else if (sourceFile instanceof TFolder) {
			this.showError(el, `Source '${sourceFile.path}' is a folder. Should be .xopp`)
		}
	}

	private async generateAndView(sourceFile: TFile, source: Source, el: HTMLElement) {
		await this.converter.generatePNG(sourceFile, source)
			.then(thumbnailFile => {
				this.createThumbnail(el, thumbnailFile, sourceFile, source)
			}).catch(err => {
				this.showError(el, `Convert failed with error code  ${err}`)
			})
	}

	createThumbnail(el: HTMLElement, thumbnailFile: TFile, sourceFile: TFile, source: Source) {
		new Thumbnail(el, thumbnailFile, sourceFile)
			.display(async () => {
				console.debug("refreshing xournalpp view")
				await this.generateAndView(sourceFile, source, el)
			})
	}

	showError(el: HTMLElement, error: string) {
		el.find('.xournalpp-thumbnail')?.remove()
		el.createEl('span', {}, span => {
			span.innerText = error;
			span.addClass('.xournalpp-thumbnail');
		});
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
