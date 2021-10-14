const { db } = require("../database/index"); //mysql
const moment = require("moment")


module.exports = {
    getDeliveryRate: (req, res) => {
        let results = req.deliveryRate
        return res.status(200).send({ message: 'Success fetch RajaOngkir API', results, success: true })
    },
    addTransaction: (req, res) => {
        //idAddress,idUser,subtotalPrice,deliveryCost,courier,courierService,transactionDate,idStatus,IdWarehouse,buktiPembayaran
        const { idAddress, idUser, subtotalPrice, deliveryCost, courier, courierService, idWarehouse } = req.body
        const transactionDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")


        let scriptQuery = `INSERT INTO transactions
        VALUES (null,${db.escape(idAddress)},${db.escape(idUser)},${db.escape(subtotalPrice)},${db.escape(deliveryCost)},
        ${db.escape(courier)},${db.escape(courierService)},${db.escape(transactionDate)},${db.escape(1)},${db.escape(idWarehouse)},null)`


        db.query(scriptQuery, (err, results) => {
            if (err) {
                res.status(500).send({ message: "Transaction is error", success: false, err });
            }
            res.status(200).send({ message: "transaction is added", success: true, results });
        })
    }
}