import { ColDef, ColGroupDef } from "ag-grid-community";
import { FormStructure, ITemplateSettings, objArrayType, pageSetup, template_type } from "@library/library.interface";

export class Templates {

  static POSITION_TYPES_VALUE = {
    group_position:     {id: 1, name: 'Group'},
    subtotal_position:  {id: 2, name: 'SubTotal'},
    discount_position:  {id: 3, name: 'Discount'},
    text_position:      {id: 4, name: 'Text'},
    pdf_position:       {id: 5, name: 'Pdf Page Break'},
    product_position:   {id: 6, name: 'Product Position'},
    standard_position:  {id: 7, name: 'Standard Position'}
  }

  public static getLabelFromType(template_type: template_type): string {
    switch(template_type){
        case 'quotes': return 'Quote';
        case "order": return 'Sales Order';
        case "invoices": return 'Invoice';
        case "deliveries": return 'Delivery Note';
        case "creditnotes": return 'Credit Note';
        case "accountstatement": return 'Account Statement';
        case "purchaseorders": return 'Purchase Order';
        case "bills": return 'Bill';
        case "expenses": return 'Expense';
    }
    return '--';
  }


  public static getDefaultTplSetup(){
    return {
      headerOptions: {
          showDate: true,
          showValidUntil: true,
          showCompanyContact: true,
          showCustomerNumber: true,
          showProjectName: true,
          showVATNumber: true
      },
      columnOptions: {
          showPositionNumber: true,
          showAmount: true,
          showUnitPrice: true
      },
      footer: {
          companyNameAndAddress: true,
          companyEmailAddress: true,
          companyPhone: true,
          bankAccountInfo: true,
          vatNumber: true,
          euVATNumber: true,
          mobile: true,
          fax: true,
          website: true,
      },
      appendPDF: false
    };
  }

  public static getDefaultDocConfig(): ITemplateSettings{
    return {
      companyLogo: '',
      template: {
          titleColor: '#000000',
          lineColor: 'var(--border-color)',
          textColor: '#000000',
      },
      templateEl: {
          noPagebreak: false,
          showCompanyAddress: true,
          showCompanyLogo: true,
          showLines: true,
          showPageNumbers: false,
          columnHeadings: false,
      },
      font: {
          size: 11,
          heading: 13,
          recipient: 11,
          company: 11,
      },
      letterHead: {
        docBackgroundCover: '',
        docBackgroundSheet: ''
      },
      distance: {
          topMargin: 12,
          bottomMargin: 12,
          leftMargin: 12,
          rightMargin: 12,
          headerLine: 0
      },
      recipient: {
          align: 'left',
          leftRight: 0,
          upDown: 0
      },
      setup: this.getDefaultTplSetup()
    };
  }

  public static settingsToReqParams(settings, rawdata){
    const _s: ITemplateSettings = settings;
    const _template = {
      "id"                    : rawdata.template.id,
      "name"                  : rawdata.template.name,
      "ref"                   : rawdata.template.ref,
      "title_color"           : _s.template.titleColor,
      "line_color"            : _s.template.lineColor,
      "text_color"            : _s.template.textColor,
      "no_pagebreak"          : _s.templateEl.noPagebreak,
      "show_company_address"  : _s.templateEl.showCompanyAddress,
      "show_company_logo"     : _s.templateEl.showCompanyLogo,
      "show_lines"            : _s.templateEl.showLines,
      "show_page_numbers"     : _s.templateEl.showPageNumbers,
      "column_headings"       : _s.templateEl.columnHeadings,
      "font_size"             : _s.font.size,
      "font_heading"          : _s.font.heading,
      "font_recipient"        : _s.font.recipient,
      "font_company"          : _s.font.company,
      "top_margin"            : _s.distance.topMargin,
      "bottom_margin"         : _s.distance.bottomMargin,
      "left_margin"           : _s.distance.leftMargin,
      "header_line"           : _s.distance.headerLine,
      "recipient_align"       : _s.recipient.align,
      "recipient_leftRight"   : _s.recipient.leftRight,
      "recipient_upDown"      : _s.recipient.upDown,
      "company_logo"          : _s.companyLogo,
      "doc_background_cover"  : _s.letterHead?.docBackgroundCover,
      "doc_background_sheet"  : _s.letterHead?.docBackgroundSheet,
      "org_id"                : rawdata.template.org_id
    }

    const _st = settings.setup;
    const _setup = {
      "id"                        : rawdata.pageSetup.id,
      "name"                      : rawdata.pageSetup.name,
      "show_date"                 : _st.headerOptions.showDate,
      "show_valid_until"          : _st.headerOptions.showValidUntil,
      "show_payback_until"        : _st.headerOptions.showPayableUntil,
      "show_company_contact"      : _st.headerOptions.showCompanyContact,
      "show_customer_number"      : _st.headerOptions.showCustomerNumber,
      "show_project_name"         : _st.headerOptions.showProjectName,
      "show_order_number"         : _st.headerOptions.showOrderNumber,
      "show_vat_number"           : _st.headerOptions.showVATNumber,
      "show_position_header"      : _st.columnOptions.showPositionNumber,
      "show_amount"               : _st.columnOptions.showAmount,
      "show_unit_price"           : _st.columnOptions.showUnitPrice,
      "company_name_and_address"  : _st.footer.companyNameAndAddress,
      "company_email_address"     : _st.footer.companyEmailAddress,
      "bank_account_info"         : _st.footer.bankAccountInfo,
      "vat_number"                : _st.footer.vatNumber,
      "eu_vat_number"             : _st.footer.euVATNumber,
      "mobile"                    : _st.footer.mobile,
      "fax"                       : _st.footer.fax,
      "phone_1"                   : _st.footer.companyPhone,
      "phone_2"                   : _st.footer.companyPhone,
      "website"                   : _st.footer.companyPhone
    }

    return {template: _template, pageSetup: _setup}
  }

  public static resultsToSettings(template, pageSetup){

    let _pgs : any = [pageSetup].map(_p => {
      return {
        headerOptions: {
          showDate            : _p.show_date,
          showValidUntil      : _p.show_valid_until,
          showPayableUntil    : _p.show_payable_until,
          showCompanyContact  : _p.show_company_contact,
          showCustomerNumber  : _p.show_customer_number,
          showProjectName     : _p.show_project_name,
          showOrderNumber     : _p.show_order_number,
          showVATNumber       : _p.show_vat_number
        },
        columnOptions: {
          showPositionNumber  : _p.show_position_header,
          showAmount          : _p.show_amount,
          showUnitPrice       : _p.show_unit_price
        },
        footer: {
          companyNameAndAddress : _p.company_name_and_address,
          companyEmailAddress   : _p.company_email_address,
          companyPhone          : _p.phone_1,
          bankAccountInfo       : _p.bank_account_info,
          vatNumber             : _p.vat_number,
          euVATNumber           : _p.eu_vat_number,
          mobile                : _p.mobile,
          fax                   : _p.fax,
          website               : _p.website
        },
        appendPDF               : true,//_p.append_pdf,
        showPaymentSlip         : true,//_p.payment_slip,
        setBackground           : true//_p.set_background_cover,
      } as pageSetup
    });


    const _template : any = [template].map(_t => {
      return{
        companyLogo: _t.company_logo,
        template: {
          titleColor: _t.title_color,
          lineColor : _t.line_color,
          textColor : _t.text_color
        },
        templateEl: {
          noPagebreak         : _t.no_pagebreak,
          showCompanyAddress  : _t.show_company_address,
          showCompanyLogo     : _t.show_company_logo,
          showLines           : _t.show_lines,
          showPageNumbers     : _t.show_page_numbers,
          columnHeadings      : _t.column_headings
        },
        font: {
          size      : _t.font_size,
          heading   : _t.font_heading,
          recipient : _t.font_recipient,
          company   : _t.font_company
        },
        letterHead: {
          docBackgroundCover: _t.doc_background_cover,
          docBackgroundSheet: _t.doc_background_sheet
        },
        distance: {
          topMargin     : _t.top_margin,
          bottomMargin  : _t.bottom_margin,
          leftMargin    : _t.left_margin,
          //rightMargin   : _t.right_margin, //missing field
          rightMargin   : (_t.right_margin || 12), //missing field
          headerLine    : _t.header_line,
        },
        recipient: {
          align         : (_t.recipient_align == 'right' ? 'right' : 'left'),
          leftRight     : _t.recipient_leftRight,
          upDown        : _t.recipient_upDown,
        },
        setup : _pgs[0]
      } as ITemplateSettings
    });

    return {template: _template, pageSetup: _pgs}

  }

  public static getConfigFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | any)[]}{
    let _formProperties: objArrayType = {
      eg_content_type : {type: "select", autoConfig:{title:'description', description:'name', saveField:'id'}, displayVal: 'name'},
      doc_template    : {autoConfig:{title:'name', description:'name', saveField:'id'}, displayVal: 'name'},
      doc_setup       : {autoConfig:{title:'name', description:'name', saveField:'id'}, displayVal: 'name'},
    }


    let _formStructure: (FormStructure | string)[] = ["name", "eg_content_type","doc_setup", "doc_template"]
    return {
      formProperties: _formProperties,
      formStructure: _formStructure
    }


  }
}
