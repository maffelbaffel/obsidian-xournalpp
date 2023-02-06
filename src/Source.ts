import {parseYaml} from "obsidian";
import {XournalppPluginSettings} from "./XournalppPluginSettings";
import {Err, Ok, Result} from "ts-results";

export class Source {
	/**
	 * @param file Source xopp file
	 * @param width Width of the exported PNG in px
	 * @param height Height of the exported PNG in px. Ignored if width is given
	 * @param pages Range of pages to export (e.g. "2-3, 5, 7-")
	 */
	private constructor(
		readonly file: string,
		readonly height: number,
		readonly width: number,
		readonly pages: string) {
	}

	static parseInput(source: string, settings: XournalppPluginSettings): Result<Source, string> {
		const sourceLines = source.trim().split('\n');

		const url = sourceLines.shift()?.trim();
		if (url === null) return new Err("Empty input");

		const yaml = parseYaml(sourceLines.join('\n'))

		return new Ok(new Source(
			url as string,
			yaml?.height ?? settings.defaultHeight,
			yaml?.width ?? settings.defaultWidth,
			yaml?.pages ?? 1
		))
	}
}
