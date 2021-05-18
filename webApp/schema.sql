CREATE TABLE if NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  creation_date DATETIME DATETIME DEFAULT (datetime('now', 'localtime')),
  enabled INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'OK',
  role VARCHAR DEFAULT 'user'
);

CREATE TABLE if NOT EXISTS suppliers(
    id                         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    vat_number                 VARCHAR(200),
    name                       VARCHAR NOT NULL,
    siret                      VARCHAR(20),
    siren                      VARCHAR(20),
    adress1                    VARCHAR,
    adress2                    VARCHAR,
    postal_code                VARCHAR,
    city                       VARCHAR,
    typology                   VARCHAR,
    invoice_number_position    VARCHAR,
    no_taxes_1_position        VARCHAR,
    no_taxes_2_position        VARCHAR,
    no_taxes_3_position        VARCHAR,
    no_taxes_4_position        VARCHAR,
    order_number_1_position    VARCHAR,
    order_number_2_position    VARCHAR,
    order_number_3_position    VARCHAR,
    order_number_4_position    VARCHAR,
    delivery_number_1_position VARCHAR,
    delivery_number_2_position VARCHAR,
    delivery_number_3_position VARCHAR,
    delivery_number_4_position VARCHAR,
    vat_1_position             VARCHAR,
    vat_2_position             VARCHAR,
    vat_3_position             VARCHAR,
    vat_4_position             VARCHAR,
    vat_amount_1_position      VARCHAR,
    total_ttc_position         VARCHAR,
    footer_page                VARCHAR,
    supplier_page              VARCHAR,
    invoice_number_page        VARCHAR,
    invoice_date_page          VARCHAR,
    invoice_date_position      VARCHAR,
    due_date_position          VARCHAR,
    due_date_page              VARCHAR,
    company_type               VARCHAR DEFAULT 'supplier',
    status                     VARCHAR DEFAULT 'ACTIVE',
    skip_auto_validate         VARCHAR DEFAULT 'False',
    get_only_raw_footer        VARCHAR DEFAULT 'False'
);

CREATE TABLE if NOT EXISTS invoices(
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    id_supplier              INTEGER,
    vat_number               VARCHAR DEFAULT NULL,
    vat_number_position      VARCHAR,
    invoice_number           VARCHAR,
    invoice_number_position  VARCHAR,
    invoice_date             VARCHAR,
    invoice_date_position    VARCHAR,
    invoice_due_date         VARCHAR,
    invoice_due_date_position VARCHAR,
    invoice_due_date_page    VARCHAR,
    date_number              VARCHAR,
    date_number_position     VARCHAR,
    filename                 VARCHAR NOT NULL,
    path                     VARCHAR NOT NULL,
    status                   VARCHAR DEFAULT 'NEW' NOT NULL,
    full_jpg_filename        VARCHAR,
    tiff_filename            VARCHAR,
    img_width                VARCHAR,
    nb_pages                 INTEGER     DEFAULT 1,
    register_date            DATETIME DEFAULT (datetime('now', 'localtime')),
    total_ttc                VARCHAR,
    total_ttc_position       VARCHAR,
    no_taxes_1               VARCHAR,
    no_taxes_1_position      VARCHAR,
    vat_1                    VARCHAR,
    vat_1_position           VARCHAR,
    vat_amount_1             VARCHAR,
    vat_amount_1_position    VARCHAR,
    order_number_1           VARCHAR,
    order_number_1_position  VARCHAR,
    order_number_1_page      VARCHAR,
    delivery_number_1        VARCHAR,
    delivery_number_1_position VARCHAR,
    delivery_number_1_page   VARCHAR,
    footer_page              VARCHAR,
    supplier_page            VARCHAR,
    invoice_number_page      VARCHAR,
    invoice_date_page        VARCHAR,
    locked                   INTEGER DEFAULT 0 NOT NULL,
    locked_by                VARCHAR(20),
    processed                INTEGER DEFAULT 0,
    original_filename        VARCHAR
);

CREATE TABLE IF NOT EXISTS "status" (
	"id"	        VARCHAR(20),
	"label"	        VARCHAR(200),
	"label_long"	VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS splitter_batches(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dir_name VARCHAR,
    first_page VARCHAR,
    image_folder_name VARCHAR,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'NEW',
    page_number INTEGER
);

CREATE TABLE IF NOT EXISTS splitter_images(
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    batch_name VARCHAR,
    image_path VARCHAR,
    image_number INTEGER,
    status VARCHAR DEFAULT 'NEW'
);

INSERT INTO "status" ("id","label","label_long") VALUES ('NEW','À valider','À valider');
INSERT INTO "status" ("id","label","label_long") VALUES ('END','Cloturée','Facture validée et cloturée');
INSERT INTO "status" ("id","label","label_long") VALUES ('ERR','Erreur','Erreur lors de la qualification');
INSERT INTO "status" ("id","label","label_long") VALUES ('ERR_GED','Erreur','Erreur lors de l''envoi à Maarch');
INSERT INTO "status" ("id","label","label_long") VALUES ('WAIT_SUP','En attente','En attente validation fournisseur');
INSERT INTO "status" ("id","label","label_long") VALUES ('DEL','Supprimée','Supprimée');
INSERT INTO "users" ("id","username","password", "role") VALUES (1,'admin','pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403', 'admin');