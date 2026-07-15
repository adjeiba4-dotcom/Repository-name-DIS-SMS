const db = require("../database/db");

exports.findAllEnrollments = async () => {
  return await db.enrollment.findMany({
    include: {
      student: true,
      class: true,
      academicYear: true,
      term: true,
    },
    orderBy: {
      id: "desc",
    },
  });
};