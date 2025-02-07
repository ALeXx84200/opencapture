/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Injectable } from '@angular/core';
import { UserService } from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class PrivilegesService {

    constructor(
        private userService: UserService
    ) { }

    hasPrivilege(privilegeId: any) {
        let found = false;
        const user = this.userService.getUserFromLocal();
        if (user) {
            const userPrivileges = user['privileges'];
            if (userPrivileges) {
                if (privilegeId === undefined) {
                    return true;
                }
                if (userPrivileges === '*')
                    return true;

                userPrivileges.forEach((element: any) => {
                    if (privilegeId === element) {
                        found = true;
                    }
                });
                return found;
            }
        }
        return false;
    }
}
