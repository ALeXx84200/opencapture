# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import re
from ..functions import search_by_positions, search_custom_positions


class FindInvoiceNumber:
    def __init__(self, ocr, files, log, locale, config, database, supplier, file, typo, text, nb_pages, custom_page, footer_text):
        self.vatNumber = ''
        self.Ocr = ocr
        self.text = text
        self.footer_text = footer_text
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

    def run(self):
        if self.Files.isTiff == 'True':
            target = self.Files.tiffName_header
        else:
            target = self.Files.jpgName_header
        invoice_number = search_by_positions(self.supplier, 'invoice', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        if invoice_number and invoice_number[0]:
            return invoice_number

        if self.supplier and not self.customPage:
            position = self.Database.select({
                'select': ['invoice_number_position', 'invoice_number_page'],
                'table': ['suppliers'],
                'where': ['vat_number = ?'],
                'data': [self.supplier[0]]
            })[0]

            if position and position['invoice_number_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['invoice_number_position'], 'regex': None, 'target': 'full', 'page': position['invoice_number_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)

                if text != '':
                    self.Log.info('Invoice number found with position : ' + str(text))
                    return [text, position, data['page']]

        for line in self.text:
            for _invoice in re.finditer(r"" + self.Locale.invoiceRegex + "", line.content.upper()):
                invoice_res = _invoice.group()
                # If the regex return a date, remove it
                for _date in re.finditer(r"" + self.Locale.dateRegex + "", _invoice.group()):
                    if _date.group():
                        invoice_res = _invoice.group().replace(_date.group(), '')

                # Delete the invoice keyword
                tmp_invoice_number = re.sub(r"" + self.Locale.invoiceRegex[:-2] + "", '', invoice_res)
                invoice_number = tmp_invoice_number.lstrip().split(' ')[0]

                if len(invoice_number) >= int(self.Locale.invoiceSizeMin):
                    self.Log.info('Invoice number found : ' + invoice_number)
                    return [invoice_number, line.position, self.nbPages]

        for line in self.footer_text:
            for _invoice in re.finditer(r"" + self.Locale.invoiceRegex + "", line.content.upper()):
                invoice_res = _invoice.group()
                # If the regex return a date, remove it
                for _date in re.finditer(r"" + self.Locale.dateRegex + "", _invoice.group()):
                    if _date.group():
                        invoice_res = _invoice.group().replace(_date.group(), '')

                # Delete the invoice keyword
                tmp_invoice_number = re.sub(r"" + self.Locale.invoiceRegex[:-2] + "", '', invoice_res)
                invoice_number = tmp_invoice_number.lstrip().split(' ')[0]

                if len(invoice_number) >= int(self.Locale.invoiceSizeMin):
                    self.Log.info('Invoice number found : ' + invoice_number)
                    position = self.Files.return_position_with_ratio(line, 'footer')
                    return [invoice_number, position, self.nbPages]