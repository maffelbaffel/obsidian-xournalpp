import {TFile} from "obsidian";

export class Thumbnail {
	private readonly thumbnailUrl = this.thumbnailFile.vault.getResourcePath(this.thumbnailFile);
	constructor(
		private readonly el: HTMLElement,
		private readonly thumbnailFile: TFile,
		private readonly sourceFile: TFile
	) {
	}

	display() {
		this.el.createEl('img', {attr: {'src': this.thumbnailUrl}}, img => {
			img.addClass('thumbnail-img');
		})
		this.el.createDiv(undefined, div => {
			div.addClass('thumbnail-text');
		});
		this.el.createEl('a', {
			href: this.sourceFile.path
		}, a => {
			a.text = this.sourceFile.path;
			a.rel = 'noopener';
			a.target = '_blank';
			a.addClass('internal-link');
		});
	}
}
