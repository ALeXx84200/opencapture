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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from gettext import gettext
from ..import_controllers import db


def get_forms(args):
    _db = db.get_db()
    error = None
    forms = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'order_by': ['id ASC'],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    if not forms:
        error = gettext('NO_FORMS')

    return forms, error


def get_form_by_id(args):
    _db = db.get_db()
    error = None
    form = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models'],
        'where': ['id = %s', 'status <> %s'],
        'data': [args['form_id'], 'DEL']
    })

    if not form:
        error = gettext('GET_FORM_BY_ID_ERROR')
    else:
        form = form[0]

    return form, error


def update_form(args):
    _db = db.get_db()
    error = None

    res = _db.update({
        'table': ['form_models'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['form_id']]
    })

    if not res:
        error = gettext('UPDATE_FORM_ERROR')

    return res, error


def update_form_fields(args):
    _db = db.get_db()
    error = None

    res = _db.update({
        'table': ['form_models_field'],
        'set': args['set'],
        'where': ['form_id = %s'],
        'data': [args['form_id']]
    })

    if not res:
        error = gettext('UPDATE_FORM_FIELDS_ERROR')

    return res, error


def add_form_fields(args):
    _db = db.get_db()
    args = {
        'table': 'form_models_field',
        'columns': {
            'form_id': str(args),
        }
    }
    _db.insert(args)
    return '', False


def add_form(args):
    _db = db.get_db()
    forms_exists, error = get_forms({
        'where': ['label = %s', 'status <> %s'],
        'data': [args['label'], 'DEL']
    })

    if not forms_exists:
        args = {
            'table': 'form_models',
            'columns': {
                'label': args['label'],
                'default': args['"default"'],
            }
        }
        res = _db.insert(args)

        if not res:
            error = gettext('ADD_FORM_ERROR')
        return res, error
    else:
        error = gettext('FORM_LABEL_ALREADY_EXIST')

    return '', error


def get_fields(args):
    _db = db.get_db()
    error = None
    form_fields = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models_field'],
        'where': ['form_id = %s'],
        'data': [args['form_id']]
    })

    if form_fields:
        form_fields = form_fields[0]

    return form_fields, error
