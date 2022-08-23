const con = require("./dbConnection");
const excel = require("exceljs");
const fs = require("fs");
const fetch = require("cross-fetch");
var admin = require("firebase-admin");
const express = require("express");
const app = express();

let workbook = new excel.Workbook({
  useStyles: true,
});
let worksheet = workbook.addWorksheet("data ouput");

worksheet.columns = [
  { header: "Booking Id", key: "booking_id", width: 15 },
  { header: "Status", key: "status", width: 20 },
  { header: "City", key: "customer_city", width: 20 },
  { header: "Channel", key: "channel", width: 20 },
  { header: "Customer me", key: "customer_me", width: 20 },
  { header: "Locality", key: "locality", width: 20 },
  { header: "Make", key: "make", width: 20 },
  { header: "Model", key: "model", width: 20 },
  { header: "Service Category", key: "service_category", width: 20 },
  {
    header: "Specific Complaints (at time of booking)",
    key: "complaints",
    width: 40,
  },
  {
    header: "Specific Spares (at time of booking)",
    key: "spare_item",
    width: 40,
  },
  {
    header: "Specific Repairs (at time of booking)",
    key: "labour_item",
    width: 40,
  },
  {
    header: "Booking Date",
    key: "booking_date",
    width: 20,
  },
  {
    header: "Booking Time",
    key: "booking_time",
    width: 20,
  },
  {
    header: "Jobcard Date",
    key: "jobcard_date",
    width: 20,
  },
  {
    header: "Jobcard Time",
    key: "jobcard_time",
    width: 20,
  },
  {
    header: "Service Date",
    key: "service_date",
    width: 20,
  },
  {
    header: "Service Time (time slot)",
    key: "service_time",
    width: 20,
  },
  {
    header: "Mechanic",
    key: "mechanic",
    width: 20,
  },
  {
    header: "Rescheduled (Count)",
    key: "rescheduled",
    width: 20,
  },
  {
    header: "Start Time",
    key: "start_time",
    width: 20,
  },
  {
    header: "Reached Time",
    key: "reached_time",
    width: 20,
  },
  {
    header: "Inspection Done Time",
    key: "inspection_done_time",
    width: 20,
  },
  {
    header: "Start Work Time",
    key: "Start_work_time",
    width: 20,
  },
  {
    header: "End Work Time",
    key: "end_work_time",
    width: 20,
  },
  {
    header: "Submit Report Time",
    key: "Submit_report_time",
    width: 20,
  },
  {
    header: "Payment Time",
    key: "Payment_time",
    width: 20,
  },
  {
    header: "End Booking Time",
    key: "End_booking_time",
    width: 20,
  },
  {
    header: "Invoice Value",
    key: "Invoice_Value",
    width: 20,
  },
  {
    header: "Discount",
    key: "Discount",
    width: 20,
  },
  {
    header: "Round Off",
    key: "Round_Off",
    width: 20,
  },
  {
    header: "Amount Collected",
    key: "Amount_Collected",
    width: 20,
  },
  {
    header: "Payment Mode",
    key: "Payment_Mode",
    width: 20,
  },
  {
    header: "Inspection Done (App / FW)",
    key: "Inspection_Done_App_FW",
    width: 30,
  },
  {
    header: "End Work (App / FW)",
    key: "End_Work_App_FW",
    width: 30,
  },
  {
    header: "Submit Report (App / FW)",
    key: "Submit_Report_App_FW",
    width: 30,
  },
  {
    header: "Payment (App / FW)",
    key: "Payment_App_FW",
    width: 30,
  },
  {
    header: "End Booking (App / FW)",
    key: "End_Booking_App_FW",
    width: 30,
  },
  {
    header: "Inspection Selfie (Image Link)",
    key: "Inspection_Selfie",
    width: 30,
  },
  {
    header: "KM Reading (Image Link)",
    key: "KM_Reading",
    width: 30,
  },
  {
    header: "Registration No (Image Link)",
    key: "Registration_No",
    width: 30,
  },
  {
    header: "Inspection Done (Audio Link)",
    key: "Inspection_Done_Audio",
    width: 30,
  },
  {
    header: "Inspection Done (Image Link)",
    key: "Inspection_Done_Image",
    width: 30,
  },
  {
    header: "Submit Report (Image Link)",
    key: "Submit_report_Image",
    width: 30,
  },
  {
    header: "Submit Report (Audio Link)",
    key: "Submit_report_Audio",
    width: 30,
  },
  {
    header: "Feedback Rating",
    key: "Feedback_Rating",
    width: 20,
  },
  {
    header: "Complaint (Yes / No)",
    key: "Complaint_Yes_No",
    width: 40,
  },
  {
    header: "Cancellation Reason",
    key: "Cancellation_Reason",
    width: 20,
  },
];

exports.writeToExcel = (req, res, next, fromDate, toDate, ...queries) => {
  //   console.log(queries);

  if (fromDate && toDate) {
    //running a separate query to get booking ids

    let bookingIds = [];

    con.query(
      "SELECT booking_id FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id",
      [fromDate, toDate],
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }

        result.map((data, ind) => {
          bookingIds.push(data.booking_id);
        });
      }
    );

    queries.map((query, id) => {
      runQueries(query, fromDate, toDate, id, res,bookingIds);
    });
  } else {
    res.status(400).json({ message: "Dates are not defined!" });
  }
};

const runQueries = (q, fromDate, toDate, id, res,bookingIds) => {
  //   console.log(q);

  con.query(q, [fromDate, toDate], function (err, result, fields) {
    if (err) {
      console.log(err);
    }
    if (id === 0) {
      //row2Q
      result.map((data, ind) => {
        worksheet.addRow([data.booking_id]);
      });
    } else if (id === 1) {
      //row3Q

      const StatusCol = worksheet.getColumn("status");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].status;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 2) {
      const StatusCol = worksheet.getColumn("customer_city");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].customer_city;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 3) {
      const StatusCol = worksheet.getColumn("channel");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].customer_channel;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 4) {
      const StatusCol = worksheet.getColumn("customer_me");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].customer_name;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 5) {
      const StatusCol = worksheet.getColumn("locality");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].customer_area;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 6) {
      const StatusCol = worksheet.getColumn("make");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].make_name;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 7) {
      const StatusCol = worksheet.getColumn("model");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].model_name;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 8) {
      const StatusCol = worksheet.getColumn("service_category");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].service_name;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 9) {
      const StatusCol = worksheet.getColumn("complaints");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let complaintsArr = [];

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            complaintsArr.push(result[i].complaints);
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(complaintsArr);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 10) {
      const StatusCol = worksheet.getColumn("spare_item");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let complaintsArr = [];

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            complaintsArr.push(result[i].item);
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(complaintsArr);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 11) {
      const StatusCol = worksheet.getColumn("labour_item");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let complaintsArr = [];

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            complaintsArr.push(result[i].item);
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(complaintsArr);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 12) {
      const StatusCol = worksheet.getColumn("booking_date");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Booking_Date;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 13) {
      const StatusCol = worksheet.getColumn("booking_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Booking_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 14) {
      const StatusCol = worksheet.getColumn("jobcard_date");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Jobcard_Date;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 15) {
      const StatusCol = worksheet.getColumn("jobcard_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Jobcard_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 16) {
      const StatusCol = worksheet.getColumn("service_date");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Service_Date;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 17) {
      const StatusCol = worksheet.getColumn("service_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Service_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 18) {
      const StatusCol = worksheet.getColumn("mechanic");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].id === id) {
            found = true;
            value = result[i].Mechanic;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 19) {
      const StatusCol = worksheet.getColumn("rescheduled");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 20) {
      const StatusCol = worksheet.getColumn("start_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Start_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 21) {
      const StatusCol = worksheet.getColumn("reached_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Reached_time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 22) {
      const StatusCol = worksheet.getColumn("inspection_done_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Inspection_done_time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 23) {
      const StatusCol = worksheet.getColumn("Start_work_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (Number(result[i].booking_id) === id) {
            found = true;
            value = result[i].Start_Work_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 24) {
      const StatusCol = worksheet.getColumn("end_work_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].End_Work_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 25) {
      const StatusCol = worksheet.getColumn("Submit_report_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Submit_Report_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 26) {
      const StatusCol = worksheet.getColumn("Payment_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Payment_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 27) {
      const StatusCol = worksheet.getColumn("End_booking_time");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].End_Booking_Time;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 28) {
      const StatusCol = worksheet.getColumn("Invoice_Value");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Invoice_Value;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 29) {
      const StatusCol = worksheet.getColumn("Discount");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Discount;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 30) {
      const StatusCol = worksheet.getColumn("Round_Off");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Round_Off;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 31) {
      const StatusCol = worksheet.getColumn("Amount_Collected");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Amount_Collected;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 32) {
      const StatusCol = worksheet.getColumn("Payment_Mode");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Payment_Mode;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 33) {
      const StatusCol = worksheet.getColumn("Inspection_Done_App_FW");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Inspection_Done_App_FW;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 34) {
      const StatusCol = worksheet.getColumn("End_Work_App_FW");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].End_Work_App_FW;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 35) {
      const StatusCol = worksheet.getColumn("Submit_Report_App_FW");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Submit_Report_App_FW;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 36) {
      const StatusCol = worksheet.getColumn("Payment_App_FW");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Payment_App_FW;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 37) {
      const StatusCol = worksheet.getColumn("End_Booking_App_FW");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].End_Booking_App_FW;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 38) {
      const StatusCol = worksheet.getColumn("Inspection_Selfie");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 39) {
      const StatusCol = worksheet.getColumn("KM_Reading");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 40) {
      const StatusCol = worksheet.getColumn("Registration_No");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 41) {
      const StatusCol = worksheet.getColumn("Inspection_Done_Audio");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 42) {
      const StatusCol = worksheet.getColumn("Inspection_Done_Image");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 43) {
      const StatusCol = worksheet.getColumn("Submit_report_Image");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 44) {
      const StatusCol = worksheet.getColumn("Submit_report_Audio");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = 1;
          }
        }

        if (!found) {
          valuesArr.push(0);
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 45) {
      const StatusCol = worksheet.getColumn("Feedback_Rating");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].feedback;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else if (id === 46) {
      const StatusCol = worksheet.getColumn("Complaint_Yes_No");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let complaintsArr = [];

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            complaintsArr.push(
              result[i].complaints !== "" ? result[i].complaints : null
            );
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(complaintsArr[0] && complaintsArr);
        }
      });

      StatusCol.values = [, , ...valuesArr];
    } else {
      const StatusCol = worksheet.getColumn("Cancellation_Reason");

      let valuesArr = [];

      bookingIds.map((id) => {
        let found = false;
        let value;

        for (let i = 0; i < result.length; i++) {
          if (result[i].booking_id === id) {
            found = true;
            value = result[i].Cancellation_Reason;
          }
        }

        if (!found) {
          valuesArr.push(" ");
        } else {
          valuesArr.push(value);
        }
      });

      StatusCol.values = [, , ...valuesArr];

      //cell styles
      worksheet.eachRow(function (Row, rowNum) {
        Row.eachCell(function (Cell, cellNum) {
          if (rowNum === 1) {
            Cell.font = {
              bold: true,
            };
          }
          Cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });
      });

      //writing data to excel sheet
      workbook.xlsx
        .writeFile("Service_report.xlsx")
        .then(() => {
          // console.log("file saved");

          const data = fs.readFileSync("./Service_report.xlsx", {
            encoding: "base64",
          });

          res
            .status(200)
            .json({ message: "Query outputs saved to excel!", data });
        })

        .catch((err) => {
          console.log("err", err);
          res.status(400).json({
            message:
              "Saving to excel sheet failed! Please make sure to close the file to write to it.",
            error: err,
          });
        });
    }
  });
};
