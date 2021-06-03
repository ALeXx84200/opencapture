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
from flask_babel import gettext

from ..import_controllers import pdf
from ..models import accounts


def retrieve_suppliers(args):
    _vars = pdf.init()
    _config = _vars[1]

    suppliers = accounts.retrieve_suppliers(args)
    response = {
        "suppliers": suppliers
    }
    return response, 200


def get_supplier_by_id(supplier_id):
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})

    if error is None:
        return supplier_info, 200
    else:
        response = {
            "errors": gettext('GET_SUPPLIER_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def get_address_by_id(address_id):
    address_info, error = accounts.get_address_by_id({'address_id': address_id})

    if error is None:
        return address_info, 200
    else:
        response = {
            "errors": gettext('GET_ADDRESS_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def update_supplier(supplier_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})

    if error is None:
        _set = {
            'name': data['name'],
            'siret': data['siret'],
            'siren': data['siren'],
            'vat_number': data['vat_number'],
            'typology': data['typology'],
            'form_id': data['form_id']
        }

        res, error = accounts.update_supplier({'set': _set, 'supplier_id': supplier_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_SUPPLIER_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_SUPPLIER_ERROR'),
            "message": error
        }
        return response, 401


def update_address(address_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    address_info, error = accounts.get_address_by_id({'address_id': address_id})

    if error is None:
        _set = {
            'address1': data['address1'],
            'address2': data['address2'],
            'postal_code': data['postal_code'],
            'city': data['city'],
            'country': data['country']
        }

        res, error = accounts.update_address({'set': _set, 'address_id': address_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ADDRESS_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_ADDRESS_ERROR'),
            "message": error
        }
        return response, 401


def create_address(data):
    _vars = pdf.init()
    _db = _vars[0]

    _columns = {
        'address1': data['address1'],
        'address2': data['address2'],
        'postal_code': data['postal_code'],
        'city': data['city'],
        'country': data['country']
    }

    res, error = accounts.create_address({'columns': _columns})

    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_ADDRESS_ERROR'),
            "message": error
        }
        return response, 401


def create_supplier(data):
    _vars = pdf.init()
    _db = _vars[0]

    _columns = {
        'name': data['name'],
        'siret': data['siret'],
        'siren': data['siren'],
        'vat_number': data['vat_number'],
        'typology': data['typology'],
        'form_id': data['form_id'],
        'address_id': data['address_id']
    }

    res, error = accounts.create_supplier({'columns': _columns})

    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_SUPPLIER_ERROR'),
            "message": error
        }
        return response, 401


def delete_supplier(supplier_id):
    _vars = pdf.init()
    _db = _vars[0]
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})

    if error is None:
        _set = {
            'status': 'DEL',
        }
        res, error = accounts.delete_supplier({'set': _set, 'supplier_id': supplier_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_SUPPLIER_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_SUPPLIER_ERROR'),
            "message": error
        }
        return response, 401