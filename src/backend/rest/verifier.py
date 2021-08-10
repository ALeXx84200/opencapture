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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from ..import_controllers import auth
from ..import_controllers import pdf, verifier
from flask import Blueprint, make_response, request

bp = Blueprint('verifier', __name__, url_prefix='/ws/')


@bp.route('verifier/upload', methods=['POST'])
@auth.token_required
def upload():
    purchase_or_sale = 'purchase'
    customer_id = None
    if 'purchaseOrSale' in request.args:
        purchase_or_sale = request.args['purchaseOrSale']
    if 'customerId' in request.args:
        customer_id = request.args['customerId']

    files = request.files
    res = verifier.handle_uploaded_file(files, purchase_or_sale, customer_id)
    if res:
        return make_response('', 200)
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('verifier/invoices/list', methods=['POST'])
@auth.token_required
def invoices_list():
    data = request.json
    res = verifier.retrieve_invoices(data)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>', methods=['GET'])
@auth.token_required
def invoice_info(invoice_id):
    res = verifier.get_invoice_by_id(invoice_id)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>/updatePosition', methods=['PUT'])
@auth.token_required
def update_invoice_position(invoice_id):
    data = request.json['args']
    res = verifier.update_position_by_invoice_id(invoice_id, data)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/delete/<int:invoice_id>', methods=['DELETE'])
@auth.token_required
def delete_invoice(invoice_id):
    res = verifier.delete_invoice(invoice_id)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>/updateData', methods=['PUT'])
@auth.token_required
def update_invoice_data(invoice_id):
    data = request.json['args']
    res = verifier.update_invoice_data_by_invoice_id(invoice_id, data)
    print(res)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>/exportXML', methods=['POST'])
@auth.token_required
def export_xml(invoice_id):
    res = verifier.export_xml(invoice_id)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>/deleteData', methods=['PUT'])
@auth.token_required
def delete_invoice_data(invoice_id):
    field_id = request.json['args']
    res = verifier.delete_invoice_data_by_invoice_id(invoice_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_invoice_position(invoice_id):
    field_id = request.json['args']
    res = verifier.delete_invoice_position_by_invoice_id(invoice_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/invoices/<int:invoice_id>/update', methods=['PUT'])
@auth.token_required
def update_invoice(invoice_id):
    data = request.json['args']
    res = verifier.update_invoice(invoice_id, data)
    return make_response(res[0], res[1])


@bp.route('verifier/ocrOnFly', methods=['POST'])
@auth.token_required
def ocr_on_fly():
    data = request.json
    result = pdf.ocr_on_the_fly(data['fileName'], data['selection'], data['thumbSize'])
    return make_response({'result': result}, 200)
