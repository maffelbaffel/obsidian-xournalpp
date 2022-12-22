import {Plugin, TFile, TFolder} from 'obsidian';
import {spawn} from "child_process";
import * as path from "path";
import {Source} from "./Source";
import {XournalppSettingTab} from "./ui/XournalppSettingTab";
import {XournalppPluginSettings} from "./XournalppPluginSettings";
import {Thumbnail} from "./ui/Thumbnail";

const IGNORE_HEIGHT = 0;
const IGNORE_WIDTH = 0;
const DEFAULT_SETTINGS: XournalppPluginSettings = {
	defaultHeight: IGNORE_HEIGHT,
	defaultWidth: IGNORE_WIDTH
}

export default class XournalppPlugin extends Plugin {
	settings: XournalppPluginSettings;

	async onload() {
		console.log("Loading XournalppPlugin")
		await this.loadSettings();

		this.addSettingTab(new XournalppSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor('xournalpp', async (sourceText, el, ctx) => {
			const source = Source.parseInput(sourceText, this.settings)

			let sourceFile = this.app.vault.getAbstractFileByPath(source.file)
			if (sourceFile == null) {
				this.showError(el, `Source '${source.file}' is not found`)
			} else if (sourceFile instanceof TFile) {
				await this.generatePNG(sourceFile, source)
					.then(generatedUrl => {
						this.createThumbnail(el, generatedUrl)
					}).catch(err => {
						this.showError(el, `Convert failed with error code  ${err}`)
					})
			} else if (sourceFile instanceof TFolder) {
				this.showError(el, `Source '${sourceFile.path}' is a folder. Should be .xopp`)
			}
		});
	}


	async generatePNG(file: TFile, source: Source): Promise<TFile> {
		let targetPath = path.format({...path.parse(file.path), base: '', ext: '.png'})
		console.log(`Exporting ${file.path} to ${targetPath}`);

		let args = ['-i', targetPath, file.path, `--export-range=${source.pages}`];
		if (source.height !== IGNORE_HEIGHT)
			args.push(`--export-png-height=${source.height}`)
		if (source.width !== IGNORE_WIDTH)
			args.push(`--export-png-width=${source.width}`)

		let prc = spawn('xournalpp', args, {cwd: (<any>this.app.vault.adapter)['basePath']});
		prc.stdout.setEncoding('utf8');
		prc.stdout.on('data', function (data) {
			let str = data.toString()
			let lines = str.split(/(\r?\n)/g);
			console.log(lines.join(""));
		});

		return new Promise((resolve, reject) => {
			prc.on('close', async (code) => {
				if (code !== 0)
					reject(code);
				else
					resolve(this.app.vault.getAbstractFileByPath(targetPath) as TFile);
			});
		});
	}

	createThumbnail(el: HTMLElement, file: TFile) {
		let thumbnailUrl = this.app.vault.getResourcePath(file);

		new Thumbnail(el, file, thumbnailUrl).display()
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
