![Logo Open-Capture](https://edissyum.com/wp-content/uploads/2019/08/OpenCaptureForInvoices.png)

# Open-Capture for Invoices by Edissyum
 
Version 2.0.0

Open-Capture is a **free and Open Source** software under **GNU General Public License v3.0**.
  
The functionnalities of Open-Capture for Invoices are :
   - Fully web interface for videocoding : No installation needed on user's workstation
   - OCR On Fly. Draw a rectangle on the image, get the text directly in your input
   - The core works on Linux (tested on Ubuntu and Debian) and might be working on Windows (not tested yet)
   - Complex machine learning algorithms used to predict informations locations from one invoice to another
   - Find suppliers into an invoices using VAT Number, SIRET or SIREN
   - Find VAT Rate, no taxes amount and total taxes amount using powerful algorithm.
   - Wrote fully in Python for the backend, using Flask micro framework. JS/jQuery/JINJA2/CSS for the front
   - Already set to use **fr_FR** or **en_EN** locales. Other locales could be added easily using simple json file
   - Multiple ADR (LAD) profile, using INI file
   - SIRET/SIREN & Adress verification (Only FR for now, could be disabled in settings)
   - Complex locale REGEX used. Easy to improve and modify
   - You have the choice to convert PDF to TIFF or JPG.
   - POSTGRESQL database support
  
# Installation
## Linux Distributions

We recommend using latest stable debian version

## Install Open-Capture for Invoices

Please, do not run the following command as root and create a specific user for Open-Capture For Invoices.

    sudo mkdir -p /var/www/html/opencaptureforinvoices/ && sudo chmod -R 775 /var/www/html/opencaptureforinvoices/ && sudo chown -R $(whoami):$(whoami) /var/www/html/opencaptureforinvoices/
    sudo apt install git
    latest_tag=$(git ls-remote --tags --sort="v:refname" https://github.com/edissyum/opencaptureforinvoices.git | tail -n1 |  sed 's/.*\///; s/\^{}//')
    git clone -b $latest_tag https://github.com/edissyum/opencaptureforinvoices/ /var/www/html/opencaptureforinvoices/
    cd /var/www/html/opencaptureforinvoices/

The `./Makefile` command create the service using `www-data` group (apache2 default group) and the current user. 

`Please avoid using root user`

You have the choice between using supervisor or basic systemd
Supervisor is useful if you need to run multiple instance of Open-Capture in parallel but it will be very greedy
Systemd is perfect for one instance

    cd bin/install/
    chmod u+x Makefile
    sudo ./Makefile
      # Go grab a coffee ;)

It will install all the needed dependencies and install Tesseract V4.X.X with french and english locale. If you need more locales, just do :
  
    sudo apt install tesseract-ocr-<langcode>

Here is a list of all available languages code : https://www.macports.org/ports.php?by=name&substr=tesseract-

If you need more informations about the usefull commands for supervisor : http://supervisord.org/running.html#running-supervisorctl

If you plan to upload large invoices from the interface, using the upload form, you had to modify ImageMagick some settings.
Go to following file : `/etc/ImageMagick-6/policy.xml` and increase the value (to `4GiB` for exemple) of the following line : 

      <policy domain="resource" name="disk" value="1GiB"/>

Then restart apache and workers 

    sudo systemctl restart apache2
    sudo systemctl restart OCForInvoices-worker
    sudo systemctl restart OCForInvoices_Split-worker

## API for SIRET/SIREN

In order to user the online verification of SIRET and SIREN you need to create a WS account on the INSEE website : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
You need to retrieve two tokens and put them into the <code>config_DEFAULT.ini</code> file.
You also need to add a subscritpion the the SIRENE V3 applications : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
This is the consumer key and the consumer secret. You could find help on the INSEE website : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/help.jag
    
## Supplier's referencial

If you don't fill the referencial with the supplier informations, you'll have trouble for validation and globally, all the process. This part is **MANDATORY**

Before starting using Open-Capture you need to create a spreadsheet of your suppliers. You could find a demo located here : <code>bin/src/referencial/default_referencial_supplier.ods</code> (works with .ods or .xlsx). 
You just have to fill the supplier name, siret, siren, vat number and address informations. This .ods is bundled with <code>bin/src/referencial/default_referencial_supplier_index.json</code>.
If your supplier referencial had different column name, the .json file is here for that. You just have to replace the right side of the array with the new column name.

Then, just launch :

    python3 /var/www/html/opencaptureforinvoices/loadReferencial.py -c /var/www/html/opencaptureforinvoices/instance/config.ini
    
It will fill the database with the suppliers informations.

## Set up the incron & the cron to start the service

In order to use the Open-Captures inputs automation, you have to add your user into the following file. 
It allow it to use incrontab (used to capture automatically invoices)

    /etc/incron.allow

## Custom development
You can modify a lot of files if needed, without loose everything at every update. For that, you have to modify the <code>custom/custom.ini</code> file to add the id (between the brackets)
of your custom and the path. By default for the path it's <code>custom/YOUR_CUSTOM_ID/</code> and if it's enabled or not. You can put multiple custom. Then you just have to recreate the
tree of files into the <code>custom/YOUR_CUSTOM_ID/</code> folder. Though, be careful with the import that maybe needed to be modified because the path is modified

Your could custom python files, templates files and static files (js, css, imgs, babel locales)

For now (and for somes files like babel's or webApp/*.py files) it is recommended to restart Flask service in order to see the changes :

    systemctl restart OCForInvoices-web.service

## Positioning mask
It is possible to use file filled with positions and some stuff to retrieve some informations hard to find with REGEX only.
In this file you'll find to type of metadata, the default one and the custom one. Normmally you don't have to touch the default one except the <code>position</code>.
For the custom ones, you'll have some settings to fill :
    - regex  : Use regex present in the JSON file (use the index name. exemple : <code>dateRegex</code>) or create a new one into this file (you need to modifiy the Locale file in order to get this working)
    - type   : string, number or date. If number, it could replace some letters by number to avoid error (O will became 0 for exemple)  <code>OCR_ERRORS.xml</code> file. If it's date, it will be formatted
    - column : Column in database, don't forget to add two column (one for name and one for position like 'example' and 'example_position'). Both of the column need to be VARCHAR
    - target : Part of file to search into. It could be <code>header</code>, <code>footer</code> or <code>full</code>

The positioning mask is named only with the typology number : <code>eg : 1.ini</code>. The typology number has to be mentionned in the default_referencial_supplier for each supplier

## WebServices for Maarch 21.03

The list of files needed to be modify is in install/Maarch with the correct structure. Each modifications on files are between the following tags :

    // NCH01
        some code...
    // END NCH01

Just report the modifications onto you Maarch installation

## Connexion to web client

By default, there is only one superadmin account. Login is 'admin' and password is 'admin'. 
You could change it after using the 'My Profile' menu

# Installation Splitter module

Splitter module is a part from OC for invoice project, the purpose is to separate invoices automatically.

It will use a lot of metadata to be able to separate invoices without physical separator : 
    - Invoice number
    - VAT Number of supplier
    - Number of page if available
    
When the separation is done, you could access to a web interface to control the separation and modify it if needed. After separate invoices, Open-Capture for Invocies will process them normally

In the default <code>config_DEFAULT.ini</code> file there is a SPLITTER part : 
    - splitterpath : Path to the specific docserver of separation
    - tmpBatchPath : Path to the currently running batches
    - pdfOutputPath : Path for the separated PDF. Need to be a folder currently watching by Open-Capture For Invoices 
    - pdfOriginPath : Path to keep the original PDF files (without any separation)
    - allowedExtensions : Files extensions allowed, JSON format  
    
## Launch manually

Obviously you could launch the separation by the web using the "Download" page. But you also could launch separation using bash script combined with incron.
Here is an example of incrontab : 

    /path/to/capture/ IN_CLOSE_WRITE,IN_MOVED_TO /var/www/html/opencaptureforinvoices/bin/scripts/launch_SPLITTER.sh $@/$#
    
# LICENSE
Open-Capture for Invoices is released under the GPL v3.