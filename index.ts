import express from "express";
const app = express();
const port = 3003;
const appRoute = require("./config/routes.ts");
const cors = require("cors");
const cron = require("node-cron");
import axios from "axios";
import * as task from "./controller/task";
const https = require("https");
import * as notification_quipster from "./function/notification_quipster";
import * as functionGlobal from "./function/global_function";
import * as errors from "./function/global_function";
import util from "util";
import pool from "./config/connect";

app.use(cors());
app.use(
  express.json({
    limit: 10000000,
  })
);
app.use(
  express.urlencoded({
    limit: 10000000,
    extended: true,
  })
);
// app.use(express.raw({
//     limit: 10000000
// }))
// app.use(express.text({
//     limit: 10000000
// }))

import requestBodyFormatter from "./middleware/requestbodyformatter";
import requestBodyDateRangeLimitter from "./middleware/requestBodyDateRangeLimitter";
import project_type from "./config/project_type";
app.use(requestBodyFormatter);
app.use(requestBodyDateRangeLimitter);
app.listen(port, async () => {
  console.log(`This app is running on ${port}`);
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 10000);
  });
  
  // ambilTanggalJatuhTempo();
  // if (project_type === 'production') {
  //     console.log("Starting Broadcast...")
  //     axios({
  //         method: "post",
  //         url: "https://apiw.looyal.id/v3/task/run"
  //     })
  // }
});

const ambilTanggalJatuhTempo = async () => {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();
    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var tanggalJatuhTempo = await notification_quipster.getDueDay(
        {
          connection: connection,
        },
        {
          business: 2,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (tanggalJatuhTempo.length > 0) {
        const cronSchedule = `32 14 * * *`;

        cron.schedule(cronSchedule, () => {
          try {
            tanggalJatuhTempo.forEach(async (data:any) => {
              await functionGlobal.sendNewWA(
                data.customer_phone,
                "HALO TEST COBA",
                "62811961006"
              );
              console.log(
                "Notifikasi WhatsApp terkirim ke",
                data.customer_phone
              );
            });
          } catch (err) {
            console.error("Gagal mengirim notifikasi WhatsApp:", err);
          }
        });
      } else {
        console.log("Tanggal jatuh tempo tidak ditemukan dalam database.");
      }
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Terjadi kesalahan saat mengambil tanggal jatuh tempo:",
      error
    );
  }
};


app.use("/", appRoute);
