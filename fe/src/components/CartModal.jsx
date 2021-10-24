import React from "react";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "../assets/styles/AdminDashboard.css";

import CartProductCard from "./CartProductCard";

export default function CartModal(props) {
  const cartGlobal = useSelector((state) => state.cart);

  const renderCart = () => {
    return cartGlobal.cartList.map((val) => {
      return (
        <CartProductCard
          productImage={val.productImage}
          productName={val.productName}
          price={val.price}
          quantity={val.quantity}
          idProduct={val.idProduct}
        />
      );
    });
  };

  return (
    <Modal show={props.show} onHide={props.handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-row justify-content-between px-4">
          <div>Product</div>
          <div>Ready Stock</div>
          <div>Quantity</div>
          <div>Sub Total Price</div>
        </div>
        {renderCart()}
      </Modal.Body>
    </Modal>
  );
}
