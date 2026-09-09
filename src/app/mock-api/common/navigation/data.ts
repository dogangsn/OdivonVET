/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
  {
    "id": "dashboards",
    "title": "DashBoard",
    "type": "basic",
    "icon": "heroicons_outline:chart-pie",
    "link": "/dashboards"
  },
  {
    "id": "appointment-management",
    "title": "Randevu Yönetimi",
    "type": "collapsable",
    "icon": "heroicons_outline:calendar",
    "children": [
      {
        "id": "my-assistant",
        "title": "Asistanım",
        "type": "basic",
        "link": "/appointment-management/my-assistant"
      },
      {
        "id": "appointment-calendar",
        "title": "Randevu Takvimi",
        "type": "basic",
        "link": "/appointment-management/appointment-calendar"
      },
      {
        "id": "pre-interviews",
        "title": "Ön Görüşmeler",
        "type": "basic",
        "link": "/appointment-management/pre-interviews"
      },
      {
        "id": "appointments",
        "title": "Randevular",
        "type": "basic",
        "link": "/appointment-management/appointments"
      },
      {
        "id": "customers",
        "title": "Müşteriler",
        "type": "basic",
        "link": "/appointment-management/customers"
      },
      {
        "id": "ad-management",
        "title": "Reklam Yönetimi",
        "type": "basic",
        "link": "/appointment-management/ad-management"
      },
      {
        "id": "events",
        "title": "Etkinlikler",
        "type": "basic",
        "link": "/appointment-management/events"
      },
      {
        "id": "archive-management",
        "title": "Arşiv Yönetimi",
        "type": "basic",
        "link": "/appointment-management/archive-management"
      },
      {
        "id": "session-tracking",
        "title": "Seans Takibi",
        "type": "basic",
        "link": "/appointment-management/session-tracking"
      },
      {
        "id": "sales-tracking",
        "title": "Satış Takibi",
        "type": "basic",
        "link": "/appointment-management/sales-tracking"
      },
      {
        "id": "package-management",
        "title": "Paket Yönetimi",
        "type": "basic",
        "link": "/appointment-management/package-management"
      },
      {
        "id": "stock-management",
        "title": "Stok Yönetimi",
        "type": "basic",
        "link": "/appointment-management/stock-management"
      },
      {
        "id": "agenda",
        "title": "Ajanda",
        "type": "basic",
        "link": "/appointment-management/agenda"
      },
      {
        "id": "promissory-note-tracking",
        "title": "Senet Takibi",
        "type": "basic",
        "link": "/appointment-management/promissory-note-tracking"
      },
      {
        "id": "cash-report",
        "title": "Kasa Raporu",
        "type": "basic",
        "link": "/appointment-management/cash-report"
      },
      {
        "id": "sms-management",
        "title": "SMS Yönetimi",
        "type": "basic",
        "link": "/appointment-management/sms-management"
      },
      {
        "id": "settings",
        "title": "Ayarlar",
        "type": "basic",
        "link": "/appointment-management/settings"
      }
    ]
  },
  {
    "id": "appointment",
    "title": "Randevular",
    "type": "collapsable",
    "icon": "heroicons_solid:calendar",
    "children": [
      {
        "id": "appointmentcalendar",
        "title": "Randevu Takvimi",
        "type": "basic",
        "icon": "heroicons_solid:calendar",
        "link": "/appointmentcalendar"
      },
      {
        "id": "vaccineappointment",
        "title": "Aşı Takvimi",
        "type": "basic",
        "icon": "colorize",
        "link": "/vaccineappointment"
      },
      {
        "id": "dailyappointment",
        "title": "Günlük Randevular",
        "type": "basic",
        "icon": "heroicons_solid:calendar",
        "link": "/dailyappointment"
      },
      {
        "id": "reportappointment",
        "title": "Raporlar",
        "type": "basic",
        "icon": "heroicons_solid:chart-bar",
        "link": "/reportappointment"
      }
    ]
  },
  {
    "id": "customer",
    "title": "Müşteri",
    "type": "collapsable",
    "icon": "heroicons_outline:user-group",
    "children": [
      {
        "id": "customeradd",
        "title": "Yeni Müşteri Ekle",
        "type": "basic",
        "icon": "heroicons_outline:user-add",
        "link": "/customeradd"
      },
      {
        "id": "farmclientadd",
        "title": "Yeni Çiftlik Ekle",
        "type": "basic",
        "icon": "pets",
        "link": "/farmclientadd"
      },
      {
        "id": "examinationadd",
        "title": "Yeni Muayene Ekle",
        "type": "basic",
        "icon": "heroicons_solid:plus",
        "link": "/examinationadd"
      },
      {
        "id": "customerlist",
        "title": "Müşteri Listesi",
        "type": "basic",
        "icon": "heroicons_outline:clipboard-check",
        "link": "/customerlist"
      }
    ]
  },
  {
    "id": "patients",
    "title": "Hastalar",
    "type": "collapsable",
    "icon": "pets",
    "children": [
      {
        "id": "patientslist",
        "title": "Hasta Listesi",
        "type": "basic",
        "icon": "pets",
        "link": "/patientslist"
      },
      {
        "id": "examination",
        "title": "Muayeneler",
        "type": "basic",
        "icon": "local_hospital",
        "link": "/examination"
      },
      {
        "id": "lab",
        "title": "Laboratuvar",
        "type": "basic",
        "icon": "heroicons_outline:beaker",
        "link": "/lab"
      }
    ]
  },
  {
    "id": "accounting",
    "title": "Muhasebe",
    "type": "collapsable",
    "icon": "heroicons_outline:cash",
    "children": [
      {
        "id": "sales",
        "title": "Satış",
        "type": "basic",
        "icon": "heroicons_outline:trending-up",
        "link": "/sales"
      },
      {
        "id": "buying",
        "title": "Alış",
        "type": "basic",
        "icon": "heroicons_outline:trending-down",
        "link": "/buying"
      },
      {
        "id": "cashtransactions",
        "title": "Kasa Hareketleri",
        "type": "basic",
        "icon": "heroicons_outline:switch-vertical",
        "link": "/cashtransactions"
      }
      //{
      //  "id": "checkportfolio",
      //  "title": "Çek Portföyü",
      //  "type": "basic",
      //  "icon": "heroicons_outline:clipboard-check",
      //  "link": "/checkportfolio"
      //}
    ]

  },
  {
    "id": "productvaccidefinition",
    "title": "Ürün / Aşı Tanım",
    "type": "collapsable",
    "icon": "shopping_bag",
    "children": [
      {
        "id": "vaccinelist",
        "title": "Aşı Listesi",
        "type": "basic",
        "icon": "checklist",
        "link": "/vaccinelist"
      },
      {
        "id": "productdescription",
        "title": "Ürün Tanımı",
        "type": "basic",
        "icon": "mat_outline:production_quantity_limits",
        "link": "/productdescription"
      },
      {
        "id": "vaccinedefinition",
        "title": "Aşı/İlaç Tanım",
        "type": "basic",
        "icon": "colorize",
        "link": "/vaccinedefinition"
      }
    ]

  },
  {
    "id": "pethotels",
    "title": "Pet Otel",
    "type": "collapsable",
    "icon": "local_hotel",
    "children": [
      {
        "id": "accommodations",
        "title": "Konaklamalar",
        "type": "basic",
        "icon": "hotel",
        "link": "/accommodations"
      },
      {
        "id": "accommodationrooms",
        "title": "Odalar",
        "type": "basic",
        "icon": "room_service",
        "link": "/accommodationrooms"
      }
    ]

  },
  {
    "id": "file-manager",
    "title": "Dosya Yöneticisi",
    "type": "basic",
    "icon": "heroicons_outline:cloud",
    "link": "/file-manager"
  },
  {
    "id": "demands",
    "title": "Alım Talep",
    "type": "basic",
    "icon": "mat_outline:data_saver_on",
    "link": "/demands"
  },
  {
    "id": "suppliers",
    "title": "Tedarikçiler",
    "type": "basic",
    "icon": "heroicons_outline:truck",
    "link": "/suppliers"
  },
  {
    "id": "agenda",
    "title": "Ajandam",
    "type": "basic",
    "icon": "mat_outline:task_alt",
    "link": "/agenda"
  },
  {
    "id": "store",
    "title": "Depo",
    "type": "basic",
    "icon": "mat_outline:store",
    "link": "/store"
  },
  {
    "id": "reports",
    "title": "Raporlar",
    "type": "basic",
    "icon": "report",
    "link": "/reports"
  },
  {
    "id": "clinicalstatistics",
    "title": "Klinik İstatistikleri",
    "type": "basic",
    "icon": "heroicons_outline:chart-pie",
    "link": "/clinicalstatistics"
  },
  {
    "id": "sms",
    "title": "Toplu SMS",
    "type": "basic",
    "icon": "heroicons_outline:phone",
    "link": "/sms"
  },
  {
    "id": "definition",
    "title": "Tanımlamalar",
    "type": "collapsable",
    "icon": "heroicons_outline:collection",
    "children": [
      {
        "id": "casingdefinition",
        "title": "Kasa",
        "type": "basic",
        "icon": "mat_outline:cases",
        "link": "/casingdefinition"
      },
      {
        "id": "unitdefinition",
        "title": "Birim",
        "type": "basic",
        "icon": "heroicons_outline:scale",
        "link": "/unitdefinition"
      },
      {
        "id": "appointmenttypes",
        "title": "Randevu Tipleri",
        "type": "basic",
        "icon": "mat_outline:checklist",
        "link": "/appointmenttypes"
      },
      {
        "id": "customergroup",
        "title": "Müşteri Grubu",
        "type": "basic",
        "icon": "heroicons_outline:user-group",
        "link": "/customergroup"
      },
      {
        "id": "productcategory",
        "title": "Ürün Kategorisi",
        "type": "basic",
        "icon": "heroicons_outline:tag",
        "link": "/productcategory"
      },
      {
        "id": "paymentmethods",
        "title": "Ödeme Yöntemleri",
        "type": "basic",
        "icon": "heroicons_outline:cash",
        "link": "/paymentmethods"
      },
      {
        "id": "taxes",
        "title": "KDV Oranı",
        "type": "basic",
        "icon": "mat_outline:exposure",
        "link": "/taxes"
      },
      {
        "id": "smstemplate",
        "title": "Sms Şablonları",
        "type": "basic",
        "icon": "mat_outline:sms",
        "link": "/smstemplate"
      },
      {
        "id": "services",
        "title": "Hizmetler",
        "type": "basic",
        "icon": "view_comfy",
        "link": "/services"
      },
      {
        "id": "outputtemplate",
        "title": "Çıktı Şablonları",
        "type": "basic",
        "icon": "print",
        "link": "/outputtemplate"
      }
    ]

  },
  {
    "id": "settings",
    "title": "Ayarlar",
    "type": "collapsable",
    "icon": "heroicons_outline:cog",
    "children": [
      // {
      //     id   : 'users',
      //     title: 'Kullanıcılar',
      //     type : 'basic',
      //     icon : 'heroicons_outline:user',
      //     link : '/users'
      // },
      {
        "id": "smsparameters",
        "title": "SMS Ayarları",
        "type": "basic",
        "icon": "send_to_mobile",
        "link": "/smsparameters"
      },
      {
        "id": "parameters",
        "title": "Şirket Parametreleri",
        "type": "basic",
        "icon": "heroicons_outline:adjustments",
        "link": "/parameters"
      }
    ]

  },
  {
    "id": "example",
    "title": "Ekran Kilidi",
    "type": "basic",
    "icon": "heroicons_outline:lock-closed",
    "link": "/example"
  }

];























export const compactNavigation: FuseNavigationItem[] = [
  {
    id: 'example',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/example'
  }
];
export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: 'example',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/example'
  }
];
export const horizontalNavigation: FuseNavigationItem[] = [
  {
    id: 'example',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/example'
  }
];
