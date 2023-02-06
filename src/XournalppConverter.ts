import {App, TFile} from "obsidian";
import {Source} from "./Source";
import {spawn} from "child_process";
import {IGNORE_HEIGHT, IGNORE_WIDTH} from "./main";
import * as path from "path";

export class XournalppConverter {
	constructor(private readonly app: App) {
	}

	async generatePNG(file: TFile, source: Source): Promise<TFile> {
		let targetPath = path.format({...path.parse(file.path), base: '', ext: '.png'})
		let target = this.app.vault.getAbstractFileByPath(targetPath) as TFile
		console.debug(`Exporting ${file.path} to ${targetPath}`);

		let args = ['-i', targetPath, file.path, `--export-range=${source.pages}`];
		if (source.height !== IGNORE_HEIGHT)
			args.push(`--export-png-height=${source.height}`)
		if (source.width !== IGNORE_WIDTH)
			args.push(`--export-png-width=${source.width}`)

		let prc = spawn('xournalpp', args, {cwd: (<any>this.app.vault.adapter)['basePath']});
		return new Promise((resolve, reject) => {
			prc.on('close', async (code) => {
				if (code !== 0)
					reject(code);
				else
					resolve(target);
			});
			prc.on('error', async (e) => {
				reject(e.message);
			});
		});
	}
}
