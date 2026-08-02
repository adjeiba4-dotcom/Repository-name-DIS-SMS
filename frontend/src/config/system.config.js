/**
 * System-level defaults (pagination, locale, formats).
 */

const systemConfig = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  locale: "en-US",
  dateFormat: "YYYY-MM-DD",
  dateTimeFormat: "YYYY-MM-DD HH:mm",
  currency: {
    code: "GHS",
    symbol: "₵",
  },
  table: {
    stickyHeader: true,
    dense: false,
  },
};

export default systemConfig;
