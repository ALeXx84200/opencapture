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

import os
import uuid
import shutil
import datetime

import PyPDF4
from .FindDate import FindDate
from .FindFooter import FindFooter
from .FindSupplier import FindSupplier
from .FindInvoiceNumber import FindInvoiceNumber

def insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nbPages, thumbFilename, fullJpgFilename, status):
    res = Database.insert({
        'table': 'invoices',
        'columns': {
            'vatNumber'             : supplier[0] if supplier else '',
            'vatNumber_position'    : str(supplier[1]) if supplier else '',
            'invoiceDate'           : date[0] if date else '',
            'invoiceDate_position'  : str(date[1]) if date else '',
            'invoiceNumber'         : invoiceNumber[0] if invoiceNumber is not False else '',
            'invoiceNumber_position': str(invoiceNumber[1]) if invoiceNumber is not False else '',
            'HTAmount1'             : str(footer[0][0]) if footer is not False else '',
            'HTAmount1_position'    : str(footer[0][1]) if footer is not False else '',
            'VATRate1'              : str(footer[2][0]) if footer is not False else '',
            'VATRate1_position'     : str(footer[2][1]) if footer is not False else '',
            'filename'              : os.path.basename(file),
            'path'                  : os.path.dirname(file),
            'imgWidth'              : str(Files.get_size(Config.cfg['GLOBAL']['fullpath'] + '/' + fullJpgFilename)),
            'thumbPath'             : Config.cfg['GLOBAL']['thumbpath'],
            'thumbFilename'         : thumbFilename,
            'fullJpgPath'           : Config.cfg['GLOBAL']['fullpath'],
            'fullJpgFilename'       : fullJpgFilename,
            'status'                : status,
            'nbPages'               : str(nbPages),
        }
    })

    # Commit database connection
    if res:
        Database.conn.commit()
        Log.info('Invoice inserted in database')
        try:
            os.remove(Files.jpgName_footer)
            os.remove(Files.jpgName_header)
            os.remove(Files.jpgName)
        except FileNotFoundError:
            pass
    else:
        Log.error('Error while inserting')

def process(args, file, Log, Separator, Config, Files, Ocr, Locale, Database, WebServices, q = None,):
    Log.info('Processing file : ' + file)

    # Open the pdf and convert it to JPG
    if os.path.splitext(file)[1] == '.pdf':
        # Check if pdf is already OCR and searchable
        checkOcr = os.popen('pdffonts ' + file, 'r')
        tmp = ''
        for line in checkOcr:
            tmp += line

        if len(tmp.split('\n')) > 3:
            isOcr = True
        else:
            isOcr = False
    else:  # Open the picture
        Files.open_img(file)
        isOcr = False

    # Get the OCR of the file as a list of line content and position
    Files.pdf_to_jpg(file + '[0]', True, True, 'header')
    Ocr.header_text = Ocr.line_box_builder(Files.img)
    Files.pdf_to_jpg(file + '[0]', True, True, 'footer')
    Ocr.footer_text = Ocr.line_box_builder(Files.img)
    Files.pdf_to_jpg(file + '[0]')
    Ocr.text = Ocr.line_box_builder(Files.img)

    # Find supplier in document
    supplier        = FindSupplier(Ocr, Log, Locale, Database, Files, file + '[0]').run()

    # Find invoice number
    invoiceNumber   = FindInvoiceNumber(Ocr, Files, Log, Locale, Database, supplier).run()

    # Find invoice date number
    date            = FindDate(Ocr.text, Log, Locale, Config).run()

    # Find footer informations (total amount, no rate amount etc..)
    footer          = FindFooter(Ocr, Log, Locale, Config, Files, Database, supplier, file+ '[0]').run()

    fileName        = str(uuid.uuid4()) + '.jpg'
    thumbFilename   = 'thumb_' + fileName
    fullJpgFilename = 'full_' + fileName

    Files.pdf_to_thumb(file, Config.cfg['GLOBAL']['thumbpath'] + '/' + thumbFilename, 100, 70)
    Files.pdf_to_thumb(file, Config.cfg['GLOBAL']['fullpath'] + '/' + fullJpgFilename, 300, 100)

    # get the number of pages into the PDF documents
    with open(file, 'rb') as doc:
        pdf = PyPDF4.PdfFileReader(doc)
        try:
            nbPages = pdf.getNumPages()
        except ValueError as e:
            Log.error(e)
            shutil.move(file, Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
            return False

    # If more than one page, upload only the thumb of the first page on the database
    if nbPages > 1:
        tmp             = os.path.splitext(fullJpgFilename)
        tmpThumb        = os.path.splitext(thumbFilename)
        fullJpgFilename = tmp[0] + '-0' + tmp[1]
        thumbFilename   = tmpThumb[0] + '-0' + tmpThumb[1]

    file = Files.move_to_docservers(Config.cfg, file)

    # If all informations are found, do not send it to GED
    if supplier and date and invoiceNumber and footer and Config.cfg['GLOBAL']['allowautomaticvalidation'] == 'True':
        insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nbPages, thumbFilename, fullJpgFilename, 'DEL')
        Log.info('All the usefull informations are found. Export the XML and end process')
        now = datetime.datetime.now()
        parent = {
            'pdfCreationDate'   : [{'pdfCreationDate'   : {'field'  : str(now.year) + '-' + str('%02d' % now.month) + '-'+ str(now.day)}}],
            'fileInfo'          : [{'fileInfoPath'      : {'field'  : os.path.dirname(file) + '/' + os.path.basename(file)}}],
            'supplierInfo'      : [{
                'supplierInfo_name'         : {'field': supplier[2]['name']},
                'supplierInfo_city'         : {'field': supplier[2]['city']},
                'supplierInfo_siretNumber'  : {'field': supplier[2]['SIRET']},
                'supplierInfo_sirenNumber'  : {'field': supplier[2]['SIREN']},
                'supplierInfo_address'      : {'field': supplier[2]['adress1']},
                'supplierInfo_vatNumber'    : {'field': supplier[2]['vatNumber']},
                'supplierInfo_postal_code'  : {'field': str(supplier[2]['postal_code'])},
            }],
            'facturationInfo'   : [{
                'facturationInfo_NumberOfTVA'           : {'field': '1'},
                'facturationInfo_date'                  : {'field': date[0]},
                'facturationInfo_invoiceNumber'         : {'field': invoiceNumber[0]},
                'facturationInfo_noTaxes_1'             : {'field': str("%.2f" % (footer[0][0]))},
                'facturationInfo_VAT_1'                 : {'field': str("%.2f" % (footer[2][0]))},
                'facturationInfo_TOTAL_TVA_1'           : {'field': str("%.2f" % (footer[0][0] * (footer[2][0] / 100)))},
                'facturationInfo_totalHT'               : {'field': str("%.2f" % (footer[0][0]))},
                'facturationInfo_totalTTC'              : {'field': str("%.2f" % (footer[0][0] * (footer[2][0] / 100) + footer[0][0]))},
            }]
        }
        Files.exportXml(Config, invoiceNumber[0], parent)
        if Config.cfg['GED']['enabled'] == 'True':
            defaultProcess  = Config.cfg['GED']['defaultprocess']
            invoiceInfo     = Database.select({
                'select'    : ['*'],
                'table'     : ['invoices'],
                'where'     : ['invoiceNumber = ?'],
                'data'      : [invoiceNumber[0]]
            })

            contact = WebServices.retrieve_contact_by_VATNumber(supplier[2]['vatNumber'])
            if not contact:
                contact = {
                    'isCorporatePerson': 'Y',
                    'function': '',
                    'lastname': '',
                    'firstname': '',
                    'contactType': Config.cfg[defaultProcess]['contacttype'],
                    'contactPurposeId': Config.cfg[defaultProcess]['contactpurposeid'],
                    'society': parent['supplierInfo'][0]['supplierInfo_name']['field'],
                    'addressTown': parent['supplierInfo'][0]['supplierInfo_city']['field'],
                    'societyShort': parent['supplierInfo'][0]['supplierInfo_name']['field'],
                    'addressStreet': parent['supplierInfo'][0]['supplierInfo_address']['field'],
                    'otherData': parent['supplierInfo'][0]['supplierInfo_vatNumber']['field'],
                    'addressZip': parent['supplierInfo'][0]['supplierInfo_postal_code']['field']
                }
                contact['email'] = 'À renseigner ' + parent['supplierInfo'][0]['supplierInfo_name']['field'] + ' - ' + contact['otherData']

                res = WebServices.create_contact(contact)
                if res is not False:
                    contact = {'id': contact['addressId'], 'contact_id': contact['contactId']}

            data = {
                'date'          : date[0],
                'vatNumber'     : supplier[2]['vatNumber'],
                'creationDate'  : invoiceInfo[0]['registerDate'],
                'subject'       : 'Facture N°' + invoiceNumber[0],
                'status'        : Config.cfg[defaultProcess]['status'],
                'destination'   : Config.cfg[defaultProcess]['defaultdestination'],
                'fileContent'   : open(parent['fileInfo'][0]['fileInfoPath']['field'], 'rb').read(),
                Config.cfg[defaultProcess]['customvatnumber']       : supplier[2]['vatNumber'],
                Config.cfg[defaultProcess]['customht']              : parent['facturationInfo'][0]['facturationInfo_totalHT']['field'],
                Config.cfg[defaultProcess]['customttc']             : parent['facturationInfo'][0]['facturationInfo_totalTTC']['field'],
                Config.cfg[defaultProcess]['custominvoicenumber']   : invoiceNumber[0],
                'contact'       : contact,
                'dest_user'     : Config.cfg[defaultProcess]['defaultdestuser']
            }
            res = WebServices.insert_with_args(data, Config)

            if res:
                Log.info("Insert OK : " + res)
                try:
                    os.remove(file)
                except FileNotFoundError as e:
                    Log.error('Unable to delete ' + file + ' : ' + str(e))
                return True
            else:
                shutil.move(file, Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                return False
    else:
        insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nbPages, thumbFilename, fullJpgFilename, 'NEW')

    return True
