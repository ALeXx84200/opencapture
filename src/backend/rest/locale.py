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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import json
from src.backend.import_controllers import auth, config
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from flask import Blueprint, make_response, jsonify, session, request

bp = Blueprint('i18n', __name__, url_prefix='/ws/')


@bp.route('i18n/changeLanguage/<string:lang>', methods=['GET'])
@auth.token_required
def change_language(lang):
    session['lang'] = lang
    response = config.change_locale_in_config(lang)
    return jsonify(response, response[1])


@bp.route('i18n/getAllLang', methods=['GET'])
def get_all_lang():
    if 'languages' in session:
        languages = json.loads(session['languages'])
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        languages = _vars[11]

    langs = []
    for lang in languages:
        langs.append([languages[lang]['lang_code'], languages[lang]['label']])
    return make_response({'langs': langs}, 200)


@bp.route('i18n/getCurrentLang', methods=['GET'])
def get_current_lang():
    if 'configurations' in session and 'languages' in session:
        configurations = json.loads(session['configurations'])
        languages = json.loads(session['languages'])
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]
        languages = _vars[11]

    current_lang = configurations['locale']
    angular_moment_lang = ''
    babel_lang = ''
    for _l in languages:
        if current_lang == languages[_l]['lang_code']:
            babel_lang = _l
            angular_moment_lang = languages[_l]['moment_lang_code']
    return make_response({'lang': current_lang, 'moment_lang': angular_moment_lang, 'babel_lang': babel_lang}, 200)
