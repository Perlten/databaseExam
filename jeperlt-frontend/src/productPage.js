import React, { Component } from 'react';
import { createOrder } from './facade/orderFacade'
import { getProducts } from './facade/productFacade'
import { addToCart, getBasket, clearBasket } from './facade/basketFacade'
import { Button, Table, Row, Col, Modal, Form } from 'react-bootstrap';

export default class ProductPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      products: [],
      basket: [],
      showCreditcard: false,
    };
  }

  async componentWillMount() {
    this.setState({ products: await getProducts(1) });
    this.setState({ basket: await getBasket() });
  }

  addToCart = async (product) => {
    let basket = await addToCart(product);
    this.setState({ basket });
  }

  buyBasket = async () => {
    this.setState({ showCreditcard: true });
  }

  makeOrder = async (order) => {
    /*
  order: {
    name,
    products,
    cityTo
  }
  creditCardInfo:  {
    creditCard: {
      phoneNumber,
      verificationCode,
      cardNumber,
      expirationDate
    }
  }
  */
    let orderObject = {
      order: {
        name: order.name,
        products: this.state.basket,
        cityTo: order.cityTo
      },
      creditCardInfo: {
        phoneNumber: order.phoneNumber,
        verificationCode: order.verificationCode,
        cardNumber: order.cardNumber,
        expirationDate: order.expirationDate
      }
    }
    await createOrder(orderObject);
    clearBasket();
    this.setState({ basket: [] });
  }


  render() {
    let handleCreditCardModalClose = () => {
      this.setState({ showCreditcard: false });
    }
    return (
      <div>
        <CreditcardModal makeOrderCallback={this.makeOrder} showModal={this.state.showCreditcard} handleCloseModal={handleCreditCardModalClose} />
        <Row>
          <Col xs={3} >
            <BasketTable basket={this.state.basket} clearBasketCallback={() => {
              this.setState({ basket: [] });
              clearBasket();
            }} />
            <Button style={{ marginTop: "40px" }} onClick={this.buyBasket}>Buy</Button>
          </Col>
          <Col xs={6}>
            <ProductTable products={this.state.products} addToCartCallback={(product) => {
              this.addToCart(product);
            }} />
          </Col>
        </Row >
      </div>
    )
  }
}

class CreditcardModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      verificationCode: "123",
      cardNumber: "11111111111111111",
      expirationDate: "11-11",
      cityTo: "Aars",
      phoneNumber: "28940903",
      name: "Perlt"
    }
  }


  // verificationCode,
  // cardNumber,
  // expirationDate

  render() {
    let { showModal, handleCloseModal, makeOrderCallback } = this.props;
    return (
      <Modal show={showModal} onHide={handleCloseModal} >
        <Modal.Header closeButton>
          <Modal.Title>Make order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Card number</Form.Label>
              <Form.Control
                onChange={(e) => this.setState({ cardNumber: e.target.value })}
                value={this.state.cardNumber}
                type="text"
                placeholder="Card number" />
            </Form.Group>

            <Form.Group>
              <Form.Label>Expiration date</Form.Label>
              <Form.Control
                onChange={(e) => this.setState({ expirationDate: e.target.value })}
                value={this.state.expirationDate}
                type="text"
                placeholder="Expiration date" />
            </Form.Group>

            <Form.Group>
              <Form.Label>Verification code</Form.Label>
              <Form.Control
                onChange={(e) => this.setState({ verificationCode: e.target.value })}
                value={this.state.verificationCode}
                type="text"
                placeholder="Verification code" />
            </Form.Group>

            <Form.Group>
              <Form.Label>City to</Form.Label>
              <Form.Control
                onChange={(e) => this.setState({ cityTo: e.target.value })}
                value={this.state.cityTo}
                type="text"
                placeholder="City to" />
            </Form.Group>

            <Form.Group controlId="formBasicEmail">
              <Form.Label>Name</Form.Label>
              <Form.Control onChange={(e) => this.setState({ name: e.target.value })} value={this.state.name} type="text" placeholder="Name" />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Phonenumber</Form.Label>
              <Form.Control onChange={(e) => this.setState({ phoneNumber: e.target.value })} value={this.state.phoneNumber} type="number" placeholder="Phonenumber" />
            </Form.Group>
          </Form>


        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={(e) => {
            e.preventDefault();
            makeOrderCallback(this.state);
            handleCloseModal();
          }}>
            Make order
          </Button>
        </Modal.Footer>

      </Modal>
    )
  }
}

function ProductTable({ products, addToCartCallback }) {
  let productTable = products.map((product, index) => {
    return (
      <tr key={index}>
        <td> {product.brand} </td>
        <td> {product.size} </td>
        <td> {product.evo} </td>
        <td> {product.madeIn} </td>
        <td> {product.product} </td>
        <td> {product.price} </td>
        <td> <Button onClick={(event) => {
          event.preventDefault();
          addToCartCallback(product)
        }} >Add to cart</Button> </td>
      </tr>
    )
  })
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Brand</th>
          <th>Size</th>
          <th>Evo</th>
          <th>Made in</th>
          <th>Product name</th>
          <th>Price</th>
          <th>Order</th>
        </tr>
      </thead>
      <tbody>
        {productTable}
      </tbody>
    </Table>
  );
}

function BasketTable({ basket, clearBasketCallback }) {
  let totalBasketPrice = 0;
  let basketTable = basket.map((product, index) => {
    totalBasketPrice += product.price;
    return (
      <tr key={index}>
        <td>{product.brand}</td>
        <td>{product.product}</td>
        <td>{product.price}</td>
      </tr>
    )
  });

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {basketTable}
        </tbody>
      </Table>
      <h3>
        Total price: {totalBasketPrice}
      </h3>
      <Button onClick={clearBasketCallback}>Clear basket</Button>
    </div>
  );

}