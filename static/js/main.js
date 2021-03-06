$(document).ready(function(){
    $(window).keydown(function(event){
        if(event.target.tagName != 'TEXTAREA') {
            if(event.keyCode == 13) {
                event.preventDefault();
                return false;
            }
        }
    });

    $('input[type=file]').change(function(){
        let allowed_extensions = $(this).val().split('.').pop().toLowerCase();
        switch (allowed_extensions) {
            case 'txt':
            case 'fa':
            case 'fasta':
            case 'fsa':
            case 'fna':
            case 'faa':
            case 'ffn':
            case 'frn':
                break;
            default:                
                addErrorClass($(this), 'File format not allowed.!!');
                break;
        }
    });

    $('input[type=file]').click(function(){
        $(this).next('.errorClass').remove();
    });

    $('.qufinduPage .outer_button_div button').click(function(){
        $('.ensembl_textarea_div, .ncbi_textbox_div, .qufinduPage .outer_button_div button').toggleClass('active');
        if($(this).hasClass('active')){
            if($(this).text().trim() == 'Ensembl'){
                $('#database_value_input').val('ensembl');
                $('.ncbi_textbox_div').find('input[type=text]').val('');
            } else {
                $('#database_value_input').val('ncbi');
                $('.ensembl_textarea_div').find('textarea').val('');
            }
        }
    });

    $('.qufindCommon input[name="cpg_island"]').click(function(){
        $('.model_type_label').removeClass('active');
        if($(this).val().trim() == 'yes'){
            $('#cpg_model_yes_div').addClass('active');
            $('#cpg_yes_label').addClass('active');
        } else {
            $('#cpg_model_yes_div').removeClass('active');
            $('#cpg_no_label').addClass('active');
        }
    });

    $('.qufindCommon .bulge_mismatch_select').change(function(){
        let currentSelectId = $(this)[0].id;
        if (currentSelectId == 'bulges_select'){
            if ($(this).val() != 0 && $('#mismatches_select').val() != 0){
                alert('Bulges and Mismatches can not occur simultaneously!!');
                $('.qufindCommon #bulges_select, .qufindCommon #mismatches_select').val('0');
            }
        } else {
            if ($(this).val() != 0 && $('#bulges_select').val() != 0){
                alert('Bulges and Mismatches can not occur simultaneously!!');
                $('.qufindCommon #bulges_select, .qufindCommon #mismatches_select').val('0');
            }
        }
        
    });
    
    $('#qufindu_submit_button').click(function(){
        let errorMsg = validateFormQufindu();
        if(errorMsg != ''){
            alert(errorMsg);
        } else {
            displayLoader($(this));
            $('#form_qufindu').submit();
        }
    });

    $('#qufindv_submit_button').click(function(){
        let errorMsg = validateFormQufindv();
        if(errorMsg != ''){
            alert(errorMsg);
        } else {
            displayLoader($(this));
            $('#form_qufindv').submit();
        }
    });

    $('#qufind_submit_button').click(function(){
        let errorMsg = validateFormQufind();
        if(errorMsg != ''){
            alert(errorMsg);
        } else {
            displayLoader($(this));
            $('#form_qufind').submit();
        }
    });

    $('.resultPage .accordion_div').click(function(){
        $(this).siblings('.accordion_div').removeClass('selected');
        $(this).addClass('selected');
        $('html,body').animate({ scrollTop: $(this).offset().top }, 'slow');
    });
    $('.resultPage .showPlot_button').click(function(){
        $(this).siblings('.plot_div').slideToggle();
    });
    $('.resultPage .resultContainer .dull_div').click(function(){
        $(this).closest('.table_dull_div').removeClass('show_dull');
        $(this).closest('.table_dull_div').find('.show_dull').removeClass('show_dull');
    });

});

function addErrorClass(this_obj, errorMsg){
    $(this_obj).after('<div class="errorClass">' + errorMsg + '</div>');
    $(this_obj).val('');
}

function insertRowImage(img_link){
    let tr_html_string = '<tr class="cpg_png_result cpg_plot_img"> \
        <td colspan="3">\
            <img src="' + img_link + '"> \
        </td>\
    </tr>';
    return tr_html_string;
}

function insertRowMessage(msg){
    let tr_html_string = '<tr class="cpg_png_result cpg_plot_msg"> \
        <td colspan="3">\
            <div class="msgDiv">' + msg + '</div> \
        </td>\
    </tr>';
    return tr_html_string;
}

function generateCPGPlot(query_param, this_td){
    $(this_td).parents('.resultContainer').children('.loadingWheelDiv').show();
    ajaxLink = getURLFolder() + '/drawCPGPlot';
    $('.cpg_png_result').remove();
    $.get( ajaxLink, { 'q' : query_param }, function(response){
        $(this_td).parents('.resultContainer').children('.loadingWheelDiv').hide();
        json_response = JSON.parse(response);
        if (!isJSONEmpty(json_response)){
            if(json_response.error){
                alert(json_response['error']);
            } else {
                $('html,body').animate({ scrollTop: $(this_td).offset().top }, 'slow');
                if(json_response.msg){
                    $(this_td).parents('tr').after(insertRowMessage(json_response['msg']));
                } else {
                    $(this_td).parents('tr').after(insertRowImage(json_response['img']));
                }
            }
        } else {
            window.location.href = getURLFolder() + '/error';
        }
    });
}

function loadExampleQufindu(){
    ajaxLink = getURLFolder() + '/getExample/qufindu';
    $.get( ajaxLink, function(response){
        json_response = JSON.parse(response);
        if(json_response.error){
            alert(json_response['error']);
        } else {
            $('.qufinduPage #ensembl_id_textarea').val(json_response.success);
        }
    });
}

function loadExampleQufind(){
    ajaxLink = getURLFolder() + '/getExample/qufind';
    $.get( ajaxLink, function(response){
        json_response = JSON.parse(response);
        if(json_response.error){
            alert(json_response['error']);
        } else {
            $('.qufindPage #fasta_seq_textarea').val(json_response.success);
        }
    });
}

function loadExampleQufindv(file_no){
    ajaxLink = getURLFolder() + '/getExample/qufindv_' + file_no;
    $.get( ajaxLink, function(response){
        json_response = JSON.parse(response);
        if(json_response.error){
            alert(json_response['error']);
        } else {
            textarea_element = '.qufindvPage #fasta_seq_textarea_' + file_no;
            $(textarea_element).val(json_response.success);
        }
    });
}

function validateFormQufindu(){
    if ($('#database_value_input').val().trim() == ''){
        return 'Select Database';
    } else if ($('#ensembl_id_textarea').val().trim() == '' && $('#database_value_input').val().trim()== 'ensembl'){
        return 'Enter Ensemble Gene id';
    } else if ($('#ncbi_accession_id').val().trim() == '' && $('#database_value_input').val().trim()== 'ncbi'){
        return 'Enter NCBI Accession id';
    } else if ( $('.qufindCommon input[name="cpg_island"]').val().trim() == '' && 
        $('.qufindCommon input[name="model_type"]').val().trim() == '' && 
        checkSelectBoxValue($('.motif_parameters_div select')) &&
        $('.qufindCommon input[name="strand"]').val().trim() == '' &&
        checkSelectBoxValue($('.bulge_mismatch_div select'))) {
        return 'Kindly select required options';
    }
    return '';
}

function checkSelectBoxValue(thisSelect){
    let invalidValues =  false;
    $(thisSelect).each(function(){
        if($(this).val().trim() == ''){
            invalidValues = true;
            return false;
        }
    });
    return invalidValues;
}

function validateFormQufindv(){
    if ($('#fasta_seq_textarea_1').val().trim() == '' && $('#fasta_seq_textarea_2').val().trim() == '' &&
        $('input[name="fasta_seq_file_1"]').val().trim() == '' &&  $('input[name="fasta_seq_file_2"]').val().trim() == '' ){
        return 'Enter/Upload Single Sequence in FASTA format for comparison';
    } else if ($('#fasta_seq_textarea_1').val().trim() == '' && $('input[name="fasta_seq_file_1"]').val().trim() == '' &&
        ($('#fasta_seq_textarea_2').val().trim() != '' || $('input[name="fasta_seq_file_2"]').val().trim() != '' )){
        return 'Enter/Upload 1st Single Sequence in FASTA format';
    } else if (($('#fasta_seq_textarea_1').val().trim() != '' || $('input[name="fasta_seq_file_1"]').val().trim() != '') &&
        $('#fasta_seq_textarea_2').val().trim() == '' && $('input[name="fasta_seq_file_2"]').val().trim() == '' ){
        return 'Enter/Upload 2nd Single Sequence in FASTA format';
    } else if ( $('.qufindCommon input[name="model_type"]').val().trim() == '' && 
        checkSelectBoxValue($('.motif_parameters_div select')) &&
        $('.qufindCommon input[name="strand"]').val().trim() == '' &&
        checkSelectBoxValue($('.bulge_mismatch_div select'))) {
        return 'Kindly select required options';
    }
    return '';
}

function validateFormQufind(){
    if ($('#fasta_seq_textarea').val().trim() == '' && $('#qufind_fasta_seq_file').val().trim() == '' ){
        return 'Enter/Upload Sequence in FASTA format.';
    } else if ( $('.qufindCommon input[name="cpg_island"]').val().trim() == '' && 
        $('.qufindCommon input[name="model_type"]').val().trim() == '' && 
        checkSelectBoxValue($('.motif_parameters_div select')) &&
        $('.qufindCommon input[name="strand"]').val().trim() == '' &&
        checkSelectBoxValue($('.bulge_mismatch_div select'))) {
        return 'Kindly select required options';
    }
    return '';
}

function myFunction() {
    let copyText = document.getElementById("copyLinkText");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    
    let tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied: " + copyText.value;
}
  
function copyLinkOutFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

function isJSONEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}  

window.onscroll = function() {
    let mybutton = document.getElementById("scrollTopBtn");
    if (mybutton != undefined){
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
          } else {
            mybutton.style.display = "none";
        }
    }
};

function scrollTopFunction() {
    $('html,body').animate({ scrollTop: 0 }, 'slow');
}

function errorPostSubmit(errorMsg){
    let form_data = document.createElement("form");
    form_data.method = 'POST';
    form_data.action = getURLFolder() + '/error';
    let errorElement = document.createElement("input");
    errorElement.value = errorMsg;
    errorElement.name = "errorInputJS";
    form_data.appendChild(errorElement);
    document.body.appendChild(form_data);
    form_data.submit();
}

function getURLFolder(){
    let mainURL = $('#getMainURL').val().trim();    
    return mainURL;
}

function displayLoader(thisButton) {
    $(thisButton).parents('.mainContainer').siblings('.loadingWheelDiv').show();
}
function hideLoader(thisButton) {
    $(thisButton).parents('.mainContainer').siblings('.loadingWheelDiv').hide();
}
