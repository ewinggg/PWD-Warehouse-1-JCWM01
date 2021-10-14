import React from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios'
import { API_URL } from '../../constants/API';

const PaymentConfirmation = ({ nextStep, prevStep, handleChange, total, shippingInformation, previewOrder }) => {
    const cartsGlobal = useSelector((state) => state.carts);

    const Continue = () => {
        // handleChange(selectedCourier)
        nextStep();
    }
    const Previous = e => {
        e.preventDefault();
        prevStep();
    }

    const checkoutHandler = async () => {
        let idTransaction = 0
        try {
            const addTransactionResponse = await axios.post(`${API_URL}/transaction`, {
                idAddress: shippingInformation.idAddress,
                idUser: shippingInformation.idUser,
                subtotalPrice: total,
                deliveryCost: previewOrder.cost[0].value,
                courier: previewOrder.name,
                courierService: previewOrder.service,
                idWarehouse: previewOrder.idWarehouse
            })
            idTransaction = addTransactionResponse.data.results.insertId

            const addCheckoutItem = await axios.post(`${API_URL}/checkout`, {
                cartsGlobal, idTransaction
            })

            const changeUserStocksResponse = await axios.patch(`${API_URL}/userstocks`, {
                cartsGlobal
            })
            console.log(changeUserStocksResponse);
        } catch (error) {
            console.log(error);//send error dari backend
        }

    }

    return (
        <div className="mt-5 ms-4">
            <h3>Preview Order</h3>
            <div className="shipping-information-container">
                <h4>Silahkan lakukan pembayaran sebesar </h4>
                {total}
                {previewOrder.cost[0].value} + {total} ={previewOrder.cost[0].value + total}
            </div >

            <button onClick={Previous} type="submit">Previous</button>
            <button type="submit" onClick={checkoutHandler}>Finish</button>
        </div >
    )
}

export default PaymentConfirmation
