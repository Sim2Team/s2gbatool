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

import { LoadROM } from "./romdata.js";


/* Error callback of the ROM Loader. */
export function ErrorCallback(Error) {
	switch(Error) {
		case -4:
			alert("The Gamecode at 0xAC does not match. Byte 0xAC - 0xAF must be: 0x42, 0x34, 0x36, 0x45.");
			break;

		case -3:
			alert("The GBA Magic does not match. Byte 0xB2 is not 0x96.");
			break;

		case -2:
			alert("The ROM Size is not correct. It must be 32 MB / 0x2000000.");
			break;

		case -1:
			alert("No ROM File provided.");
			break;
	}

	document.getElementById("menus").classList.add("hide"); // Hide on error.
};


/* Success callback of the ROM Loader. */
function SuccessCallback() {
	document.getElementById("menus").classList.remove("hide"); // On success, show the "menus".
};


document.getElementById("rom-manager-load-rom").onchange = (Event) => LoadROM(Event.target.files[0], SuccessCallback, ErrorCallback);