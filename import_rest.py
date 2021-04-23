from src.backend.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])


if 'auth' not in custom_array:
    from src.backend.rest import auth
else:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]),
                   custom_array['auth']['module'])

if 'user' not in custom_array:
    from src.backend.rest import user
else:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]),
                   custom_array['user']['module'])

if 'locale' not in custom_array:
    from src.backend.rest import locale
else:
    locale = getattr(__import__(custom_array['locale']['path'], fromlist=[custom_array['locale']['module']]),
                     custom_array['locale']['module'])

if 'config' not in custom_array:
    from src.backend.rest import config
else:
    config = getattr(__import__(custom_array['config']['path'], fromlist=[custom_array['config']['module']]),
                     custom_array['config']['module'])

if 'verifier' not in custom_array:
    from src.backend.rest import verifier
else:
    splitter = getattr(__import__(custom_array['verifier']['path'], fromlist=[custom_array['verifier']['module']]),
                       custom_array['verifier']['module'])

if 'splitter' not in custom_array:
    from src.backend.rest import splitter
else:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]),
                       custom_array['splitter']['module'])
