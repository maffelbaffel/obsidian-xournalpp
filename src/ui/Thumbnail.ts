import {setIcon, TFile} from "obsidian";

export class Thumbnail {
	private readonly thumbnailUrl = this.thumbnailFile.vault.getResourcePath(this.thumbnailFile);

	constructor(
		private readonly el: HTMLElement,
		private readonly thumbnailFile: TFile,
		private readonly sourceFile: TFile
	) {
	}

	display(refresh: () => void) {
		const xournalppThumbnail = 'xournalpp-thumbnail';
		this.el.find('.' + xournalppThumbnail)?.remove()
		this.el.createDiv(xournalppThumbnail, div => {
			div.createEl('img', {attr: {'src': this.thumbnailUrl}}, img => {
				img.addClass('thumbnail-img');
			})
			div.createDiv('caption', div => {
				div.createEl('a', {
					href: this.sourceFile.path
				}, a => {
					a.text = this.sourceFile.path;
					a.rel = 'noopener';
					a.target = '_blank';
					a.addClass('internal-link');
				});
				div.createEl('i', {}, i => {
					i.addClass("refresh-icon")
					setIcon(i, "refresh-ccw")
					i.onClickEvent(async _ => refresh());
				});
			});
		})
	}
}
