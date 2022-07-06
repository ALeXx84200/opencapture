-- Improve user table security
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Add LDAP
CREATE TABLE "login_methods"
(
    "id"            SERIAL      UNIQUE PRIMARY KEY,
    "method_name"   VARCHAR(64) UNIQUE,
    "method_label"  VARCHAR(255),
    "enabled"       BOOLEAN     DEFAULT FALSE,
    "data"          JSONB       DEFAULT '{}'
);
INSERT INTO "login_methods" ("method_name", "method_label", "enabled", "data") VALUES ('default', 'Authentification par defaut', True, '{}');
INSERT INTO "login_methods" ("method_name", "method_label", "enabled", "data") VALUES ('ldap', 'Authentification par LDAP', False, '{"host": "", "port": "", "baseDN": "", "suffix": "","prefix": "", "typeAD": "", "usersDN": "", "classUser": "", "loginAdmin": "", "classObject": "", "passwordAdmin": "", "attributLastName": "", "attributFirstName": "", "attributSourceUser": "", "attributRoleDefault": ""}');

-- Update privileges to fix bad parent association
TRUNCATE TABLE privileges;
INSERT INTO "privileges" ("id", "label", "parent") VALUES (1, 'access_verifier', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (2, 'access_splitter', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (3, 'settings', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (4, 'upload', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (6, 'users_list', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (7, 'add_user', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (8, 'update_user', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (9, 'roles_list', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (10, 'add_role', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (11, 'update_role', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (12, 'custom_fields', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (13, 'forms_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (14, 'add_form', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (15, 'update_form', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (16, 'suppliers_list', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (17, 'create_supplier', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (18, 'update_supplier', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (19, 'customers_list', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (20, 'create_customer', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (21, 'update_customer', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (22, 'change_language', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (23, 'outputs_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (24, 'add_output', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (25, 'update_output', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (26, 'inputs_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (27, 'update_input', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (28, 'add_input', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (29, 'export_suppliers', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (30, 'position_mask_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (31, 'add_position_mask', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (32, 'update_position_mask', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (33, 'history', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (34, 'separator_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (35, 'add_input_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (36, 'update_input_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (37, 'inputs_list_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (38, 'update_output_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (39, 'add_output_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (40, 'outputs_list_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (41, 'update_form_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (42, 'add_form_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (43, 'forms_list_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (44, 'add_document_type', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (45, 'update_document_type', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (46, 'import_suppliers', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (47, 'statistics', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (48, 'configurations', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (49, 'docservers', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (50, 'regex', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (51, 'document_type_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (52, 'login_methods', 'administration');
ALTER SEQUENCE "privileges_id_seq" RESTART WITH 53;