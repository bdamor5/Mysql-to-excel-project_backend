const express = require("express");
const app = express();
const { writeToExcel } = require("./writeToExcel");
const con = require("./dbConnection");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req, res) => {
  res.status(200).json({message:'Backend Running Successfully!'})
})

con.connect(function (err) {
  if (err) throw err;
  console.log("DB Connected!");
  let fromDate;
  let toDate;

  const row2Q =
    "SELECT booking_id FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row3Q =
    "SELECT booking_id,status FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row4Q =
    "SELECT booking_id,customer_city FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row5Q =
    "SELECT booking_id,customer_channel FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row6Q =
    "SELECT booking_id,customer_name FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row7Q =
    "SELECT booking_id,customer_area FROM bookings WHERE created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row8Q =
    "SELECT booking_id,make_name FROM bookings JOIN vehicle_make ON vehicle_make.make_id = bookings.vehicle_make WHERE bookings.created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row9Q =
    "SELECT booking_id,model_name FROM bookings JOIN vehicle_model ON vehicle_model.model_id = bookings.vehicle_model WHERE bookings.created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row10Q =
    "SELECT booking_id,service_name FROM bookings JOIN service_category ON service_category.id = bookings.service_category_id WHERE bookings.created_on BETWEEN ? AND ? ORDER BY booking_id";

  const row11Q =
    "SELECT bookings.booking_id,booking_estimate_details.item,booking_estimate_details.complaints,booking_estimate_details.item_type FROM booking_estimate_details JOIN bookings ON bookings.booking_id = booking_estimate_details.booking_id WHERE booking_estimate_details.item_type='Complaints' AND bookings.created_on BETWEEN ? AND ? ORDER BY bookings.booking_id";

  const row12Q =
    "SELECT bookings.booking_id,booking_estimate_details.item,booking_estimate_details.spares_rate,booking_estimate_details.item_type FROM booking_estimate_details JOIN bookings ON bookings.booking_id = booking_estimate_details.booking_id WHERE  booking_estimate_details.item_type='Spare' AND bookings.created_on BETWEEN ? AND ?";

  const row13Q =
    "SELECT bookings.booking_id,booking_estimate_details.item,booking_estimate_details.labour_rate,booking_estimate_details.item_type FROM booking_estimate_details JOIN bookings ON bookings.booking_id = booking_estimate_details.booking_id WHERE  booking_estimate_details.item_type='Labour' AND bookings.created_on BETWEEN ? AND ?";

  const row14Q =
    "SELECT bookings.booking_id , DATE_FORMAT(booking_track.created_on,'%d-%c-%Y') AS Booking_Date FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Created' AND booking_track.status='New Booking' AND booking_track.created_on BETWEEN ? AND ?";

  const row15Q =
    "SELECT bookings.booking_id , DATE_FORMAT(booking_track.created_on,'%H:%i:%s') AS Booking_Time FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Created' AND booking_track.status='New Booking' AND booking_track.created_on BETWEEN ? AND ?";

  const row16Q =
    "SELECT bookings.booking_id , DATE_FORMAT(booking_track.created_on,'%d-%c-%Y') AS Jobcard_Date FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage LIKE 'Jobcard Created%' AND booking_track.status='New Booking' AND booking_track.created_on BETWEEN ? AND ?";

  const row17Q =
    "SELECT bookings.booking_id , DATE_FORMAT(booking_track.created_on,'%H:%i:%s') AS Jobcard_Time FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage LIKE 'Jobcard Created%' AND booking_track.status='New Booking' AND booking_track.created_on BETWEEN ? AND ?";

  const row18Q =
    "SELECT booking_id,DATE_FORMAT(service_date,'%d-%c-%Y') AS Service_Date FROM bookings WHERE created_on BETWEEN ? AND ?";

  const row19Q =
    "SELECT booking_id,DATE_FORMAT(time_slot,'%H:%i:%s') AS Service_Time FROM bookings WHERE created_on BETWEEN ? AND ?";

  const row20Q =
    "SELECT service_providers.id,bookings.assigned_mechanic,CONCAT(service_providers.name,' ',service_providers.lastname) AS Mechanic FROM service_providers JOIN bookings ON bookings.assigned_mechanic = service_providers.id WHERE bookings.created_on BETWEEN ? AND ? ORDER BY service_providers.id";

  const row21Q =
    "SELECT bookings.booking_id FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Rescheduled' AND booking_track.status='New Booking' AND bookings.created_on BETWEEN ? AND ?";

  const row22Q =
    "SELECT bookings.booking_id,DATE_FORMAT(booking_services.start_time,'%d-%c-%Y %H:%i:%s') AS Start_Time FROM booking_services JOIN bookings ON bookings.booking_id = booking_services.booking_id WHERE booking_services.created_on BETWEEN ? AND ?";

  const row23Q =
    "SELECT booking_services.booking_id,DATE_FORMAT(reached_time,'%H:%i:%s') AS Reached_time FROM booking_services WHERE created_on BETWEEN ? AND ?";

  const row24Q =
    "SELECT booking_services.booking_id,DATE_FORMAT(inspection_time,'%H:%i:%s') AS Inspection_done_time FROM booking_services WHERE created_on BETWEEN ? AND ?";

  const row25Q =
    "SELECT booking_track.booking_id,DATE_FORMAT(booking_track.created_on,'%H:%i:%s') AS Start_Work_Time FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Started Service' AND booking_track.status='Ongoing' AND booking_track.created_on BETWEEN ? AND ?";

  const row26Q =
    "SELECT bookings.booking_id,DATE_FORMAT(booking_services.end_work_time,'%H:%i:%s') AS End_Work_Time FROM booking_services JOIN bookings ON bookings.booking_id = booking_services.booking_id WHERE booking_services.created_on BETWEEN ? AND ?";

  const row27Q =
    "SELECT bookings.booking_id,DATE_FORMAT(booking_track.created_on,'%H:%i:%s') AS Submit_Report_Time FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Submit Report' AND booking_track.status='Ongoing' AND booking_track.created_on BETWEEN ? AND ?";

  const row28Q =
    "SELECT bookings.booking_id,DATE_FORMAT(customer_ledger.updated_on,'%H:%i:%s') AS Payment_Time FROM customer_ledger JOIN bookings ON bookings.booking_id = customer_ledger.booking_id WHERE customer_ledger.transaction_type='final_paid' AND customer_ledger.status='Paid' AND customer_ledger.created_on BETWEEN ? AND ?";

  const row29Q =
    "SELECT bookings.booking_id,DATE_FORMAT(booking_track.created_on,'%H:%i:%s') AS End_Booking_Time FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='End Booking' AND booking_track.status='Completed' AND booking_track.created_on BETWEEN ? AND ?";

  const row30Q =
    "SELECT bookings.booking_id,customer_ledger.requested_amount AS Invoice_Value FROM customer_ledger JOIN bookings ON bookings.booking_id = customer_ledger.booking_id WHERE customer_ledger.transaction_type='invoice_total' AND customer_ledger.created_on BETWEEN ? AND ?";

  const row31Q =
    "SELECT bookings.booking_id,customer_ledger.received_amount AS Discount FROM customer_ledger JOIN bookings ON bookings.booking_id = customer_ledger.booking_id WHERE customer_ledger.transaction_type='discount' AND customer_ledger.created_on BETWEEN ? AND ?";

  const row32Q =
    "SELECT bookings.booking_id,customer_ledger.requested_amount AS Round_Off FROM customer_ledger JOIN bookings ON bookings.booking_id = customer_ledger.booking_id WHERE customer_ledger.transaction_type='round_off' AND customer_ledger.created_on BETWEEN ? AND ?";

  const row33Q =
    "SELECT bookings.booking_id,customer_ledger.received_amount AS Amount_Collected FROM customer_ledger JOIN bookings ON bookings.booking_id = customer_ledger.booking_id WHERE customer_ledger.transaction_type='final_paid' AND customer_ledger.status='Paid' AND customer_ledger.created_on BETWEEN ? AND ?";

  const row34Q =
    "SELECT bookings.booking_id,customer_ledger.mode AS Payment_Mode FROM customer_ledger JOIN bookings ON bookings.booking_id = customer_ledger.booking_id WHERE customer_ledger.transaction_type='final_paid' AND customer_ledger.status='Paid' AND customer_ledger.created_on BETWEEN ? AND ?";

  const row35Q =
    "SELECT bookings.booking_id,booking_track.owner_application AS Inspection_Done_App_FW FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Inspection Done' AND booking_track.status='Ongoing' AND booking_track.created_on BETWEEN ? AND ?";

  const row36Q =
    "SELECT bookings.booking_id,booking_track.owner_application AS End_Work_App_FW FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Work End' AND booking_track.status='Ongoing' AND booking_track.created_on BETWEEN ? AND ? ORDER BY bookings.booking_id";

  const row37Q =
    "SELECT bookings.booking_id,booking_track.owner_application AS Submit_Report_App_FW FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Submit Report' AND booking_track.status='Ongoing' AND booking_track.created_on BETWEEN ? AND ? ORDER BY bookings.booking_id";

  const row38Q =
    "SELECT bookings.booking_id,booking_track.owner_application AS Payment_App_FW FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='End Booking' AND booking_track.status='Completed' AND booking_track.created_on BETWEEN ? AND ?";

  const row39Q =
    "SELECT bookings.booking_id,booking_track.owner_application AS End_Booking_App_FW FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='End Booking' AND booking_track.status='Completed' AND booking_track.created_on BETWEEN ? AND ?";

  const row40Q =
    "SELECT bookings.booking_id,inspection_uploads.file_url FROM inspection_uploads JOIN bookings ON bookings.booking_id = inspection_uploads.booking_id WHERE inspection_uploads.type='Selfie' AND inspection_uploads.converted_date BETWEEN ? AND ?";

  const row41Q =
    "SELECT bookings.booking_id,inspection_uploads.file_url FROM inspection_uploads JOIN bookings ON bookings.booking_id = inspection_uploads.booking_id WHERE inspection_uploads.type='Km Reading' AND inspection_uploads.converted_date BETWEEN ? AND ?";

  const row42Q =
    "SELECT bookings.booking_id,inspection_uploads.file_url FROM inspection_uploads JOIN bookings ON bookings.booking_id = inspection_uploads.booking_id WHERE inspection_uploads.type='Number Plate' AND inspection_uploads.converted_date BETWEEN ? AND ?";

  const row43Q =
    "SELECT bookings.booking_id,inspection_uploads.file_url FROM inspection_uploads JOIN bookings ON bookings.booking_id = inspection_uploads.booking_id WHERE inspection_uploads.type='Audio' AND inspection_uploads.converted_date BETWEEN ? AND ?";

  const row44Q =
    "SELECT bookings.booking_id,inspection_uploads.file_url FROM inspection_uploads JOIN bookings ON bookings.booking_id = inspection_uploads.booking_id WHERE inspection_uploads.type='Vehicle Images' AND inspection_uploads.converted_date BETWEEN ? AND ?";

  const row45Q =
    "SELECT bookings.booking_id,report_uploads.file_url FROM report_uploads JOIN bookings ON bookings.booking_id = report_uploads.booking_id WHERE report_uploads.type='Vehicle Images' AND report_uploads.converted_date BETWEEN ? AND ?";

  const row46Q =
    "SELECT bookings.booking_id,report_uploads.file_url FROM report_uploads JOIN bookings ON bookings.booking_id = report_uploads.booking_id WHERE report_uploads.type='Audio' AND report_uploads.converted_date BETWEEN ? AND ?";

  const row47Q =
    "SELECT bookings.booking_id,feedback.feedback AS Feedback_Rating FROM feedback JOIN bookings ON bookings.booking_id = feedback.booking_id WHERE feedback.feedback_date BETWEEN ? AND ?";

  const row48Q =
    "SELECT booking_id,complaints FROM bookings WHERE created_on BETWEEN ? AND ?";

  const row49Q =
    "SELECT booking_id,remark AS Cancellation_Reason FROM bookings WHERE created_on BETWEEN ? AND ?";

  app.post("/setDate", (req, res, next) => {
    // console.log(req.body.fromDate);
    // console.log(req.body.toDate);

    fromDate = req.body.fromDate;
    toDate = req.body.toDate + ' 23:59:59:999';

    res.status(200).json({});
  });

  app.get("/saveToExcel", (req, res, next) =>
    writeToExcel(
      req,
      res,
      next,
      fromDate,
      toDate,
      row2Q,
      row3Q,
      row4Q,
      row5Q,
      row6Q,
      row7Q,
      row8Q,
      row9Q,
      row10Q,
      row11Q,
      row12Q,
      row13Q,
      row14Q,
      row15Q,
      row16Q,
      row17Q,
      row18Q,
      row19Q,
      row20Q,
      row21Q,
      row22Q,
      row23Q,
      row24Q,
      row25Q,
      row26Q,
      row27Q,
      row28Q,
      row29Q,
      row30Q,
      row31Q,
      row32Q,
      row33Q,
      row34Q,
      row35Q,
      row36Q,
      row37Q,
      row38Q,
      row39Q,
      row40Q,
      row41Q,
      row42Q,
      row43Q,
      row44Q,
      row45Q,
      row46Q,
      row47Q,
      row48Q,
      row49Q
    )
  );

  app.get("/test", (req, res) => {
    console.log(fromDate)
    console.log(toDate)
    con.query("SELECT bookings.booking_id , DATE_FORMAT(booking_track.created_on,'%d-%c-%Y') AS Booking_Date FROM booking_track JOIN bookings ON bookings.booking_id = booking_track.booking_id WHERE booking_track.stage='Created' AND booking_track.status='New Booking' AND booking_track.created_on BETWEEN ? AND ?",[fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row2", (req, res) => {
    con.query(row2Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row3", (req, res) => {
    con.query(row3Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row4", (req, res) => {
    con.query(row4Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row5", (req, res) => {
    con.query(row5Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row6", (req, res) => {
    con.query(row6Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row7", (req, res) => {
    con.query(row7Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row8", (req, res) => {
    con.query(row8Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row9", (req, res) => {
    con.query(row9Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row10", (req, res) => {
    con.query(row10Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row11", (req, res) => {
    con.query(row11Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row12", (req, res) => {
    con.query(row12Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row13", (req, res) => {
    con.query(row13Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row14", (req, res) => {
    con.query(row14Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row15", (req, res) => {
    con.query(row15Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row16", (req, res) => {
    con.query(row16Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row17", (req, res) => {
    con.query(row17Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row18", (req, res) => {
    con.query(row18Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row19", (req, res) => {
    con.query(row19Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row20", (req, res) => {
    con.query(row20Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row21", (req, res) => {
    con.query(row21Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row22", (req, res) => {
    con.query(row22Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row23", (req, res) => {
    con.query(row23Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row24", (req, res) => {
    con.query(row24Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row25", (req, res) => {
    con.query(row25Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row26", (req, res) => {
    con.query(row26Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row27", (req, res) => {
    con.query(row27Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row28", (req, res) => {
    con.query(row28Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row29", (req, res) => {
    con.query(row29Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row30", (req, res) => {
    con.query(row30Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row31", (req, res) => {
    con.query(row31Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row32", (req, res) => {
    con.query(row32Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row33", (req, res) => {
    con.query(row33Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row34", (req, res) => {
    con.query(row34Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row35", (req, res) => {
    con.query(row35Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row36", (req, res) => {
    con.query(row36Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row37", (req, res) => {
    con.query(row37Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row38", (req, res) => {
    con.query(row38Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row39", (req, res) => {
    con.query(row39Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row40", (req, res) => {
    con.query(row40Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row41", (req, res) => {
    con.query(row41Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row42", (req, res) => {
    con.query(row42Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row43", (req, res) => {
    con.query(row43Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row44", (req, res) => {
    con.query(row44Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row45", (req, res) => {
    con.query(row45Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row46", (req, res) => {
    con.query(row46Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row47", (req, res) => {
    con.query(row47Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row48", (req, res) => {
    con.query(row48Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });

  app.get("/row49", (req, res) => {
    con.query(row49Q, [fromDate, toDate], function (err, result, fields) {
      if (err) {
        res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  });
});

let port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port : ${port}`);
});
