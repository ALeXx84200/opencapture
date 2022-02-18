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

from flask import Blueprint, request, jsonify, make_response
from src.backend.import_controllers import auth, config
from src.backend.main import create_classes_from_current_config

bp = Blueprint('config', __name__,  url_prefix='/ws/')


@bp.route('config/readConfig', methods=['GET'])
@auth.token_required
def read_config():
    if request.method == 'GET':
        _vars = create_classes_from_current_config()
        return make_response(jsonify({'config': _vars[1].cfg})), 200


@bp.route('config/gitInfo', methods=['GET'])
@auth.token_required
def get_git_info():
    _vars = create_classes_from_current_config()
    return make_response({
        'git_latest': config.get_last_git_version()
    }), 200
