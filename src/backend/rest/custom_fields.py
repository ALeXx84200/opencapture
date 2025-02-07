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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, custom_fields, forms

bp = Blueprint('customFields', __name__, url_prefix='/ws/')


@bp.route('customFields/list', methods=['GET'])
@auth.token_required
def retrieve_fields():
    args = {}
    if 'module' in request.args:
        args['where'] = ['module = %s', 'enabled is %s', 'status <> %s']
        args['data'] = [request.args['module'], True, 'DEL']
    res = custom_fields.retrieve_custom_fields(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/add', methods=['POST'])
@auth.token_required
def add_field():
    data = json.loads(request.data)
    res = custom_fields.add_custom_field(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/update', methods=['POST'])
@auth.token_required
def update_custom_field():
    data = json.loads(request.data)
    res = custom_fields.update(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/delete/<int:custom_field_id>', methods=['DELETE'])
@auth.token_required
def delete_custom_field(custom_field_id):
    res = custom_fields.delete({'custom_field_id': custom_field_id})
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/customPresentsInForm/<int:custom_id>', methods=['GET'])
@auth.token_required
def custom_presents_in_form(custom_id):
    res = forms.custom_present_in_form({'custom_id': custom_id})
    return make_response(jsonify(res[0])), res[1]
