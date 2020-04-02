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
import cv2
import time
import uuid
import shutil
import PyPDF4
import datetime
from PIL import Image
from xml.dom import minidom
from wand.color import Color
import xml.etree.ElementTree as ET
from wand.image import Image as Img

class Files:
    def __init__(self, jpgName, res, quality, Xml):
        self.jpgName                = jpgName + '.jpg'
        self.jpgName_header         = jpgName + '_header.jpg'
        self.jpgName_footer         = jpgName + '_footer.jpg'
        self.resolution             = res
        self.compressionQuality     = quality
        self.img                    = None
        self.heightRatio            = ''
        self.Xml                    = Xml

    # Convert the first page of PDF to JPG and open the image
    def pdf_to_jpg(self, pdfName, openImg=True, crop=False, zoneToCrop=False):
        if crop:
            if zoneToCrop == 'header':
                self.crop_image_header(pdfName)
                if openImg:
                    self.img = Image.open(self.jpgName_header)
            elif zoneToCrop == 'footer':
                self.crop_image_footer(pdfName)
                if openImg:
                    self.img = Image.open(self.jpgName_footer)
        else:
            self.save_img_with_wand(pdfName, self.jpgName)
            if openImg:
                self.img = Image.open(self.jpgName)

    # Simply open an image
    def open_img(self, img):
        self.img = Image.open(img)

    @staticmethod
    def open_image_return(img):
        return Image.open(img)

    # Save pdf with one or more pages into JPG file
    def save_img_with_wand(self, pdfName, output):
        with Img(filename=pdfName, resolution=self.resolution) as pic:
            pic.compression_quality = self.compressionQuality
            pic.background_color    = Color("white")
            pic.alpha_channel       = 'remove'
            pic.save(filename=output)

    @staticmethod
    def sorted_file(path, extension):
        file_json = []
        for file in os.listdir(path):
            if file.endswith("." + extension):
                filename    = os.path.splitext(file)[0]
                isCountable = filename.split('-')
                if len(isCountable) > 1 :
                    cpt = ('%03d' % int(isCountable[1]))
                    file_json.append((cpt, path + file))
                else:
                    file_json.append(('000', path + file))
        sorted_file = sorted(file_json, key=lambda fileCPT: fileCPT[0])
        return sorted_file

    @staticmethod
    def merge_pdf(fileSorted, tmpPath):
        merger = PyPDF4.PdfFileMerger()
        for pdf in fileSorted:
            merger.append(pdf[1])
            os.remove(pdf[1])
        merger.write(tmpPath + '/result.pdf')
        fileToReturn = open(tmpPath + '/result.pdf', 'rb').read()
        os.remove(tmpPath + '/result.pdf')

        return fileToReturn

    @staticmethod
    def check_file_integrity(file, Config):
        isFull = False
        while not isFull:
            with open(file, 'rb') as doc:
                size = os.path.getsize(file)
                time.sleep(1)
                size2 = os.path.getsize(file)
                if size2 == size:
                    if file.endswith(".pdf"):
                        try:
                            PyPDF4.PdfFileReader(doc)
                        except PyPDF4.utils.PdfReadError:
                            shutil.move(file, Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                            return False
                        else:
                            return True
                    elif file.endswith('.jpg'):
                        try:
                            Image.open(file)
                        except OSError:
                            return False
                        else:
                            return True
                    else:
                        return False
                else:
                    continue

    @staticmethod
    def pdf_to_thumb(pdfName, outputName, resolution, compressionQuality):
        with Img(filename=pdfName, resolution=resolution) as pic:
            pic.compression_quality = compressionQuality
            pic.background_color = Color("white")
            pic.alpha_channel = 'remove'
            pic.save(filename=outputName)

    @staticmethod
    def ocr_on_fly(img, selection, Ocr, thumbSize = None,):
        with Image.open(img) as im:
            im.save('/tmp/no_cropped.jpg', 'JPEG')

        if thumbSize is not None:
            ratio       = im.size[0]/thumbSize['width']
        else:
            ratio       = 1
        x1          = selection['x1'] * ratio
        y1          = selection['y1'] * ratio
        x2          = selection['x2'] * ratio
        y2          = selection['y2'] * ratio

        cropRatio   = (x1, y1, x2, y2)

        with Image.open(img) as im2:
            croppedImage = im2.crop(cropRatio)
            croppedImage.save('/tmp/cropped.jpg', 'JPEG')

        text = Ocr.text_builder(croppedImage)

        os.remove('/tmp/cropped.jpg')
        os.remove('/tmp/no_cropped.jpg')
        return text

    @staticmethod
    def get_size(img):
        im = Image.open(img)

        return im.size[0]

    # Crop the file to get the header
    # 1/3 + 10% is the ratio we used
    def crop_image_header(self, img):
        with Img(filename=img, resolution=300) as pic:
            pic.compression_quality = 100
            pic.background_color    = Color("white")
            pic.alpha_channel       = 'remove'
            self.heightRatio        = int(pic.height / 3 + pic.height * 0.1)
            pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='north')
            pic.save(filename=self.jpgName_header)

    # Crop the file to get the footer
    # 1/3 + 10% is the ratio we used
    def crop_image_footer(self, img):
        with Img(filename=img, resolution=300) as pic:
            pic.compression_quality = 100
            pic.background_color    = Color("white")
            pic.alpha_channel       = 'remove'
            self.heightRatio        = int(pic.height / 3 + pic.height * 0.1)
            pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='south')
            pic.save(filename=self.jpgName_footer)

    @staticmethod
    def improve_image_detection(img):
        src     = cv2.imread(img, cv2.IMREAD_GRAYSCALE)
        dst     = cv2.adaptiveThreshold(src, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,11, 2)
        cv2.imwrite(img, dst)

    @staticmethod
    def move_to_docservers(cfg, file):
        now             = datetime.datetime.now()
        year            = str(now.year)
        day             = str('%02d' % now.day)
        month           = str('%02d' % now.month)
        hour            = str('%02d' % now.hour)
        minute          = str('%02d' % now.minute)
        seconds         = str('%02d' % now.second)
        docserverPath   = cfg['GLOBAL']['docserverpath']

        # Check if docserver folder exists, if not, create it
        if not os.path.exists(docserverPath):
            os.mkdir(docserverPath)

        # Check if year folder exist, if not, create it
        if not os.path.exists(docserverPath + '/' + year):
            os.mkdir(docserverPath + '/' + year)

        # Do the same with month
        if not os.path.exists(docserverPath + '/' + year + '/' + month):
            os.mkdir(docserverPath + '/' + year + '/' + month)

        newFilename    = day + month + year + '_' + hour + minute + seconds + '_' + uuid.uuid4().hex + '.pdf'
        finalDirectory = docserverPath + '/' + year + '/' + month + '/' + newFilename

        shutil.move(file, finalDirectory)

        return finalDirectory

    # When we crop footer we need to rearrange the position of founded text
    # So we add the heightRatio we used (by default 1/3 + 10% of the full image)
    # And also add the position found on the cropped section divided by 2.8
    def returnPositionWithRatio(self, line, target):
        position       = {0: {}, 1: {}}
        position[0][0] = line.position[0][0]
        position[1][0] = line.position[1][0]

        if target == 'footer':
            # TODO
            # Améliorer calcul de position lors d'un crop footer (De temps en temps le résultat n'est pas correct (trop haut généralement))
            position[0][1] = line.position[0][1] + self.heightRatio
            position[1][1] = line.position[1][1] + self.heightRatio
        else:
            position[0][1] = line.position[0][1]
            position[1][1] = line.position[1][1]

        return position

    def exportXml(self, cfg, invoiceNumber, parent, fillPosition = False, db = None, vatNumber = False):
        self.Xml.construct_filename(invoiceNumber)
        filename    = cfg.cfg['GLOBAL']['exportaccountingfolder'] + '/' + self.Xml.filename
        root        = ET.Element("ROOT")

        for parentElement in parent:
            element = ET.SubElement(root, parentElement)
            for child in parent[parentElement]:
                for childElement in child:
                    cleanChild = childElement.replace(parentElement + '_', '')
                    if cleanChild not in ['noDelivery', 'noCommands']:
                        if fillPosition is not False and db is not False:
                            cleanChildPosition = child[childElement]['position']
                            # Add position in supplier database
                            if cleanChildPosition is not None:
                                db.update({
                                    'table': ['suppliers'],
                                    'set': {
                                        cleanChild + '_position': cleanChildPosition
                                    },
                                    'where': ['vatNumber = ?'],
                                    'data': [vatNumber]
                                })
                                db.conn.commit()
                        # Then create the XML
                        newField = ET.SubElement(element, cleanChild)
                        newField.text = child[childElement]['field']

        xmlRoot = minidom.parseString(ET.tostring(root, encoding="unicode")).toprettyxml()
        filename = open(filename, 'w')
        filename.write(xmlRoot)

    # OBR01
    @staticmethod
    def create_directory(path):
        try:
            os.mkdir(path)
        except OSError:
            print("Creation of the directory %s failed" % path)
    # END OBR01