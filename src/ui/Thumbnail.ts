import {TFile} from "obsidian";

export class Thumbnail {
	private el: HTMLElement;
	private file: TFile;
	private thumbnailUrl: string;

	constructor(el: HTMLElement, file: TFile, thumbnailUrl: string) {
		this.el = el;
		this.file = file;
		this.thumbnailUrl = thumbnailUrl;
	}

	display() {
		this.el.createEl('a', {
			href: `app://obsidian.md/${this.file.path}`
		}, a => {
			a.addClass('thumbnail')
			a.createEl('img', {attr: {'src': this.thumbnailUrl}}, img => {
				img.addClass('thumbnail-img');
			})
			a.createDiv(undefined, div => {
				div.addClass('thumbnail-text');
			});
		});

	}
}
