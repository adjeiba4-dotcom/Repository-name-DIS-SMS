/**
 * Default global configuration keys for DIS-SMS.
 * Seeded/ensured by the Global Configuration service.
 */

const CONFIG_CATEGORIES = {
  LOCALIZATION: "LOCALIZATION",
  PAGINATION: "PAGINATION",
  ACADEMIC: "ACADEMIC",
  GENERAL: "GENERAL",
};

const DEFAULT_PLATFORM_CONFIG = [
  {
    settingKey: "app.currency",
    settingValue: "GHS",
    description: "Default currency code",
    category: CONFIG_CATEGORIES.LOCALIZATION,
    dataType: "STRING",
    isSystem: true,
  },
  {
    settingKey: "app.currency_symbol",
    settingValue: "GH₵",
    description: "Currency display symbol",
    category: CONFIG_CATEGORIES.LOCALIZATION,
    dataType: "STRING",
    isSystem: true,
  },
  {
    settingKey: "app.date_format",
    settingValue: "DD/MM/YYYY",
    description: "Preferred date display format",
    category: CONFIG_CATEGORIES.LOCALIZATION,
    dataType: "STRING",
    isSystem: true,
  },
  {
    settingKey: "app.time_format",
    settingValue: "HH:mm",
    description: "Preferred time display format",
    category: CONFIG_CATEGORIES.LOCALIZATION,
    dataType: "STRING",
    isSystem: true,
  },
  {
    settingKey: "app.timezone",
    settingValue: "Africa/Accra",
    description: "Application timezone",
    category: CONFIG_CATEGORIES.LOCALIZATION,
    dataType: "STRING",
    isSystem: true,
  },
  {
    settingKey: "app.pagination_default",
    settingValue: "10",
    description: "Default page size for list views",
    category: CONFIG_CATEGORIES.PAGINATION,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "app.pagination_max",
    settingValue: "100",
    description: "Maximum allowed page size",
    category: CONFIG_CATEGORIES.PAGINATION,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "academic.default_term_count",
    settingValue: "3",
    description: "Default number of terms per academic year",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "academic.grading_scale",
    settingValue: "PERCENTAGE",
    description: "Default grading scale mode",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "STRING",
    isSystem: true,
  },
  {
    settingKey: "academic.ca_weight",
    settingValue: "40",
    description: "Continuous Assessment weight percentage for final results (default 40)",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "academic.exam_weight",
    settingValue: "60",
    description: "Examination weight percentage for final results (default 60)",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "academic.pass_mark",
    settingValue: "50",
    description: "Minimum final score percentage required to pass",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "academic.promotion_pass_average",
    settingValue: "50",
    description:
      "Minimum report-card average for automatic PROMOTED recommendation",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "academic.probation_pass_average",
    settingValue: "40",
    description:
      "Minimum report-card average for PROMOTED_ON_PROBATION (below promotion pass)",
    category: CONFIG_CATEGORIES.ACADEMIC,
    dataType: "NUMBER",
    isSystem: true,
  },
  {
    settingKey: "app.school_year_label",
    settingValue: "Academic Year",
    description: "Label used for academic year in UI",
    category: CONFIG_CATEGORIES.GENERAL,
    dataType: "STRING",
    isSystem: true,
  },
];

module.exports = {
  CONFIG_CATEGORIES,
  DEFAULT_PLATFORM_CONFIG,
};
