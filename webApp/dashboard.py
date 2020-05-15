import configparser
import json
from os import listdir, path

from flask import current_app, Blueprint, render_template

from bin.src.classes.Config import Config as cfg
from bin.src.classes.Database import Database
from bin.src.classes.Locale import Locale as lc
from bin.src.classes.Log import Log as lg
from webApp.auth import admin_login_required
from webApp.db import get_db

bp = Blueprint('dashboard', __name__)


def init():
    configName  = cfg(current_app.config['CONFIG_FILE'])
    Config      = cfg(current_app.config['CONFIG_FOLDER'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    Log         = lg(Config.cfg['GLOBAL']['logfile'])
    db          = Database(Log, None, get_db())
    Locale      = lc(Config)
    configFile  = current_app.config['CONFIG_FOLDER'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini'

    return db, Config, Locale, configName, configFile


@bp.route('/dashboard')
@admin_login_required
def index():
    _vars           = init()
    _db             = _vars[0]
    _cfg            = _vars[1].cfg
    _cfgName        = _vars[3].cfg['PROFILE']['id']
    regex           = _vars[2].get()
    availableCfg    = list_available_profile()

    tmpList         = _cfg['GED']['availableprocess'].split(',')
    listOfGEDProcess= []

    # Remove space into process name
    for process in tmpList:
        process = process.replace(' ', '')
        listOfGEDProcess.append(process)

    return render_template('dashboard/index.html', configDashboard=_cfg, configName=_cfgName, configList=availableCfg, regex=regex, processes=listOfGEDProcess)


def list_available_profile():
    names = []
    for file in listdir(current_app.config['CONFIG_FOLDER']):
        if not file.endswith('.default') and file.startswith('config_'):
            fileName    = path.splitext(file)[0]
            cfgName     = fileName.split('_')[1]
            names.append(cfgName)

    return names


def modify_profile(profile):
    parser = configparser.ConfigParser()
    parser.read(current_app.config['CONFIG_FILE'])
    parser.set('PROFILE', 'id', profile)

    try:
        with open(current_app.config['CONFIG_FILE'], 'w') as configfile:
            parser.write(configfile)
        return True
    except configparser.Error:
        return False


def modify_config(data):
    _vars       = init()
    configFile  = _vars[4]
    localepath  = _vars[2].date_path
    locale      = _vars[2].locale
    json_tmp    = {}

    parser = configparser.ConfigParser()
    parser.read(configFile)

    separatorQREnabled      = data.get('SEPARATORQR_enabled')
    separatorQRExportPdfa   = data.get('SEPARATORQR_exportpdfa')
    allowDuplicate          = data.get('GLOBAL_allowduplicate')
    allowAutomaticValidation= data.get('GLOBAL_allowautomaticvalidation')
    convertPdfToTiff         = data.get('GLOBAL_convertpdftotiff')
    gedEnabled              = data.get('GED_enabled')

    if separatorQREnabled is not None:
        parser.set('SEPARATORQR', 'enabled', 'True')
    else:
        parser.set('SEPARATORQR', 'enabled', 'False')

    if separatorQRExportPdfa is not None:
        parser.set('SEPARATORQR', 'exportpdfa', 'True')
    else:
        parser.set('SEPARATORQR', 'exportpdfa', 'False')

    if allowDuplicate is not None:
        parser.set('GLOBAL', 'allowduplicate', 'True')
    else:
        parser.set('GLOBAL', 'allowduplicate', 'False')

    if allowAutomaticValidation is not None:
        parser.set('GLOBAL', 'allowautomaticvalidation', 'True')
    else:
        parser.set('GLOBAL', 'allowautomaticvalidation', 'False')

    if convertPdfToTiff is not None:
        parser.set('GLOBAL', 'convertpdftotiff', 'True')
    else:
        parser.set('GLOBAL', 'convertpdftotiff', 'False')

    if gedEnabled is not None:
        parser.set('GED', 'enabled', 'True')
    else:
        parser.set('GED', 'enabled', 'False')

    for info in data:
        splittedInfo    = info.split('_')
        section         = splittedInfo[0]
        field           = splittedInfo[1]

        # Don't process REGEX param here, because it's another file except for urlpattern
        if 'REGEX' not in section or 'REGEX' in section and 'urlpattern' in field:
            if field not in ['exportpdfa', 'enabled', 'allowduplicate', 'allowautomaticvalidation', 'convertpdftotiff']:
                parser.set(section, field, data[info])
        else:
            with open(localepath + locale + '.json', 'r') as file:
                json_data               = json.load(file)
                json_tmp['dateConvert'] = json_data['dateConvert']
                for item in json_data:
                    if item == field:
                        json_tmp[item] = data[info]

    try:
        with open(localepath + locale + '.json', 'w') as file:
            json.dump(json_tmp, file, indent=4, ensure_ascii=False)

        with open(configFile, 'w') as cfgfile:
            parser.write(cfgfile)
        return True
    except configparser.Error:
        return False

def change_locale_in_config(lang):
    _vars       = init()
    configFile  = _vars[4]
    language    = current_app.config['LANGUAGES'][lang]
    parser      = configparser.ConfigParser()

    parser.read(configFile)
    parser.set('LOCALE', 'locale', language[1])
    parser.set('LOCALE', 'localeocr', language[2])
    try:
        with open(configFile, 'w') as configfile:
            parser.write(configfile)
        return True
    except configparser.Error:
        return False