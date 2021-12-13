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

const GCode = [ 0x42, 0x34, 0x36, 0x45 ];
let ROMDataView = null, ROMArray = null, ROMSize = 0, ROMName = "";


export function LoadROM(ROMFile, SuccessClb, ErrorClb) {
	if (!ROMFile) {
		ErrorClb(-1); // No ROM File provided.
		return;
	}

	ROMName = ROMFile.name;
	ROMSize = ROMFile.size;
	ROMDataView = null;
	ROMArray = null;

	if (ROMSize != 0x2000000) {
		ErrorClb(-2); // ROM Size is not correct.
		return;
	}

	let Reader = new FileReader();
	Reader.readAsArrayBuffer(ROMFile);
	
	Reader.onload = function() {
		ROMArray = new Uint8Array(this.result);
		ROMDataView = new DataView(ROMArray.buffer);

		if (ROMDataView.getUint8(0xB2) != 0x96) {
			ErrorClb(-3); // GBA ROM magic does not match.
			return;
		}

		/* Check for the Gamecode at 0xAC. */
		for (let Idx = 0; Idx < 4; Idx++) {
			if (ROMDataView.getUint8(0xAC + Idx) != GCode[Idx]) {
				ErrorClb(-4); // Gamecode does not match.
				return;
			}
		}

		SuccessClb(); // We are good to go.
	}
};


/*
	Read data from the ROM.

	Type: The type to read, such as "uint8_t" or "u8" for a byte, "uint16_t" or "u16" for a unsigned short etc.
	Offs: The offset of the ROM to read.
*/
export function ReadROMData(Type, Offs) {
	if (ROMDataView == null) return 0x0;

	switch(Type) {
		case "u8":
		case "uint8_t":
			if (Offs < ROMSize) return ROMDataView.getUint8(Offs);
			break;

		case "u16":
		case "uint16_t":
			if (Offs < ROMSize - 1) return ROMDataView.getUint16(Offs, true);
			break;

		case "u32":
		case "uint32_t":
			if (Offs < ROMSize - 3) return ROMDataView.getUint32(Offs, true);
			break;
	}

	return 0x0;
};