# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import re
import json
from ..functions import search_custom_positions, search_by_positions


class FindDeliveryNumber:
    def __init__(self, ocr, files, log, locale, config, database, supplier, file, typo, text, nb_pages, custom_page, target='header'):
        self.vatNumber = ''
        self.Ocr = ocr
        self.text = text
        self.Log = log
        self.Files = files
        self.Locale = locale
        self.Config = config
        self.supplier = supplier
        self.Database = database
        self.typo = typo
        self.file = file
        self.nbPages = nb_pages
        self.customPage = custom_page
        self.target = target

    def run(self):
        if self.supplier:
            delivery_number = search_by_positions(self.supplier, 'delivery_number', self.Ocr, self.Files, self.Database)
            if delivery_number and delivery_number[0]:
                return delivery_number

        if self.supplier and not self.customPage:
            position = self.Database.select({
                'select': [
                    "positions ->> 'delivery_number' as delivery_number_position",
                    "pages ->> 'delivery_number' as delivery_number_page"
                ],
                'table': ['accounts_supplier', 'status <> %s'],
                'where': ['vat_number = %s', 'DEL'],
                'data': [self.supplier[0]]
            })[0]

            if position and position['delivery_number_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['delivery_number_position'], 'regex': None, 'target': 'full', 'page': position['delivery_number_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)

                try:
                    position = json.loads(position)
                except TypeError:
                    pass

                if text is not False:
                    for _delivery in re.finditer(r"" + self.Locale.deliveryNumberRegex + "", str(text.upper())):
                        delivery_res = _delivery.group()
                        # If the regex return a date, remove it
                        for _date in re.finditer(r"" + self.Locale.dateRegex + "", _delivery.group()):
                            if _date.group():
                                delivery_res = _delivery.group().replace(_date.group(), '')

                        # Delete the delivery number keyword
                        tmp_delivery_number = re.sub(r"" + self.Locale.deliveryNumberRegex[:-2] + "", '', delivery_res)
                        delivery_number = tmp_delivery_number.lstrip().split(' ')[0]

                        if delivery_number != '':
                            self.Log.info('Delivery number found with position : ' + str(delivery_number))
                            return [delivery_number, position, data['page']]
                    if text != "":
                        self.Log.info('Delivery number found with position : ' + str(text))
                        return [text, position, data['page']]

        for line in self.text:
            for _delivery in re.finditer(r"" + self.Locale.deliveryNumberRegex + "", line.content.upper()):
                delivery_res = _delivery.group()

                # If the regex return a date, remove it
                for _date in re.finditer(r"" + self.Locale.dateRegex + "", _delivery.group()):
                    if _date.group():
                        delivery_res = _delivery.group().replace(_date.group(), '')

                # Delete the delivery number keyword
                tmp_delivery_number = re.sub(r"" + self.Locale.deliveryNumberRegex[:-2] + "", '', delivery_res)
                delivery_number = tmp_delivery_number.lstrip().split(' ')[0]

                if len(delivery_number) >= int(self.Locale.invoiceSizeMin):
                    self.Log.info('Delivery number found : ' + delivery_number)
                    position = line.position
                    if self.target != 'header':
                        position = self.Files.return_position_with_ratio(line, self.target)
                    return [delivery_number, position, self.nbPages]
        return False

