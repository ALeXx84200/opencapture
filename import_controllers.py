from src.backend.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'db' not in custom_array:
    from src.backend.controllers import db
else:
    db = getattr(__import__(custom_array['db']['path'], fromlist=[custom_array['db']['module']]), custom_array['db']['module'])

if 'pdf' not in custom_array:
    from src.backend.controllers import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if 'auth' not in custom_array:
    from src.backend.controllers import auth
else:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'user' not in custom_array:
    from src.backend.controllers import user
else:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

if 'supplier' not in custom_array:
    from src.backend.controllers import supplier
else:
    supplier = getattr(__import__(custom_array['supplier']['path'], fromlist=[custom_array['supplier']['module']]), custom_array['supplier']['module'])

if 'ws_splitter' not in custom_array:
    from src.backend import ws_splitter
else:
    ws_splitter = getattr(__import__(custom_array['ws_splitter']['path'], fromlist=[custom_array['ws_splitter']['module']]), custom_array['ws_splitter']['module'])
