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

from flask import Blueprint, request, make_response, jsonify
from ..controllers.auth import token_required
from ..import_controllers import accounts

bp = Blueprint('accounts', __name__, url_prefix='/ws/')


@bp.route('accounts/suppliers/list', methods=['GET'])
@token_required
def suppliers_list():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status <> %s'],
        'data': ['DEL'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }
    res = accounts.retrieve_suppliers(args)
    return make_response(res[0], res[1])


@bp.route('accounts/suppliers/getById/<int:supplier_id>', methods=['GET'])
@token_required
def get_supplier_by_id(supplier_id):
    _user = accounts.get_supplier_by_id(supplier_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('accounts/suppliers/getAdressById/<int:address_id>', methods=['GET'])
@token_required
def get_adress_by_id(address_id):
    _user = accounts.get_address_by_id(address_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('accounts/suppliers/update/<int:supplier_id>', methods=['PUT'])
@token_required
def update_supplier(supplier_id):
    data = request.json['args']
    res = accounts.update_supplier(supplier_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/addresses/update/<int:supplier_id>', methods=['PUT'])
@token_required
def update_address(supplier_id):
    data = request.json['args']
    res = accounts.update_address(supplier_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/addresses/create', methods=['POST'])
@token_required
def create_address():
    data = request.json['args']
    res = accounts.create_address(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/create', methods=['POST'])
@token_required
def create_supplier():
    data = request.json['args']
    res = accounts.create_supplier(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/delete/<int:supplier_id>', methods=['DELETE'])
@token_required
def delete_supplier(supplier_id):
    res = accounts.delete_supplier(supplier_id)
    return make_response(jsonify(res[0])), res[1]
