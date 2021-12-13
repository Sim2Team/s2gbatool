/*
*   This file is part of S2GBATool
*   Copyright (C) 2021 Sim2Team
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
*       * Requiring preservation of specified reasonable legal notices or
*         author attributions in that material or in the Appropriate Legal
*         Notices displayed by works containing it.
*       * Prohibiting misrepresentation of the origin of that material,
*         or requiring that modified versions of such material be marked in
*         reasonable ways as different from the original version.
*/

import { ReadROMData } from "./romdata.js";


/*
	Language String related Locations.
		
	0: The start location where the language is stored(?) also related to the ShiftingAddress.
	1: Related to the (StringID * 0x4) read value for the ShiftingAddress.
	2: Related to the 0x400 / 0x3FE thing.
*/
const LocTable = [
	[ 0x019B4990, 0x019B4B20, 0x019B4994 ], // English.
	[ 0x019D7784, 0x019D7924, 0x019D7788 ], // Dutch.
	[ 0x019FAF9C, 0x019FB154, 0x019FAFA0 ], // French.
	[ 0x01A1F7E0, 0x01A1F98C, 0x01A1F7E4 ], // German.
	[ 0x01A460A0, 0x01A46254, 0x01A460A4 ], // Italian.
	[ 0x01A697C0, 0x01A69978, 0x01A697C4 ]  // Spanish.
];

/*
	Encoding Table for StringFetcher.

	Starting with 0x20 and ASCII things, then with custom encoding at 0x7B.
*/
const Encoding = [
	/* ASCII related stuff. */
	" ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@",
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
	"[", "\\", "]", "^", "_", "`",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",

	/* Special. */
	"©", "œ", "¡", "¿", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë",
	"Ì", "Í", "Î", "Ï", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "Ø", "Ù", "Ú", "Ü", "ß", "à",
	"á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ñ",
	"ò", "ó", "ô", "õ", "ö", "ø", "ù", "ú", "û", "ü", "º", "ª", "…", "™", "", "®", ""
];


/*
	Decode a byte array to a read-able string.

	ByteArray: The Byte array to decode.
*/
function Decode(ByteArray) {
	if (ByteArray == null) return "";

	let Decoded = "";

	for (let Idx = 0; Idx < ByteArray.length; Idx++) {
		if (ByteArray[Idx] == 0x0) Decoded += "\0"; // NULL Terminator.
		else if (ByteArray[Idx] == 0xA) Decoded += "\n"; // New Line.
		else if (ByteArray[Idx] >= 0x20 && ByteArray[Idx] <= 0xBB) Decoded += Encoding[ByteArray[Idx] - 0x20]; // Encoding.
	}

	return Decoded;
};


/*
	Fetches a String from the ROM.

	LanguageID: The language ID to fetch, see LocTable above for more starting with index 0.
	StringID: The String ID to fetch.
*/
function FetchString(LanguageID, StringID) {
	if (LanguageID >= 0x6 || StringID >= 0xD86) return "";

	/* Declare Variables. */
	let Loc = LocTable[LanguageID];
	let Counter = 0x0;
	let Character = 0x0;
	let ShiftVal = 0x0;
	let ShiftAddr = 0x0;
	let StringArray = [ ];

	/* Init initial Shift Address + Shift Value. */
	ShiftAddr = (Loc[0] + ReadROMData("uint32_t", (StringID * 0x4) + Loc[1]));
	ShiftVal = ReadROMData("uint32_t", ShiftAddr);

	do {
		Character = 0x100;

		do {
			Character = ReadROMData("uint16_t", (Character * 0x4) + Loc[2] - (((ShiftVal >> Counter) % 0x2) == 0 ? 0x400 : 0x3FE));
			Counter++;

			if (Counter == 0x8) {
				Counter = 0x0;
				ShiftAddr++;
				ShiftVal = ReadROMData("uint32_t", ShiftAddr);
			}
		} while(0xFF < Character);

		if (Character != 0x0) StringArray.push(Character);
	} while(Character != 0x0);

	return Decode(StringArray);
};


document.getElementById("string-fetcher-fetch").onclick = function() {
	const ID = document.getElementById("string-fetcher-string-id").value;
	const Lang = document.getElementById("string-fetcher-lang-selector").value;

	if (ID <= 0xD85 && Lang <= 0x5) document.getElementById("string-fetcher-fetched").innerHTML = FetchString(Lang, ID);
};


/* Export / Extract all of the Strings into a JSON. */
document.getElementById("string-fetcher-extract-all").onclick = function() {
	const LangNames = ["english", "dutch", "french", "german", "italian", "spanish"];
	let FinalJSON = { };
	
	for (let LangIdx = 0; LangIdx < 6; LangIdx++) {
		let TempJSON = { };

		for (let StringIdx = 0; StringIdx < 0xD86; StringIdx++) TempJSON[StringIdx.toString(16).toUpperCase()] = FetchString(LangIdx, StringIdx);
		FinalJSON[LangNames[LangIdx]] = TempJSON;
	}

	/* Create <a> element and put the data of the Final JSON inside it and format it to 4 space indentation. */
	const Link = document.createElement('a');
	Link.href = URL.createObjectURL( new Blob([JSON.stringify(FinalJSON, null, 4)], { type: "application/json"}) );
	Link.download = "StringFetcher.json";
	Link.click();
};