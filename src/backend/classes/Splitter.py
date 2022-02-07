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
import json
import os
import random
from xml.dom import minidom
import xml.etree.cElementTree as ET
from src.backend.classes.Files import Files


class Splitter:
    def __init__(self, config, database, locale, separator_qr, log):
        self.log = log
        self.db = database
        self.qr_pages = []
        self.config = config
        self.locale = locale
        self.result_batches = []
        self.separator_qr = separator_qr
        self.doc_start = self.config.cfg['SPLITTER']['docstart']
        self.bundle_start = self.config.cfg['SPLITTER']['bundlestart']

    def split(self, pages):
        for index, path in pages:
            qrcode = ""
            is_separator = list(filter(lambda separator: int(separator['num']) + 1 == int(index),
                                       self.separator_qr.pages))
            if is_separator:
                if self.doc_start in is_separator[0]['qr_code']:
                    qrcode = self.doc_start

                elif self.bundle_start in is_separator[0]['qr_code']:
                    qrcode = self.bundle_start
            if qrcode:
                self.log.info("QR code in page " + str(index) + " : " + qrcode)

            # if 'DIC'
            self.qr_pages.append({
                'source_page': index,
                'qrcode': qrcode,
                'path': path,
            })

    def get_result_documents(self, blank_pages):
        documents_count = 1
        self.result_batches.append([])
        is_previous_code_qr = False

        for index, page in enumerate(self.qr_pages):
            if int(index) in blank_pages:
                if self.config.cfg['REMOVE-BLANK-PAGES']['enabled'] == 'True' or is_previous_code_qr:
                    continue

            if page['qrcode'] == self.bundle_start:
                if len(self.result_batches[-1]) != 0:
                    self.result_batches.append([])
                documents_count = 1
                is_previous_code_qr = True

            elif page['qrcode'] == self.doc_start:
                if len(self.result_batches[-1]) != 0:
                    documents_count += 1
                is_previous_code_qr = True

            else:
                self.result_batches[-1].append({
                    'source_page': page['source_page'],
                    'path': page['path'],
                    'document': documents_count
                })
                is_previous_code_qr = False

    def save_documents(self, batch_folder, orig_file, input_id):
        for index, batch in enumerate(self.result_batches):
            batch_name = os.path.basename(os.path.normpath(batch_folder))
            input_settings = self.db.select({
                'select': ['*'],
                'table': ['inputs'],
                'where': ['input_id = %s', 'module = %s'],
                'data': [input_id, 'splitter'],
            })

            args = {
                'table': 'splitter_batches',
                'columns': {
                    'file_name': orig_file.rsplit('/')[-1],
                    'batch_folder': batch_name,
                    'first_page': batch[0]['path'],
                    'page_number': str(max((node['document'] for node in batch))),
                    'form_id': str(input_settings[0]['default_form_id'])
                }
            }

            batch_id = self.db.insert(args)
            for page in batch:
                image = Files.open_image_return(page['path'])
                args = {
                    'table': 'splitter_pages',
                    'columns': {
                        'batch_id': str(batch_id),
                        'image_path': page['path'],
                        'source_page': page['source_page'],
                        'split_document': str(page['document']),
                    }
                }
                self.db.insert(args)
                image.save(page['path'], 'JPEG')
            self.db.conn.commit()

        return {'OK': True}

    @staticmethod
    def get_split_pages(documents):
        pages = []
        for document in documents:
            pages.append([])
            for page in document['pages']:
                pages[-1].append(page['sourcePage'])
        return pages

    @staticmethod
    def get_file_name(document, metadata, parameters, now_date):
        file_name = []

        year = str(now_date.year)
        day = str('%02d' % now_date.day)
        month = str('%02d' % now_date.month)
        hour = str('%02d' % now_date.hour)
        minute = str('%02d' % now_date.minute)
        seconds = str('%02d' % now_date.second)
        _date = year + month + day + hour + minute + seconds
        random_num = str(random.randint(0, 99999)).zfill(5)
        filename_parameters = parameters['filename'].split('#')
        separator = parameters['separator'] if parameters['separator'] else ''
        for filename_parameter in filename_parameters:
            if filename_parameter in metadata:
                file_name.append(metadata[filename_parameter].replace(' ', separator))
            elif filename_parameter == 'doctype' and document:
                file_name.append(document['documentTypeKey'].replace(' ', separator))
            elif filename_parameter == 'date':
                file_name.append(_date.replace(' ', separator))
            elif filename_parameter == 'random':
                file_name.append(random_num.replace(' ', separator))
            else:
                file_name.append(filename_parameter.replace(' ', separator))

        file_name = separator.join(str(x) for x in file_name) + '.' + parameters['extension']
        return file_name

    @staticmethod
    def export_xml(documents, metadata, output_dir, filename, now):
        year = str(now.year)
        month = str(now.month).zfill(2)
        day = str(now.day).zfill(2)
        hour = str(now.hour).zfill(2)
        minute = str(now.minute).zfill(2)
        second = str(now.second).zfill(2)

        root = ET.Element("OPENCAPTURESPLITTER")
        bundle_tag = ET.SubElement(root, "BUNDLE")
        ET.SubElement(bundle_tag, "BUNDLEINDEX").text = "1"
        ET.SubElement(bundle_tag, "FILENAME").text = filename
        ET.SubElement(bundle_tag, "DATE").text = day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second
        ET.SubElement(bundle_tag, "BUNDLE_NUMBER").text = filename.split('.')[0]
        ET.SubElement(bundle_tag, "NBDOC").text = str(len(documents))
        ET.SubElement(bundle_tag, "USER_ID_OC").text = metadata['userName']
        ET.SubElement(bundle_tag, "USER_NAME_OC").text = metadata['userLastName']
        ET.SubElement(bundle_tag, "USER_SURNAME_OC").text = metadata['userFirstName']

        header_tag = ET.SubElement(root, "HEADER")
        for key in metadata:
            ET.SubElement(header_tag, key).text = metadata[key]

        documents_tag = ET.SubElement(root, "Documents")
        for index, document in enumerate(documents):
            document_tag = ET.SubElement(documents_tag, "Document")
            file_tag = ET.SubElement(document_tag, "File")
            ET.SubElement(file_tag, "FILEINDEX").text = str(index + 1)
            ET.SubElement(file_tag, "FILENAME").text = document['fileName']
            ET.SubElement(file_tag, "FORMAT").text = "PDF"

            fields_tag = ET.SubElement(document_tag, "FIELDS")
            ET.SubElement(fields_tag, "DOCTYPE").text = document['documentTypeKey']
            for key in document['metadata']:
                ET.SubElement(fields_tag, key).text = document['metadata'][key]

        xml_str = minidom.parseString(ET.tostring(root)).toprettyxml(indent="    ")

        xml_file_path = output_dir + filename
        try:
            with open(xml_file_path, "w", encoding="utf-8") as f:
                f.write(xml_str)
        except IOError:
            return {'OK': False, 'error': "Unable to create file on disk."}

        return {'OK': True, 'path': xml_file_path}

    @staticmethod
    def get_split_methods():
        with open('bin/scripts/splitter_methods/splitter_methods.json') as methods_json:
            methods = json.load(methods_json)
            return methods['methods']
