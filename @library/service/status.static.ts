export class StatusStatic{
  public static SALES_STATUS_VAL = {
    null     :      {
          "name":"Draft",
          "icon":"fa-solid fa-file-pen",
          "color_class":"bg-gray-faded text-gray",
          "value":'draft'
      },
    'draft'     :   {
          "name":"Draft",
          "icon":"fa-solid fa-file-pen",
          "color_class":"bg-gray-faded text-gray",
          "value":'draft'
      },
    "pending"   :   {
          "name":"Pending",
          "icon":"fa-solid fa-triangle-exclamation",
          "color_class":"bg-warn-faded text-warn",
          "value":"pending"
      },
    "issued"    :   {
          "name":"Issued",
          "icon":"fa-solid fa-check-circle",
          "color_class":"bg-success-faded text-success",
          "value":"issued"
      },
    "accepted"  :   {
          "name":"Accepted",
          "icon":"fa-solid fa-check-circle",
          "color_class":"bg-success-faded text-success",
          "value":"accepted"
      },
    "rejected"  :   {
          "name":"Rejected",
          "icon":"fa-solid fa-circle-xmark",
          "color_class":"bg-danger-faded text-danger",
          "value":"rejected"
      },
    "partial"   :   {
          "name":"Partial",
          "icon":"fa-solid fa-circle-half-stroke",
          "color_class":"bg-warn-faded text-warn",
          "value":"partial"
      },
    "cancelled" :   {
          "name":"Cancelled",
          "icon":"fa-solid fa-circle-xmark",
          "color_class":"bg-danger-faded text-danger",
          "value":"cancelled"
      },
    "declined" :    {
          "name":"Declined",
          "icon":"fa-solid fa-circle-xmark",
          "color_class":"bg-danger-faded text-danger",
          "value":"declined"
      },
    "done"      :   {
          "name":"Done",
          "icon":"fa-solid fa-check-circle",
          "color_class":"bg-success-faded text-success",
          "value":"done"
      },
    "completed" :   {
          "name":"Completed",
          "icon":"fa-solid fa-check-circle",
          "color_class":"bg-success-faded text-success",
          "value":"completed"
      },
    "confirmed" :   {
          "name":"Confirmed",
          "icon":"fa-solid fa-check-circle",
          "color_class":"bg-success-faded text-success",
          "value":"confirmed"
      },
    "delivered" :   {
          "name":"Delivered",
          "icon":"fa-solid fa-flag-checkered",
          "color_class":"bg-success-faded text-success",
          "value":"delivered"
      },
    "paid"      :   {
          "name":"Paid",
          "icon":"fa-solid fa-check-double",
          "color_class":"bg-success-faded text-success",
          "value":"paid"
      },
    "unpaid"      : {
          "name":"Unpaid",
          "icon":"fa-solid fa-circle-xmark",
          "color_class":"bg-danger-faded text-danger",
          "value":"unpaid"
      },
    "settled"   :   {
          "name":"Settled",
          "icon":"fa-solid fa-check-double",
          "color_class":"bg-success-faded text-success",
          "value":"settled"
      }
  }

  public static POSITION_TYPE_VAL = {
    "group_position" :   {
            "id": 1,
            "position_key": "group_position",
            "name": "Group",
            "description": "group"
            },
    "subtotal_position" :   {
                "id": 2,
                "position_key": "subtotal_position",
                "name": "SubTotal",
                "description": "sub_total"
            },
    "discount_position" :   {
                "id": 3,
                "position_key": "discount_position",
                "name": "Discount",
                "description": "discount"
            },
    "text_position" :   {
                "id": 4,
                "position_key": "text_position",
                "name": "Text",
                "description": "text_position"
            },
    "pdf_position" :   {
                "id": 5,
                "position_key": "pdf_position",
                "name": "Pdf Page Break",
                "description": "pdf_page_break"
            },
    "product_position" :   {
                "id": 6,
                "position_key": "product_position",
                "name": "Product Position",
                "description": "product_position"
            },
    "standard_position" :   {
                "id": 7,
                "position_key": "standard_position",
                "name": "Standard Position",
                "description": "standard_position"
            }
  }
}

