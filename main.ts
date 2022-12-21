import {Plugin, TFile, TFolder} from 'obsidian';
import {spawn} from "child_process";
import * as path from "path";

interface XournalppPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: XournalppPluginSettings = {
	mySetting: 'default'
}

export default class XournalppPlugin extends Plugin {
	settings: XournalppPluginSettings;

	async onload() {
		console.log("Loading XournalppPlugin")
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor('xournalpp', async (source, el, ctx) => {
			const sourceLines = source.trim().split('\n');
			const url = sourceLines[0];

			let sourceFile = this.app.vault.getAbstractFileByPath(url)
			if (sourceFile == null) {
				this.showError(el, `Source '${url}' is not found`)
			} else if (sourceFile instanceof TFile) {
				await this.generatePNG(sourceFile)
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

	async generatePNG(file: TFile): Promise<TFile> {
		let targetPath = path.format({...path.parse(file.path), base: '', ext: '.png'})
		console.log(`Exporting ${file.path} to ${targetPath}`);

		let prc = spawn('xournalpp', ['-i', targetPath, file.path], {cwd: this.app.vault.adapter['basePath']}); // , '--export-png-height=500'
		prc.stdout.setEncoding('utf8');
		prc.stdout.on('data', function (data) {
			let str = data.toString()
			let lines = str.split(/(\r?\n)/g);
			console.log(lines.join(""));
		});

		return new Promise((resolve, reject) => {
			prc.on('close', async (code) => {
				console.log('process exit code ' + code);

				if (code !== 0)
					reject(code);

				let result = this.app.vault.getAbstractFileByPath(targetPath)
				resolve(result);
			});
		});
	}

	createThumbnail(el: HTMLElement, file: TFile) {
		let thumbnailUrl = this.app.vault.getResourcePath(file);

		const container = el.createEl('a', {
			href: `app://obsidian.md/${file.path}`,
			target: '_blank',
			rel: "noopener"
		});
		container.addClass('thumbnail');
		container.createEl('img', {attr: {'src': thumbnailUrl}}).addClass('thumbnail-img');
		const textBox = container.createDiv();
		textBox.addClass('thumbnail-text');
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
