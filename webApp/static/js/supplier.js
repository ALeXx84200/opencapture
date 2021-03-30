$(document).ready(() => {
    $('.btn-supplier-edit').off('click').on('click', function (event) {
        openSupplierEditModal(event);
    });
    
    $(".supplier-delete").off('click').on('click', function (event) {
        if (confirm(gt.gettext('_CONFIRM_DELETE_SUPPLIER'))) {
            deleteSupplier(event);
        }
        event.stopPropagation();
    });

    $(".position-delete").off('click').on('click', function (event) {
        if (confirm(gt.gettext('_CONFIRM_DELETE_SUPPLIER_POSITION'))) {
            deleteSupplierPosition(event);
        }
        event.stopPropagation();
    });

    $(".skip-auto-validation").off('click').on('click', function (event) {
        if (confirm(gt.gettext('_CONFIRM_SKIP_AUTO_VALIDATION'))) {
            skipAutoValidation(event);
        }
        event.stopPropagation();
    });

    $(".disable-skip-auto-validation").off('click').on('click', function (event) {
        if (confirm(gt.gettext('_CONFIRM_DISABLE_SKIP_AUTO_VALIDATION'))) {
            disableSkipAutoValidation(event);
        }
        event.stopPropagation();
    });

});

function checkSupplierExist(name) {
    let buttonAddSupplier = $('#add_supplier');
    let buttonEditSupplier = $('#edit_supplier');

    fetch('/ws/supplier/retrieve?query=' + name, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(function(response) {
            if (response.suggestions.length > 0){
                if(buttonEditSupplier.is(":hidden")){
                    buttonAddSupplier.hide();
                    buttonEditSupplier.show();
                     setTimeout(function() {
                             $(".supplier-action-icon").fadeOut(150).fadeIn(150);
                     }, 150);
                }
            }
            else{
                if(buttonAddSupplier.is(":hidden")) {
                    buttonAddSupplier.show();
                    buttonEditSupplier.hide();
                    setTimeout(function () {
                        $(".supplier-action-icon").fadeOut(150).fadeIn(150);
                    }, 150);
                }
            }
        })
}

function addSupplier() {
    let inputName = $('#name')
    let name = inputName.val();
    let VAT = $('#vat_number').val();
    let SIRET = $('#siret_number').val();
    let SIREN = $('#siren_number').val();
    let city = $('#city').val();
    let adress = $('#address').val();
    let adress2 = $('#address2').val();
    let zip = $('#postal_code').val();
    let pdfId = $('#pdf_id').val();
    let inputCompanyType = $('#company-type');
    let inputCompanyTypo = $('#company-typo').val();
    if(name === ''){
        if(!inputName.hasClass("is-invalid")){
            inputName.addClass('is-invalid');
            $('<div class="invalid-feedback invalidName">' +
                gt.gettext("INVALID-INPUT") +
                '</div>'
            ).insertAfter(inputName);
        }
        return;
    }
    // Set company type supplier or client
    let companyType = "";
    if(inputCompanyType !== undefined && inputCompanyType.val()){
        companyType = inputCompanyType.children(":selected").attr("id");
    }

    fetch('/ws/supplier/add', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            pdfId : pdfId,
            name : name,
            VAT : VAT,
            SIRET : SIRET,
            SIREN : SIREN,
            city : city,
            adress : adress,
            adress2 : adress2,
            zip : zip,
            companyType : companyType,
            companyTypo : inputCompanyTypo
        })
    })
        .then(response => response.json())
        .then(function(response) {
            document.location.reload();
        })
}

function editSupplier() {
    let inputName = $('#name');
    let name = inputName.val();
    let VAT = $('#vat_number').val();
    let SIRET = $('#siret_number').val();
    let SIREN = $('#siren_number').val();
    let city = $('#city').val();
    let adress = $('#address').val();
    let adress2 = $('#address2').val();
    let zip = $('#postal_code').val();
    let pdfId = $('#pdf_id').val();
    let supplierId = $('#supplier_id').val();
    let inputCompanyType = $('#company-type');
    let companyTypo = $('#company-typo').val();

    if(name === ''){
        if(!inputName.hasClass("is-invalid")){
            inputName.addClass('is-invalid');
            $('<div class="invalid-feedback invalidName">' +
                gt.gettext("INVALID-INPUT") +
                '</div>'
            ).insertAfter(inputName);
        }
        return;
    }
    // Set company type supplier or client
    let companyType = "";
    if(inputCompanyType !== undefined && inputCompanyType.val()){
        companyType = inputCompanyType.children(":selected").attr("id");
    }
    fetch('/ws/supplier/edit', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            supplierId : supplierId,
            pdfId : pdfId,
            name : name,
            VAT : VAT,
            SIRET : SIRET,
            SIREN : SIREN,
            city : city,
            adress : adress,
            adress2 : adress2,
            zip : zip,
            companyType : companyType,
            companyTypo : companyTypo
        })
    })
        .then(response => response.json())
        .then(function(response) {
            document.location.reload();
    })
}

function openSupplierAddModal() {
    $('#supplier-modal').modal('show');
    $('#btn-supplier-add').show();
    $('#btn-supplier-edit').hide();
    $('#vat_number').val('');
    $('#postal_code').val('');
    $('#city').val('');
    $('#siret_number').val('');
    $('#siren_number').val('');
    $('#address').val('');
    $('#address2').val('');

    let inputName = $('#name').val('').prop('required',true);
    inputName.val('').prop('required',true);
    inputName.removeClass("is-invalid")

    let invalidFeedback = $('.invalid-feedback');
    if(invalidFeedback){
        invalidFeedback.remove()
    }

    $('#company-type option')
     .removeAttr('selected')
     .filter('[id=supplier]')
         .attr('selected', true)
}

function openSupplierEditModal(event){
    openSupplierAddModal();

    $('#btn-supplier-add').hide();
    $('#btn-supplier-edit').show();
    let supplierId = event.target.closest("tr").id;
    $('#supplier_id').val(supplierId);

    fetch('/ws/supplier/retrieve?id=' + supplierId, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(function(response) {
            if (response.suppliers.length > 0){
                let supplier = JSON.parse(response.suppliers[0].data)[0];
                $('#name').val(supplier.name);
                $('#vat_number').val(supplier.VAT);
                $('#postal_code').val(supplier.zipCode);
                $('#city').val(supplier.city);
                $('#siret_number').val(supplier.siret);
                $('#siren_number').val(supplier.siren);
                $('#address').val(supplier.adress1);
                $('#address2').val(supplier.adress2);
                $('#company-type option')
                     .removeAttr('selected')
                     .filter('[id=' + supplier.companyType + ']')
                         .attr('selected', true)
            }
        })
}

function deleteSupplier(event){
    let supplierId = event.target.closest("tr").id;

    fetch('/ws/supplier/delete/' + supplierId, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(function(response) {
            // Check if only one row in table
            if($("#supplier-table > tbody > tr").length === 1)
                window.location.href = "/supplier/list";
            else
                document.location.reload();
        })
}

function deleteSupplierPosition(event){
    let supplierId = event.target.closest("tr").id;

    fetch('/ws/supplier/deletePosition/' + supplierId, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(function(response) {
            // Check if only one row in table
            if($("#supplier-table > tbody > tr").length === 1)
                window.location.href = "/supplier/list";
            else
                document.location.reload();
        })
}

function skipAutoValidation(event){
    let supplierId = event.target.closest("tr").id;

    fetch('/ws/supplier/skipSupplierAutoValidate/' + supplierId, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(function(response) {
            // Check if only one row in table
            if($("#supplier-table > tbody > tr").length === 1)
                window.location.href = "/supplier/list";
            else
                document.location.reload();
        })
}

function disableSkipAutoValidation(event){
    let supplierId = event.target.closest("tr").id;

    fetch('/ws/supplier/disableSkipSupplierAutoValidate/' + supplierId, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(function(response) {
            // Check if only one row in table
            if($("#supplier-table > tbody > tr").length === 1)
                window.location.href = "/supplier/list";
            else
                document.location.reload();
        })
}
